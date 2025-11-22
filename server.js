require('dotenv').config(); // Carrega as senhas do arquivo .env
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURAÇÕES ---
app.use(cors()); // Permite que seu Front-end fale com o Back-end
app.use(express.json()); // Permite ler dados JSON enviados no login
app.use(express.static('.')); // Serve seus arquivos HTML/CSS (opcional, para teste local)

// --- DADOS DE ACESSO (MOCK POR ENQUANTO) ---
// Em produção, usaremos variáveis de ambiente
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "1234";

// --- ROTA 1: TESTE DE VIDA ---
app.get('/api/status', (req, res) => {
    res.json({ status: 'Online', message: 'Servidor Nordic operando.' });
});

// --- ROTA 2: LOGIN ---
app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;

    console.log(`Tentativa de login: ${user}`);

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        // Login Sucesso
        res.json({
            success: true,
            token: "TOKEN_SECRETO_TEMPORARIO", // Futuramente usaremos JWT
            message: "Acesso Autorizado."
        });
    } else {
        // Login Falha
        res.status(401).json({
            success: false,
            message: "Credenciais Inválidas."
        });
    }
});

// --- ROTA 3: GOOGLE DRIVE (EM BREVE) ---
app.get('/api/drive/files', (req, res) => {
    // Aqui vamos colocar a lógica do Google na próxima etapa
    res.json({ message: "Módulo Drive ainda não configurado." });
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});