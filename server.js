require('dotenv').config();
const pool = require('./config/db');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// O segredo assina os tokens. Quem souber esse valor consegue fabricar tokens falsos,
// por isso ele fica no .env (que NÃO vai pro GitHub) e nunca no código.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('Defina JWT_SECRET no arquivo .env antes de iniciar o servidor.');
    process.exit(1);
}
const JWT_EXPIRA = '2h';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })); // MEU ESPAÇO: margem para foto de até 2 MB codificada em Base64.

// Middleware: roda ANTES da rota e decide se a requisição pode seguir.
async function verificarToken(req, res, next) {
    const [tipo, token] = (req.headers.authorization || '').split(' ');
    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ status: 'erro', mensagem: 'Token ausente.' });
    }

    try {
        // 1) A assinatura confere e o token não expirou? (lança erro se não)
        const payload = jwt.verify(token, JWT_SECRET);

        // 2) A sessão ainda existe no banco e não foi encerrada?
        const sessao = await pool.query(
            'SELECT 1 FROM sessao WHERE jti = $1 AND revogado = FALSE AND expira_em > NOW()',
            [payload.jti]
        );
        if (sessao.rowCount === 0) {
            return res.status(401).json({ status: 'erro', mensagem: 'Sessão encerrada ou expirada.' });
        }

        req.usuario = {
            id: payload.idUsuario,
            idPerfil: payload.idPerfil,
            role: payload.role,
            jti: payload.jti
        };
        next();
    } catch (erro) {
        return res.status(401).json({ status: 'erro', mensagem: 'Token inválido ou expirado.' });
    }
}

// MEU ESPAÇO — endpoints autenticados; o id do perfil vem exclusivamente do JWT.
app.get('/api/perfil', verificarToken, async (req, res) => {
    try {
        const r = await pool.query(`SELECT u.nome, u.email, (p.foto_perfil IS NOT NULL) AS tem_foto
            FROM perfil p JOIN usuario u ON u.id_usuario = p.id_usuario WHERE p.id_perfil = $1`, [req.usuario.idPerfil]);
        if (!r.rowCount) return res.status(404).json({ mensagem: 'Perfil não encontrado.' });
        res.json(r.rows[0]);
    } catch (erro) { console.error('Consultar perfil:', erro); res.status(500).json({ mensagem: 'Erro ao consultar perfil.' }); }
});

app.put('/api/perfil', verificarToken, async (req, res) => {
    const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (nome.length < 2 || nome.length > 100 || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({ mensagem: 'Informe nome e e-mail válidos.' });
    try {
        const r = await pool.query('UPDATE usuario SET nome = $1, email = $2 WHERE id_usuario = $3 RETURNING nome, email', [nome,email,req.usuario.id]);
        if (!r.rowCount) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        res.json({ status: 'sucesso', ...r.rows[0] });
    } catch (erro) {
        if (erro.code === '23505') return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
        console.error('Editar perfil:', erro); res.status(500).json({ mensagem: 'Erro ao atualizar perfil.' });
    }
});

app.get('/api/perfil/foto', verificarToken, async (req, res) => {
    try {
        const r = await pool.query('SELECT foto_perfil, foto_tipo FROM perfil WHERE id_perfil = $1', [req.usuario.idPerfil]);
        if (!r.rowCount || !r.rows[0].foto_perfil) return res.sendStatus(404);
        res.set('Content-Type', r.rows[0].foto_tipo || 'image/jpeg');
        res.set('Cache-Control', 'private, no-store');
        res.send(r.rows[0].foto_perfil);
    } catch (erro) { console.error('Foto de perfil:', erro); res.status(500).json({ mensagem: 'Erro ao buscar foto.' }); }
});

app.put('/api/perfil/foto', verificarToken, express.json({limit:'5mb'}), async (req, res) => {
    const match = typeof req.body.foto === 'string' && /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(req.body.foto);
    if (!match) return res.status(400).json({ mensagem: 'Envie uma imagem JPG, PNG ou WebP válida.' });
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length || buffer.length > 2 * 1024 * 1024) return res.status(400).json({ mensagem: 'A imagem deve ter até 2 MB.' });
    const tipo = match[1];
    const assinaturaValida = (tipo === 'image/jpeg' && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
        || (tipo === 'image/png' && buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
        || (tipo === 'image/webp' && buffer.toString('ascii',0,4) === 'RIFF' && buffer.toString('ascii',8,12) === 'WEBP');
    if (!assinaturaValida) return res.status(400).json({ mensagem: 'O conteúdo não corresponde ao tipo da imagem.' });
    try {
        await pool.query('UPDATE perfil SET foto_perfil = $1, foto_tipo = $2 WHERE id_perfil = $3', [buffer,tipo,req.usuario.idPerfil]);
        res.json({ status:'sucesso', mensagem:'Foto atualizada.' });
    } catch (erro) { console.error('Salvar foto:',erro); res.status(500).json({ mensagem:'Erro ao salvar foto.' }); }
});

app.delete('/api/perfil/foto', verificarToken, async (req, res) => {
    try {
        await pool.query('UPDATE perfil SET foto_perfil = NULL, foto_tipo = NULL WHERE id_perfil = $1', [req.usuario.idPerfil]);
        res.json({ status:'sucesso', mensagem:'Foto padrão restaurada.' });
    } catch (erro) { console.error('Restaurar foto:',erro); res.status(500).json({ mensagem:'Erro ao restaurar foto.' }); }
});

const TABELAS_FAVORITOS = {
    cursos: { tabela:'curso_favorito', coluna:'id_curso', origem:'curso' },
    aulas: { tabela:'aula_favorita', coluna:'id_aula', origem:'aula' }
};
app.get('/api/favoritos', verificarToken, async (req,res) => {
    try {
        const [cursos,aulas] = await Promise.all([
            pool.query(`SELECT c.id_curso, c.nome FROM curso_favorito f JOIN curso c ON c.id_curso=f.id_curso WHERE f.id_perfil=$1 ORDER BY c.nome`,[req.usuario.idPerfil]),
            pool.query(`SELECT a.id_aula, a.id_curso, a.nome, c.nome AS curso_nome FROM aula_favorita f JOIN aula a ON a.id_aula=f.id_aula JOIN curso c ON c.id_curso=a.id_curso WHERE f.id_perfil=$1 ORDER BY a.nome`,[req.usuario.idPerfil])
        ]);
        res.json({ cursos:cursos.rows, aulas:aulas.rows });
    } catch (erro) { console.error('Listar favoritos:',erro); res.status(500).json({ mensagem:'Erro ao listar favoritos.' }); }
});
app.post('/api/favoritos/:tipo/:id', verificarToken, async (req,res) => {
    const config = TABELAS_FAVORITOS[req.params.tipo], id = Number(req.params.id);
    if (!config || !Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ mensagem:'Favorito inválido.' });
    try {
        const existe = await pool.query(`SELECT 1 FROM ${config.origem} WHERE ${config.coluna}=$1`,[id]);
        if (!existe.rowCount) return res.status(404).json({ mensagem:'Curso ou aula não encontrado.' });
        await pool.query(`INSERT INTO ${config.tabela} (id_perfil,${config.coluna}) VALUES ($1,$2) ON CONFLICT DO NOTHING`,[req.usuario.idPerfil,id]);
        res.status(201).json({status:'sucesso'});
    } catch (erro) { console.error('Adicionar favorito:',erro); res.status(500).json({ mensagem:'Erro ao favoritar.' }); }
});
app.delete('/api/favoritos/:tipo/:id', verificarToken, async (req,res) => {
    const config = TABELAS_FAVORITOS[req.params.tipo], id = Number(req.params.id);
    if (!config || !Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ mensagem:'Favorito inválido.' });
    try {
        await pool.query(`DELETE FROM ${config.tabela} WHERE id_perfil=$1 AND ${config.coluna}=$2`,[req.usuario.idPerfil,id]);
        res.json({status:'sucesso'});
    } catch (erro) { console.error('Remover favorito:',erro); res.status(500).json({ mensagem:'Erro ao remover favorito.' }); }
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

app.get('/api/categorias', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT id_categoria, nome AS nome_categoria FROM categoria_curso ORDER BY nome'
        );
        res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar categorias:', erro);
        res.status(500).json({
            status: 'erro',
            mensagem: 'Não foi possivel buscar categorias.'
        });
    }
});

app.post('/api/cadastro', async (req, res) => {
    const { nome, email, senha, cpf } = req.body;

    // Validação simples: nenhum campo pode chegar vazio
    if (!nome || !email || !senha || !cpf) {
        return res.status(400).json({ status: 'erro', mensagem: 'Todos os campos são obrigatórios.' });
    }

    // Nunca guardamos a senha em texto puro: guardamos só o hash (10 = custo do cálculo).
    const senhaHash = await bcrypt.hash(senha, 10);

    const client = await pool.connect(); // pega UMA conexão exclusiva do pool
    try {
        await client.query('BEGIN'); // inicia a transação

        const resultadoUsuario = await client.query(
            'INSERT INTO usuario (cpf, nome, email, senha) VALUES ($1, $2, $3, $4) RETURNING id_usuario',
            [cpf, nome, email, senhaHash]
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

        // compare() refaz o hash da senha digitada e confere com o hash guardado no banco.
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ status: 'erro', mensagem: 'E-mail ou senha inválidos.' });
        }

        let role = 'consumer';
        if (usuario.id_curador) role = 'curator';
        else if (usuario.id_profissional) role = 'professional';

        // jti = identificador único deste token. É ele que guardamos na tabela "sessao".
        const jti = crypto.randomUUID();
        const token = jwt.sign(
            { idUsuario: usuario.id_usuario, idPerfil: usuario.id_perfil, role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRA, jwtid: jti }
        );
        const { exp } = jwt.decode(token); // exp vem em segundos desde 1970

        await pool.query(
            'INSERT INTO sessao (jti, id_usuario, expira_em) VALUES ($1, $2, to_timestamp($3))',
            [jti, usuario.id_usuario, exp]
        );

        res.status(200).json({
            status: 'sucesso',
            token,
            usuario: { id: usuario.id_usuario, nome: usuario.nome, email: usuario.email, idPerfil: usuario.id_perfil },
            role: role
        });

    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ status: 'erro', mensagem: 'Não foi possível processar o login.' });
    }
});


// Logout de verdade: marca a sessão como revogada no banco.
// Mesmo que alguém ainda tenha o token, o middleware vai recusar.
app.post('/api/logout', verificarToken, async (req, res) => {
    try {
        await pool.query('UPDATE sessao SET revogado = TRUE WHERE jti = $1', [req.usuario.jti]);
        res.status(200).json({ status: 'sucesso', mensagem: 'Sessão encerrada.' });
    } catch (erro) {
        console.error('Erro no logout:', erro);
        res.status(500).json({ status: 'erro', mensagem: 'Não foi possível encerrar a sessão.' });
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



app.post('/api/posts', verificarToken, async (req, res) => {
    const { conteudo } = req.body;
    // O perfil vem do TOKEN (confiável), não do corpo da requisição (o cliente pode mentir).
    const id_perfil = req.usuario.idPerfil;

    if (!conteudo) {
        return res.status(400).json({ status: 'erro', mensagem: 'O conteúdo é obrigatório.' });
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

app.post('/api/cursos', verificarToken, async (req, res) => {
    // Só profissionais criam cursos. O papel vem do TOKEN, não do corpo.
    if (req.usuario.role !== 'professional') {
        return res.status(403).json({ status: 'erro', mensagem: 'Apenas profissionais podem criar cursos.' });
    }

    const { nome, descricao, tempo, id_categoria } = req.body;
    const id_perfil = req.usuario.idPerfil;

    if (!nome || !id_categoria) {
        return res.status(400).json({ status: 'erro', mensagem: 'Nome e categoria são obrigatórios.' });
    }

    if (nome.length > 40) {
        return res.status(400).json({ status: 'erro', mensagem: 'O nome deve ter no máximo 40 caracteres.' });
    }

    if (descricao && descricao.length > 300) {
        return res.status(400).json({ status: 'erro', mensagem: 'A descrição deve ter no máximo 300 caracteres.' });
    }

    try {
        const resultado = await pool.query(
            'INSERT INTO curso (nome, descricao, tempo, id_categoria, id_perfil) VALUES ($1, $2, $3, $4, $5) RETURNING id_curso',
            [nome, descricao || null, tempo || null, id_categoria, id_perfil]
        );
        res.status(201).json({ status: 'sucesso', id_curso: resultado.rows[0].id_curso });
    } catch (erro) {
        console.error('Erro ao criar curso:', erro);
        if (erro.code === '23503') {
            return res.status(400).json({ status: 'erro', mensagem: 'Categoria inexistente.' });
        }
        if (erro.code === '22007' || erro.code === '22P02') {
            return res.status(400).json({ status: 'erro', mensagem: 'Formato de tempo ou categoria inválido. Ex.: "10 hours".' });
        }
        res.status(500).json({ status: 'erro', mensagem: 'Não foi possível criar o curso.' });
    }
});






// abaixo é como conectar localmente, descomente e apague o Render para voltar
const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
    // Agora o console.log se adapta dinamicamente!
    if (process.env.PORT) {
        console.log(`Servidor rodando em produção na URL oficial!`);
    } else {
        console.log(`Servidor rodando localmente em http://localhost:${PORTA}`);
    }
});

// app.listen(PORTA, () => {
//     console.log(`Servidor rodando em http://localhost:${PORTA}`);
// });