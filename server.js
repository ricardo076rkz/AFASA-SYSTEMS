require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');


const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

app.get('/api/teste', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT NOW() AS agora');
        res.json({ status: 'conectado', hora: resultado.rows[0].agora });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ status: 'erro', mensagem: erro.message });

    }
});

app.get('/api/teste/texto-hora', async (req, res) => {
    try {
        const teste = await pool.query('SELECT NOW() AS agora');
        res.json({ status: 'Olá, Afasa!', hora: teste.rows[0].agora });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ status: 'erro', mensagem: erro.message });
    }
});

const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});