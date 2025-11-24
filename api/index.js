require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Importação Segura dos Modelos
// Isso evita que o servidor quebre se o arquivo não existir ainda
let User, File;
try {
    User = require('../models/User');
    File = require('../models/File');
} catch (e) {
    console.log("Aviso: Erro ao carregar modelos:", e);
}

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors());
// Aumentei o limite para 50mb para aguentar uploads de fotos de perfil
app.use(express.json({ limit: '50mb' }));
// Serve arquivos estáticos para rodar localmente
app.use(express.static(path.join(__dirname, '..')));

// --- CONEXÃO COM O BANCO DE DADOS (MONGODB) ---
const connectDB = async () => {
    // Se já estiver conectado, não reconecta (importante para serverless)
    if (mongoose.connection.readyState === 1) return;

    if (!process.env.MONGODB_URI) {
        console.log("⚠️ ERRO CRÍTICO: MONGODB_URI não definida no .env ou na Vercel!");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🔥 MongoDB Conectado!');

        // --- SEED ADMIN ---
        // Cria o usuário Admin automaticamente se o banco estiver vazio
        if (User) {
            const adminExists = await User.findOne({ username: process.env.ADMIN_USER });
            // Só cria se não existir E se as variáveis de ambiente estiverem definidas
            if (!adminExists && process.env.ADMIN_USER && process.env.ADMIN_PASS) {
                await User.create({
                    username: process.env.ADMIN_USER,
                    password: process.env.ADMIN_PASS,
                    role: 'admin',
                    displayName: 'Administrador',
                    avatar: '' // Avatar vazio por padrão
                });
                console.log(`👤 Usuário Admin criado: ${process.env.ADMIN_USER}`);
            }
        }
    } catch (error) {
        console.error('Erro Conexão Mongo:', error);
    }
};

// Inicia a conexão ao carregar o arquivo
connectDB();

// ==========================================================================
// ROTAS DA API
// ==========================================================================

// 1. Status do Servidor (Ping)
app.get('/api/status', (req, res) => {
    res.json({
        status: 'Online',
        db: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
        timestamp: new Date()
    });
});

// 2. Login
app.post('/api/login', async (req, res) => {
    const { user, pass } = req.body;
    try {
        await connectDB(); // Garante conexão

        if (!User) return res.status(500).json({ error: "Modelo User não carregado" });

        const foundUser = await User.findOne({ username: user });

        if (foundUser && foundUser.password === pass) {
            // Retorna dados seguros (sem senha)
            res.json({
                success: true,
                token: "TOKEN_SECURE_" + Date.now(),
                username: foundUser.username,
                displayName: foundUser.displayName || foundUser.username,
                avatar: foundUser.avatar,
                role: foundUser.role || 'user'
            });
        } else {
            res.status(401).json({ success: false, message: "Acesso Negado." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erro interno." });
    }
});

// --- ROTAS DE USUÁRIOS (GESTÃO) ---

// 3. Listar Todos os Usuários (Para o painel de Admin)
app.get('/api/users', async (req, res) => {
    try {
        await connectDB();
        // Retorna todos, mas remove o campo 'password' por segurança
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar usuários" });
    }
});

// 4. Criar Novo Usuário
app.post('/api/users', async (req, res) => {
    try {
        await connectDB();
        const { username, password, role, displayName } = req.body;

        // Verifica duplicidade
        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({ error: "Usuário já existe." });

        const newUser = await User.create({ username, password, role, displayName });
        res.json({ success: true, user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar usuário" });
    }
});

// 5. Deletar Usuário
app.delete('/api/users/:id', async (req, res) => {
    try {
        await connectDB();
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar usuário" });
    }
});

// 6. Atualizar Perfil Próprio (Nome e Foto)
app.put('/api/users/profile', async (req, res) => {
    try {
        await connectDB();
        const { username, displayName, avatar, password } = req.body;

        // Monta o objeto de atualização dinamicamente
        const updateData = { displayName };
        if (avatar) updateData.avatar = avatar; // Só atualiza se enviou foto
        if (password) updateData.password = password; // Só atualiza se enviou senha

        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            updateData,
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ error: "Usuário não encontrado" });

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
});

// --- ROTAS DE ARQUIVOS (FILE SYSTEM) ---

// 7. Listar Arquivos
app.get('/api/files', async (req, res) => {
    try {
        await connectDB();
        if (!File) return res.json([]);
        const files = await File.find().sort({ createdAt: -1 });
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar arquivos" });
    }
});

// 8. Salvar Arquivo/Link
app.post('/api/files', async (req, res) => {
    try {
        await connectDB();
        if (!File) return res.status(500).json({ error: "Modelo File não carregado" });

        const newFile = await File.create(req.body);
        res.json({ success: true, file: newFile });
    } catch (error) {
        res.status(500).json({ error: "Erro ao salvar arquivo" });
    }
});

// 9. Editar Nome do Arquivo
app.put('/api/files/:id', async (req, res) => {
    try {
        await connectDB();
        const updated = await File.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
        res.json({ success: true, file: updated });
    } catch (error) {
        res.status(500).json({ error: "Erro ao editar" });
    }
});

// 10. Deletar Arquivo
app.delete('/api/files/:id', async (req, res) => {
    try {
        await connectDB();
        await File.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar" });
    }
});

// --- INICIALIZAÇÃO HÍBRIDA ---
// Se rodar direto no Node (Local), abre a porta.
// Se for require (Vercel), exporta o app.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando localmente: http://localhost:${PORT}`);
    });
}

module.exports = app;