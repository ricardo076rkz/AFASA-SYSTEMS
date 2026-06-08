INSERT INTO usuario (cpf, nome, email, senha) VALUES
('11122233344', 'Maria Silva', 'maria.silva@email.com', 'senha123'),
('22233344455', 'João Santos', 'joao.santos@email.com', 'senha456'),
('33344455566', 'Carlos Mendes', 'carlos.mendes@email.com', 'senha789'),
('44455566677', 'Ricardo Silva', 'ricardo@novaroma.com', 'admin123'),
('55566677788', 'Rafael Oliveira', 'rafael@novaroma.com', 'admin456'),
('66677788899', 'Marcos Souza', 'marcos@novaroma.com', 'admin789'),
('77788899900', 'Giseli Lima', 'giseli@novaroma.com', 'admin000'),
('88899900011', 'Ana Costa', 'ana.costa@email.com', 'user123'),
('99900011122', 'Paulo Junior', 'paulo.jr@email.com', 'user456'),
('00011122233', 'Usuario Demo', 'demo@afasa.com', 'demo123');

INSERT INTO perfil (id_usuario, xp) VALUES
(1,1500),(2,800),(3,1200),(4,3000),(5,2500),
(6,2200),(7,2800),(8,450),(9,600),(10,750);

INSERT INTO consumidor (id_perfil) VALUES
(1),(2),(8),(9),(10),(3),(4),(5),(6),(7);

INSERT INTO profissional (id_perfil, descricao) VALUES
(1,'Especialista em hortas urbanas e temperos'),
(2,'Chef focado em gastronomia sustentável'),
(3,'Engenheiro Agrônomo com foco em permacultura'),
(4,'Desenvolvedor e entusiasta de agricultura'),
(5,'Consultor de hortas comunitárias'),
(6,'Pesquisador de solos e adubação orgânica'),
(7,'Especialista em Plantas Medicinais'),
(8,'Técnico em Hidroponia residencial'),
(9,'Educador ambiental'),
(10,'Instrutor de compostagem doméstica');

INSERT INTO curador (id_perfil) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10);

INSERT INTO categoria_curso (nome) VALUES
('Horta em Casa'),
('Compostagem'),
('Culinária Sustentável'),
('Hidroponia'),
('Controle de Pragas'),
('Frutíferas'),
('Adubação'),
('Iniciante'),
('Avançado'),
('Plantas Ornamentais');

INSERT INTO curso (nome, descricao, tempo, id_categoria) VALUES
('Como Montar Sua Horta em Casa','Passo a passo da escolha ao cultivo','05:00:03',1),
('Horta Orgânica em Casa','Técnicas de manejo orgânico','05:00:00',1),
('Cultivo de Tomates em Vasos','Guia completo para tomates','02:15:00',8),
('Horta Vertical DIY','Monte sua horta em pequenos espaços','03:30:00',8),
('Compostagem para Iniciantes','Transforme lixo em adubo','01:50:00',2),
('Módulo Fazendeiro','Gestão de campo e escala','10:00:00',9),
('Pesto Caseiro Master','Aprenda variações de pesto','01:00:00',3),
('Adubação Orgânica','Guia especializado de solos','02:00:00',7),
('Ervas Aromáticas','Cultive temperos o ano todo','04:20:00',1),
('Microgreens','Colheita rápida e nutritiva','01:30:00',4);

INSERT INTO aula (nome, duracao, id_curso) VALUES
('Escolha do Local','00:15:00',1),
('Preparação do Solo','00:20:00',1),
('Primeira Rega','00:10:00',1),
('Tipos de Sementes','00:12:00',2),
('Adubação Inicial','00:18:00',2),
('Vasos Ideais','00:15:00',3),
('Estruturas de Madeira','00:30:00',4),
('O Ciclo do Adubo','00:25:00',5),
('Manejo de Pragas','00:40:00',6),
('Colhendo Manjericão','00:05:00',7);

INSERT INTO post (conteudo, data, informacao, id_perfil) VALUES
('Minha primeira colheita de alface!','2024-05-25','Hortas',1),
('Receita de salada fresca da horta','2024-05-26','Pratos',2),
('Dúvida: Minhas folhas estão amareladas','2024-05-27','Hortas',8),
('Olha esse manjericão gigante!','2024-05-28','Hortas',3),
('Almoço de hoje 100% orgânico','2024-05-29','Pratos',1),
('Dica de vaso autoirrigável','2024-05-29','Hortas',10),
('Composteira funcionando a todo vapor','2024-05-20','Hortas',6),
('Colheita de morangos suspensos','2024-05-21','Hortas',9),
('Pesto fresco feito agora','2024-05-22','Pratos',2),
('Horta vertical finalizada!','2024-05-23','Hortas',3);

INSERT INTO planta (nome, descricao, categoria) VALUES
('Manjericão','Planta aromática para temperos','Ervas'),
('Tomate Cereja','Ideal para vasos e pequenos espaços','Frutos'),
('Alface','Fácil cultivo e crescimento rápido','Hortaliças'),
('Cebolinha','Resistente e perene','Temperos'),
('Hortelã','Planta invasora, melhor em vasos separados','Chás'),
('Morango','Cultivo em solo rico e drenado','Frutos'),
('Alecrim','Necessita de sol pleno e pouca água','Ervas'),
('Pimenta Malagueta','Planta de clima quente','Temperos'),
('Salsa','Rica em ferro, prefere meia sombra','Temperos'),
('Espada de São Jorge','Planta ornamental clássica','Ornamental');

INSERT INTO receita (data, status, valor) VALUES
('2024-05-20','Aprovado',234.10),
('2024-05-21','Aprovado',91.70),
('2024-05-22','Em Revisão',0.00),
('2024-05-23','Aprovado',150.00),
('2024-05-24','Rejeitado',0.00),
('2024-05-25','Aprovado',45.00),
('2024-05-26','Aprovado',120.50),
('2024-05-27','Em Revisão',0.00),
('2024-05-28','Aprovado',300.00),
('2024-05-29','Aprovado',10.00);

INSERT INTO avalia (data, motivo, status, pendencia, id_post) VALUES
('2024-05-25','Conteúdo excelente','Aprovado','Nenhuma',1),
('2024-05-26','Receita bem detalhada','Aprovado','Nenhuma',2),
('2024-05-27','Aguardando ajuste na foto','Pendente','Foto sem qualidade',3),
('2024-05-28','Spam detectado','Rejeitado','Informativo falso',4),
('2024-05-29','Informações imprecisas sobre toxicidade','Rejeitado','Necessita consulta veterinário',10),
('2024-05-10','Bom conteúdo','Aprovado','Nenhuma',5),
('2024-05-11','Linguagem imprópria','Rejeitado','Moderação necessária',6),
('2024-05-12','Conteúdo duplicado','Rejeitado','Já postado',7),
('2024-05-13','Dica muito útil','Aprovado','Nenhuma',8),
('2024-05-14','Falta referências','Pendente','Adicionar fonte',9);

INSERT INTO consumidor_curso (id_consumidor, id_curso) VALUES
(1,1),(1,2),(2,3),(3,4),(4,5),
(5,6),(6,7),(7,8),(8,9),(9,10);

INSERT INTO post_planta (id_post, id_planta) VALUES
(1,3),(2,1),(3,2),(4,1),(5,9),
(6,4),(7,5),(8,6),(9,1),(10,4);

INSERT INTO curso_planta (id_curso, id_planta) VALUES
(1,3),(1,4),(2,3),(2,9),(3,2),(4,1),(5,5),(6,6),(7,1),(8,7),(9,4),(9,1),(9,7),(10,3),(10,9);

INSERT INTO curador_curso (id_perfil, id_curso) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(8,8),(9,9),(10,10),(1,9),(2,7),(3,8),(4,1),(5,2);
