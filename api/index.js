require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // Necessário para caminhos de arquivo

// Tenta importar o modelo. Se falhar (erro de build), não quebra o app todo.
let User;
try {
    User = require('../models/User');
} catch (e) {
    console.log("Aviso: Modelo User não encontrado ou erro de caminho.", e);
}

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// ✅ CORREÇÃO PARA LOCALHOST: Serve os arquivos do site (HTML/CSS)
// __dirname = pasta 'api'. '..' = pasta raiz do projeto.
app.use(express.static(path.join(__dirname, '..')));

// --- CONEXÃO COM MONGODB ---
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) return;

        if (!process.env.MONGODB_URI) {
            console.log("⚠️ MONGODB_URI não definida no .env!");
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🔥 MongoDB Conectado!');

        if (User) {
            const adminExists = await User.findOne({ username: process.env.ADMIN_USER });
            if (!adminExists && process.env.ADMIN_USER && process.env.ADMIN_PASS) {
                await User.create({
                    username: process.env.ADMIN_USER,
                    password: process.env.ADMIN_PASS
                });
            }
        }
    } catch (error) {
        console.error('Erro Conexão Mongo:', error);
    }
};

connectDB();

// --- ROTAS ---
app.get('/api/status', (req, res) => {
    res.json({ status: 'Online', db: mongoose.connection.readyState === 1 ? 'ON' : 'OFF' });
});

app.post('/api/login', async (req, res) => {
    const { user, pass } = req.body;
    try {
        if (!User) throw new Error("Modelo de Usuário não carregado");

        const foundUser = await User.findOne({ username: user });
        if (foundUser && foundUser.password === pass) {
            res.json({ success: true, token: "TOKEN_" + Date.now(), message: "Acesso Autorizado." });
        } else {
            res.status(401).json({ success: false, message: "Acesso Negado." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erro interno: " + error.message });
    }
});

// --- INICIALIZAÇÃO LOCAL ---
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando: http://localhost:${PORT}`);
    });
}

module.exports = app;