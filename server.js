require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// ⚠️ A CORREÇÃO ESTÁ AQUI:
// Diz ao servidor para servir os ficheiros da pasta atual (index.html, style.css, etc)
app.use(express.static('.'));

// --- CONEXÃO COM MONGODB ---
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) return;

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🔥 MongoDB Conectado!');

        // --- SEED: CRIAÇÃO AUTOMÁTICA DO ADMIN ---
        const adminExists = await User.findOne({ username: process.env.ADMIN_USER });
        if (!adminExists && process.env.ADMIN_USER && process.env.ADMIN_PASS) {
            await User.create({
                username: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            });
            console.log(`👤 Usuário Admin (${process.env.ADMIN_USER}) criado automaticamente.`);
        }

    } catch (error) {
        console.error('Erro ao conectar MongoDB:', error);
    }
};

connectDB();

// --- ROTAS DA API ---

// 1. Status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'Online',
        db: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
    });
});

// 2. Login Real
app.post('/api/login', async (req, res) => {
    const { user, pass } = req.body;

    console.log(`🔒 Tentativa de login para: "${user}"`);

    try {
        const foundUser = await User.findOne({ username: user });

        if (foundUser && foundUser.password === pass) {
            console.log(`✅ SUCESSO: Usuário "${user}" logado.`);
            res.json({
                success: true,
                token: "TOKEN_" + Math.random().toString(36).substr(2),
                message: "Acesso Autorizado."
            });
        } else {
            console.log(`❌ FALHA: Senha incorreta para "${user}"`);
            res.status(401).json({
                success: false,
                message: "Acesso Negado. Credenciais Invalidas"
            });
        }
    } catch (error) {
        console.error(`⚠️ ERRO: ${error.message}`);
        res.status(500).json({ success: false, message: "Erro interno." });
    }
});

// 3. Drive (Futuro)
app.get('/api/drive/files', (req, res) => {
    res.json({ message: "Drive API em breve." });
});

// --- INICIALIZAÇÃO ---
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando localmente na porta http://localhost:${PORT}`);
    });
}

module.exports = app;