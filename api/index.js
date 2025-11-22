require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('../models/User'); // Garante que acha a pasta models

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- CONEXÃO COM MONGODB ---
const connectDB = async () => {
    try {
        // Verifica se já está conectado para não abrir múltiplas conexões (Serverless)
        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🔥 MongoDB Conectado!');

        // --- SEED ADMIN (Cria usuário se não existir) ---
        const adminExists = await User.findOne({ username: process.env.ADMIN_USER });
        if (!adminExists && process.env.ADMIN_USER && process.env.ADMIN_PASS) {
            await User.create({
                username: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            });
            console.log(`👤 Admin criado: ${process.env.ADMIN_USER}`);
        }

    } catch (error) {
        console.error('Erro Crítico MongoDB:', error);
    }
};

// Inicia a conexão
connectDB();

// --- ROTAS ---

// Rota de Teste
app.get('/api/status', (req, res) => {
    res.json({
        status: 'Online',
        environment: process.env.NODE_ENV || 'dev',
        db: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
    });
});

// Rota de Login
app.post('/api/login', async (req, res) => {
    const { user, pass } = req.body;

    // Garante conexão antes de tentar buscar (para casos de serverless frio)
    await connectDB();

    try {
        const foundUser = await User.findOne({ username: user });

        if (foundUser && foundUser.password === pass) {
            res.json({
                success: true,
                token: "TOKEN_SECURE_" + Date.now(),
                message: "Acesso Autorizado."
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Acesso Negado. Credenciais inválidas."
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erro interno no servidor." });
    }
});

// --- INICIALIZAÇÃO HÍBRIDA ---
// Se estiver rodando direto pelo Node (PC), abre a porta.
// Se estiver na Vercel, apenas exporta o app.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando localmente: http://localhost:${PORT}`);
    });
}

module.exports = app;