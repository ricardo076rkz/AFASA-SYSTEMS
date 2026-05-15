CREATE TABLE usuario (
    id_usuario ID PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE perfil (
    id_perfil ID PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_usuario INTEGER NOT NULL,
    xp INTEGER DEFAULT 0,
    CONSTRAINT fk_usuario_perfil FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE consumidor (
    id_consumidor ID PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_perfil INTEGER NOT NULL,
    CONSTRAINT fk_perfil_consumidor FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil) ON DELETE CASCADE
);

CREATE TABLE profissional (
    id_perfil INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    descricao TEXT,
    CONSTRAINT fk_perfil_profissional FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil) ON DELETE CASCADE
);

CREATE TABLE curador (
    id_perfil INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    CONSTRAINT fk_perfil_curador FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil) ON DELETE CASCADE
);

CREATE TABLE post (
    id_post ID PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    conteudo TEXT NOT NULL,
    data DATE DEFAULT CURRENT_DATE,
    informacao TEXT,
    id_perfil INTEGER NOT NULL,
    CONSTRAINT fk_perfil_post FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil)
);

CREATE TABLE categoria_curso (
    id_categoria ID  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE curso (
    id_curso ID PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    tempo INTERVAL,
    id_categoria INTEGER NOT NULL,
    CONSTRAINT fk_categoria_curso FOREIGN KEY (id_categoria) REFERENCES categoria_curso(id_categoria)
);


CREATE TABLE aula (
    id_aula ID PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(150) NOT NULL,
    duracao INTERVAL NOT NULL,
    id_curso INTEGER NOT NULL,
    CONSTRAINT fk_curso_aula FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON DELETE CASCADE
);

CREATE TABLE planta (
    id_planta ID PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50)
);


CREATE TABLE data_plantio (
    id_data ID PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    data DATE NOT NULL,
    id_planta INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    CONSTRAINT fk_planta_data FOREIGN KEY (id_planta) REFERENCES planta(id_planta),
    CONSTRAINT fk_usuario_data FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);


CREATE TABLE receita (
    id_receita ID PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    data DATE NOT NULL,
    status VARCHAR(20),
    valor DECIMAL(10,2) NOT NULL
);


CREATE TABLE avalia (
    id_avaliacao ID PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    data DATE DEFAULT CURRENT_DATE,
    motivo TEXT,
    status VARCHAR(20) NOT NULL,
    pendencia BOOLEAN DEFAULT TRUE,
    id_post INTEGER NOT NULL,
    CONSTRAINT fk_post_avalia FOREIGN KEY (id_post) REFERENCES post(id_post)
);