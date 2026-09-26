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
            mensagem: 'Não foi possivel buscar os posts.'
        });
    }
});


const QUERY_LISTAR_CURSOS = `
    SELECT
        curso.id_curso,
        curso.nome,
        curso.descricao,
        curso.tempo,
        categoria_curso.nome AS categoria
    FROM curso
    JOIN categoria_curso ON curso.id_categoria = categoria_curso.id_categoria
    ORDER BY curso.nome
`

app.get('/api/cursos', async (req, res) => {
    try {
        const resultado = await pool.query(QUERY_LISTAR_CURSOS);
        res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar cursos:', erro);
        res.status(500).json({
            status: 'erro',
            mensagem: 'Não foi possivel buscar cursos.'
        });
    }
});


app.post('/api/cadastro', async (req, res) => {
    const { nome, email, senha, cpf } = req.body;

    // Validação simples: nenhum campo pode chegar vazio
    if (!nome || !email || !senha || !cpf) {
        return res.status(400).json({ status: 'erro', mensagem: 'Todos os campos são obrigatórios.' });
    }

    const client = await pool.connect(); // pega UMA conexão exclusiva do pool
    try {
        await client.query('BEGIN'); // inicia a transação

        const resultadoUsuario = await client.query(
            'INSERT INTO usuario (cpf, nome, email, senha) VALUES ($1, $2, $3, $4) RETURNING id_usuario',
            [cpf, nome, email, senha]
        );
        const idUsuario = resultadoUsuario.rows[0].id_usuario;

        const resultadoPerfil = await client.query(
            'INSERT INTO perfil (id_usuario) VALUES ($1) RETURNING id_perfil',
            [idUsuario]
        );
        const idPerfil = resultadoPerfil.rows[0].id_perfil;

        await client.query(
            'INSERT INTO consumidor (id_perfil, pago) VALUES ($1, false)',
            [idPerfil]
        );

        await client.query('COMMIT'); // confirma tudo de uma vez
        res.status(201).json({ status: 'sucesso', mensagem: 'Conta criada com sucesso!' });

    } catch (erro) {
        await client.query('ROLLBACK'); // desfaz tudo se algo deu errado
        console.error('Erro ao cadastrar usuário:', erro);

        if (erro.code === '23505') { // código do PostgreSQL para violação de UNIQUE
            return res.status(409).json({ status: 'erro', mensagem: 'CPF ou e-mail já cadastrado.' });
        }
        res.status(500).json({ status: 'erro', mensagem: 'Não foi possível criar a conta.' });

    } finally {
        client.release(); // devolve a conexão pro pool, sempre
    }
});


app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ status: 'erro', mensagem: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const resultado = await pool.query(
            `SELECT
                usuario.id_usuario,
                usuario.nome,
                usuario.email,
                usuario.senha,
                perfil.id_perfil,
                consumidor.id_consumidor,
                profissional.id_perfil AS id_profissional,
                curador.id_perfil AS id_curador
            FROM usuario
            JOIN perfil ON usuario.id_usuario = perfil.id_usuario
            LEFT JOIN consumidor ON perfil.id_perfil = consumidor.id_perfil
            LEFT JOIN profissional ON perfil.id_perfil = profissional.id_perfil
            LEFT JOIN curador ON perfil.id_perfil = curador.id_perfil
            WHERE usuario.email = $1`,
            [email]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({ status: 'erro', mensagem: 'E-mail ou senha inválidos.' });
        }

        const usuario = resultado.rows[0];

        if (usuario.senha !== senha) {
            return res.status(401).json({ status: 'erro', mensagem: 'E-mail ou senha inválidos.' });
        }

        let role = 'consumer';
        if (usuario.id_curador) role = 'curator';
        else if (usuario.id_profissional) role = 'professional';

        res.status(200).json({
            status: 'sucesso',
            usuario: { id: usuario.id_usuario, nome: usuario.nome, email: usuario.email, idPerfil: usuario.id_perfil },
            role: role
        });

    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ status: 'erro', mensagem: 'Não foi possível processar o login.' });
    }
});


app.get('/api/plantas', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT id_planta, nome, descricao, categoria FROM planta ORDER BY nome');
        res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar plantas:', erro);
        res.status(500).json({ status: 'erro', mensagem: 'Não foi possível buscar as plantas.' });
    }
});


app.get('/api/cursos/:id/aulas', async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query(
            'SELECT id_aula, nome, duracao FROM aula WHERE id_curso = $1 ORDER BY id_aula',
            [id]
        );
        res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar aulas:', erro);
        res.status(500).json({ status: 'erro', mensagem: 'Não foi possível buscar as aulas.' });
    }
});



app.post('/api/posts', async (req, res) => {
    const { conteudo, id_perfil } = req.body;

    if (!conteudo || !id_perfil) {
        return res.status(400).json({ status: 'erro', mensagem: 'Conteúdo e perfil são obrigatórios.' });
    }

    try {
        const resultado = await pool.query(
            'INSERT INTO post (conteudo, id_perfil) VALUES ($1, $2) RETURNING id_post',
            [conteudo, id_perfil]
        );
        res.status(201).json({ status: 'sucesso', id_post: resultado.rows[0].id_post });
    } catch (erro) {
        console.error('Erro ao criar post:', erro);
        res.status(500).json({ status: 'erro', mensagem: 'Não foi possível criar o post.' });
    }
});




const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});