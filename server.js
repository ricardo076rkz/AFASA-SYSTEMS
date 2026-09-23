const pool = require('./config/db');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/teste', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT NOW() AS agora');
        res.json({ status: 'conectado', hora: resultado.rows[0].agora });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ status: 'erro', mensagem: erro.message });

    }
});

const QUERY_LISTAR_POSTS = `
    SELECT
        post.id_post,
        post.conteudo,
        post.data,
        post.informacao,
        usuario.id_usuario,
        usuario.nome as autor,
        usuario.email
    FROM post
    JOIN perfil ON post.id_perfil = perfil.id_perfil
    JOIN usuario ON perfil.id_usuario = usuario.id_usuario
    ORDER BY post.data DESC
`;

app.get('/api/posts', async (req, res) => {
    try {
        const resultado = await pool.query(QUERY_LISTAR_POSTS);
        res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar post:', erro);
        res.status(500).json({
            status: 'erro',
            mensagem: 'Não foi possivel busvar os posts.'
        });
    }
});

const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});