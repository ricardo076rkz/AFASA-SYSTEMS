// require('dotenv').config();
// const { Pool } = require('pg');

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: Number(process.env.DB_PORT),
// });

// module.exports = pool;

// codigo acima como era antes para conectar local. remova comentario dele e comente o de baixo para voltar.

// codigo a baixo para deploy. comente ele e descomente o de cima.

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Permite que a conexão segura com o Render funcione
    }
});

module.exports = pool;
