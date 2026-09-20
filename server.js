const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');


const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'afasa_db',
    password: '433088',
    port: 5432,
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

const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});