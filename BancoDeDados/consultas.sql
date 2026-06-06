SELECT id_usuario, cpf, email, senha FROM usuario;
SELECT id_consumidor FROM consumidor;
SELECT motivo, status, pendencia FROM avalia;
SELECT * FROM aula;
SELECT * FROM profissional;
SELECT * FROM post;



SELECT u.nome, po.conteudo, po.informacao 
FROM usuario u  
INNER JOIN post po 
ON u.id_usuario = po.id_post;

SELECT u.nome, p.xp
FROM usuario u
INNER JOIN perfil p 
ON u.id_usuario = p.id_perfil;

SELECT u.nome, p.conteudo, p.data 
FROM usuario u 
INNER JOIN post p
ON u.id_usuario = p.id_post;

SELECT c.nome, c.descricao, c.tempo, a.nome, a.duracao 
FROM curso c 
LEFT JOIN aula a 
ON c.id_curso = a.id_aula;

SELECT a.nome, a.duracao, c.nome 
FROM aula a 
RIGHT JOIN curso c 
ON c.id_curso = a.id_aula;

