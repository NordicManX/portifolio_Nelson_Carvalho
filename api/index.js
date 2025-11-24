require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Modelos
let User, File;
try {
    User = require('../models/User');
    File = require('../models/File');
} catch (e) {
    console.log("Erro ao carregar modelos:", e);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return;
    if (!process.env.MONGODB_URI) return console.log("⚠️ SEM MONGODB_URI");

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🔥 MongoDB Conectado!');

        // Seed Admin
        if (User) {
            const adminExists = await User.findOne({ username: process.env.ADMIN_USER });
            if (!adminExists && process.env.ADMIN_USER && process.env.ADMIN_PASS) {
                await User.create({
                    username: process.env.ADMIN_USER,
                    password: process.env.ADMIN_PASS,
                    role: 'admin' // Garante que o principal é admin
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
        await connectDB();
        const foundUser = await User.findOne({ username: user });

        if (foundUser && foundUser.password === pass) {
            res.json({
                success: true,
                token: "TOKEN_" + Date.now(),
                username: foundUser.username, // Envia o nome
                role: foundUser.role || 'user' // Envia o nível (admin ou user)
            });
        } else {
            res.status(401).json({ success: false, message: "Acesso Negado." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Erro interno." });
    }
});

// Rotas de Arquivos
app.get('/api/files', async (req, res) => {
    try {
        await connectDB();
        const files = await File.find().sort({ createdAt: -1 });
        res.json(files);
    } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/files', async (req, res) => {
    try {
        await connectDB();
        const newFile = await File.create(req.body);
        res.json({ success: true, file: newFile });
    } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.put('/api/files/:id', async (req, res) => {
    try {
        await connectDB();
        const updated = await File.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
        res.json({ success: true, file: updated });
    } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.delete('/api/files/:id', async (req, res) => {
    try {
        await connectDB();
        await File.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Erro" }); }
});

if (require.main === module) {
    app.listen(PORT, () => { console.log(`🚀 Server rodando: http://localhost:${PORT}`); });
}

module.exports = app;