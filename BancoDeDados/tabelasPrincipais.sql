-- qualquer coisa
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS perfil (
    id_perfil INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    xp INT DEFAULT 0,
    CONSTRAINT fk_usuario_perfil FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS consumidor (
    id_consumidor INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_perfil INT NOT NULL,
    CONSTRAINT fk_perfil_consumidor FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS profissional (
    id_perfil INT PRIMARY KEY,
    descricao TEXT,
    CONSTRAINT fk_perfil_prof FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS curador (
    id_perfil INT PRIMARY KEY,
    CONSTRAINT fk_perfil_curador FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS post (
    id_post INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conteudo TEXT NOT NULL,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    informacao TEXT,
    id_perfil INT NOT NULL,
    CONSTRAINT fk_perfil_post FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil)
);


CREATE TABLE IF NOT EXISTS categoria_curso (
    id_categoria INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);


CREATE TABLE IF NOT EXISTS curso (
    id_curso INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    tempo INTERVAL,
    id_categoria INT NOT NULL,
    CONSTRAINT fk_cat_curso FOREIGN KEY (id_categoria) REFERENCES categoria_curso(id_categoria)
);


CREATE TABLE IF NOT EXISTS aula (
    id_aula INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    duracao INTERVAL NOT NULL,
    id_curso INT NOT NULL,
    CONSTRAINT fk_curso_aula FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS planta (
    id_planta INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50)
);


CREATE TABLE IF NOT EXISTS data_plantio (
    id_data INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    data DATE NOT NULL,
    id_planta INT NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_planta_data FOREIGN KEY (id_planta) REFERENCES planta(id_planta),
    CONSTRAINT fk_user_data FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);


CREATE TABLE IF NOT EXISTS receita (
    id_receita INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    data DATE NOT NULL,
    status VARCHAR(20),
    valor DECIMAL(10,2) NOT NULL
);


CREATE TABLE IF NOT EXISTS avalia (
    id_avaliacao INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    motivo TEXT,
    status VARCHAR(20) NOT NULL,
    pendencia BOOLEAN DEFAULT TRUE,
    id_post INT NOT NULL,
    CONSTRAINT fk_post_avalia FOREIGN KEY (id_post) REFERENCES post(id_post)
);


CREATE TABLE IF NOT EXISTS consumidor_curso (
    id_consumidor INT NOT NULL,
    id_curso INT NOT NULL,

    CONSTRAINT pk_consumidor_curso PRIMARY KEY (id_consumidor, id_curso),

    CONSTRAINT fk_consumidor_curso_consumidor FOREIGN KEY (id_consumidor) REFERENCES consumidor(id_consumidor) ON DELETE CASCADE,

    CONSTRAINT fk_consumidor_curso_curso FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_planta (
    id_post INT NOT NULL,
    id_planta INT NOT NULL,

CONSTRAINT pk_post_planta 
    PRIMARY KEY (id_post, id_planta),

CONSTRAINT fk_post_planta_post 
    FOREIGN KEY (id_post) 
    REFERENCES post(id_post) 
    ON DELETE CASCADE,

CONSTRAINT fk_post_planta_planta 
    FOREIGN KEY (id_planta) 
    REFERENCES planta(id_planta) 
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aula_curso (
    id_aula INT NOT NULL,
    id_curso INT NOT NULL,

CONSTRAINT pk_aula_curso 
    PRIMARY KEY (id_aula, id_planta),

CONSTRAINT fk_aula_curso_aula
    FOREIGN KEY (id_aula) 
    REFERENCES post(id_aula) 
    ON DELETE CASCADE,

CONSTRAINT fk_aula_curso_curso
    FOREIGN KEY (id_curso) 
    REFERENCES planta(id_curso) 
    ON DELETE CASCADE
);

-- Giseli esteve aqui 