require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Configuração Express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..')));

// --- CARREGAMENTO DE MODELOS (COM PROTEÇÃO) ---
let User, File;
try {
    User = require('../models/User');
    File = require('../models/File');
} catch (e) {
    console.error("CRÍTICO: Erro ao carregar modelos (User/File). Verifique se a pasta 'models' subiu para o GitHub.", e);
}

// --- CONEXÃO COM MONGODB (ROBUSTA) ---
const connectDB = async () => {
    // 1. Se já conectou, reaproveita (Serverless)
    if (mongoose.connection.readyState === 1) return;

    // 2. Verifica se tem a senha
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI não definida nas Variáveis de Ambiente!");
    }

    // 3. Tenta conectar com Timeout de 5s (para não travar a Vercel)
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000 // Falha rápido se o IP estiver bloqueado
    });
    console.log('🔥 MongoDB Conectado!');

    // 4. Seed Admin (Só se conectou e tem modelos)
    if (User) {
        const adminExists = await User.findOne({ username: process.env.ADMIN_USER });
        if (!adminExists && process.env.ADMIN_USER && process.env.ADMIN_PASS) {
            await User.create({
                username: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS,
                role: 'admin',
                displayName: 'Administrador'
            });
        }
    }
};

// --- ROTA DE LOGIN (COM TRATAMENTO DE ERRO 500) ---
app.post('/api/login', async (req, res) => {
    try {
        // 1. Verifica Modelos
        if (!User) {
            throw new Error("Arquivos de Modelo (User.js) não encontrados no servidor.");
        }

        // 2. Conecta no Banco
        await connectDB();

        const { user, pass } = req.body;
        const foundUser = await User.findOne({ username: user });

        if (foundUser && foundUser.password === pass) {
            res.json({
                success: true,
                token: "TOKEN_" + Date.now(),
                username: foundUser.username,
                displayName: foundUser.displayName || foundUser.username,
                avatar: foundUser.avatar,
                role: foundUser.role || 'user'
            });
        } else {
            res.status(401).json({ success: false, message: "Acesso Negado. Credenciais Inválidas." });
        }
    } catch (error) {
        console.error("Erro no Login:", error.message);
        // Retorna JSON mesmo no erro, para o seu site não travar com "Unexpected token A"
        res.status(500).json({
            success: false,
            message: "Erro no Servidor: " + error.message
        });
    }
});

// --- OUTRAS ROTAS (Arquivos, Usuários, Status) ---
// (Mantenha as outras rotas iguais, ou use o bloco abaixo simplificado)

app.get('/api/status', (req, res) => {
    res.json({ status: 'Online', db: mongoose.connection.readyState });
});

// Rotas genéricas protegidas por try/catch do banco
const handleDbOp = (fn) => async (req, res) => {
    try {
        await connectDB();
        if (!File || !User) throw new Error("Modelos não carregados");
        await fn(req, res);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

app.get('/api/files', handleDbOp(async (req, res) => {
    const files = await File.find().sort({ createdAt: -1 });
    res.json(files);
}));

app.post('/api/files', handleDbOp(async (req, res) => {
    const newFile = await File.create(req.body);
    res.json({ success: true, file: newFile });
}));

app.delete('/api/files/:id', handleDbOp(async (req, res) => {
    await File.findByIdAndDelete(req.params.id);
    res.json({ success: true });
}));

app.put('/api/files/:id', handleDbOp(async (req, res) => {
    await File.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.json({ success: true });
}));

// Rotas de Usuários
app.get('/api/users', handleDbOp(async (req, res) => {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
}));

app.post('/api/users', handleDbOp(async (req, res) => {
    const { username } = req.body;
    if (await User.findOne({ username })) return res.status(400).json({ error: "Já existe" });
    await User.create(req.body);
    res.json({ success: true });
}));

app.delete('/api/users/:id', handleDbOp(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
}));

app.put('/api/users/profile', handleDbOp(async (req, res) => {
    const { username, displayName, avatar, password } = req.body;
    const updateData = { displayName };
    if (avatar) updateData.avatar = avatar;
    if (password) updateData.password = password;
    const updated = await User.findOneAndUpdate({ username }, updateData, { new: true });
    res.json({ success: true, user: updated });
}));


// Inicialização Local
if (require.main === module) {
    app.listen(PORT, () => { console.log(`🚀 Servidor rodando: http://localhost:${PORT}`); });
}

module.exports = app;