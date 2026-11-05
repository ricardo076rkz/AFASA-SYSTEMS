/* AFASA: perfil, foto e favoritos. Ver ALTERACOES_MEU_ESPACO.md. */
(() => {
    const $ = id => document.getElementById(id);
    const temToken = () => Boolean(localStorage.getItem('token'));
    let perfilAtual = null;
    let favoritos = { cursos: [], aulas: [] };
    let fotoObjectURL = null;
    const esc = texto => String(texto ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const aviso = (mensagem, erro = false) => {
        const el = $('mensagem-editar-perfil');
        if (el) { el.textContent = mensagem; el.className = 'mensagem-perfil ' + (erro ? 'erro' : 'sucesso'); }
    };
    const mensagemErro = erro => {
        const status = erro.response?.status;
        if (status === 401) return 'Sessão expirada. Saia e entre novamente na sua conta.';
        if (status === 404) return 'Rota não encontrada na API. Inicie o servidor atualizado (ou publique o backend no Render).';
        if (status === 413) return 'Imagem grande demais para o servidor. Escolha uma foto menor.';
        if (!erro.response) return 'Não foi possível acessar a API. Verifique se o servidor está ligado.';
        return erro.response.data?.mensagem || 'Não foi possível concluir a operação.';
    };
    function mostrarFoto(elemento, url, nome) {
        if (!elemento) return;
        elemento.replaceChildren();
        if (url) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Foto de perfil';
            elemento.append(img);
        } else elemento.textContent = (nome || 'U').trim().charAt(0).toUpperCase();
    }
    async function obterFoto() {
        if (fotoObjectURL) { URL.revokeObjectURL(fotoObjectURL); fotoObjectURL = null; }
        if (!perfilAtual?.tem_foto) return null;
        const resposta = await api.get('/perfil/foto', { responseType: 'blob' });
        fotoObjectURL = URL.createObjectURL(resposta.data);
        return fotoObjectURL;
    }
    async function atualizarPerfil() {
        if (!temToken()) {
            const dados = $('meu-espaco-dados');
            if (dados) dados.textContent = 'Entre na sua conta para visualizar seus dados.';
            return;
        }
        try {
            const resposta = await api.get('/perfil');
            perfilAtual = resposta.data;
            localStorage.setItem('userNome', perfilAtual.nome);
            let foto = null;
            try { foto = await obterFoto(); } catch (erro) { console.error("Erro ao carregar foto:", erro); }
            const nome = $('user-profile-name');
            if (nome) nome.textContent = perfilAtual.nome;
            mostrarFoto($('user-profile-avatar'), foto, perfilAtual.nome);
            mostrarFoto($('preview-foto-perfil'), foto, perfilAtual.nome);
            if ($('editar-nome')) $('editar-nome').value = perfilAtual.nome;
            if ($('editar-email')) $('editar-email').value = perfilAtual.email;
            const dados = $('meu-espaco-dados');
            if (dados) {
                dados.replaceChildren();
                for (const [rotulo, valor] of [['Nome completo', perfilAtual.nome], ['E-mail', perfilAtual.email]]) {
                    const linha = document.createElement('div');
                    linha.className = 'dados-conta-linha';
                    const titulo = document.createElement('span');
                    titulo.className = 'dados-conta-rotulo';
                    titulo.textContent = rotulo;
                    const conteudo = document.createElement('strong');
                    conteudo.textContent = valor;
                    linha.append(titulo, conteudo);
                    dados.append(linha);
                }
                dados.classList.remove('erro-carregamento');
            }
        } catch (erro) {
            console.error('Erro ao consultar perfil:', erro);
            const dados = $('meu-espaco-dados');
            if (dados) {
                dados.textContent = mensagemErro(erro);
                dados.classList.add('erro-carregamento');
            }
            aviso(mensagemErro(erro), true);
        }
    }
    function instalarPerfil() {
        if (!$('user-profile-avatar')) return;
        const botoes = [...document.querySelectorAll('button, a, .stat-card')];
        const editarExistente = botoes.find(el => el.textContent?.includes('Editar Perfil'));
        if (editarExistente) {
            editarExistente.setAttribute('role', 'button');
            editarExistente.tabIndex = 0;
            editarExistente.addEventListener('click', e => { e.preventDefault(); showModal('editar-perfil-modal'); });
            editarExistente.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showModal('editar-perfil-modal'); } });
        } else {
            const btn = document.createElement('button');
            btn.textContent = '✏️ Editar Perfil';
            btn.className = 'btn-salvar-perfil';
            btn.onclick = () => showModal('editar-perfil-modal');
            $('user-profile-avatar').after(btn);
        }
        const form = $('form-editar-perfil');
        if (!form) return;
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = form.querySelector('[type=submit]');
            btn.disabled = true;
            aviso('Salvando...');
            try {
                await api.put('/perfil', { nome: $('editar-nome').value, email: $('editar-email').value });
                await atualizarPerfil();
                aviso('Informações atualizadas com sucesso!');
            } catch (erro) { aviso(mensagemErro(erro), true); }
            finally { btn.disabled = false; }
        });
        $('foto-perfil-input').addEventListener('change', async e => {
            const arquivo = e.target.files[0];
            if (!arquivo) return;
            if (!['image/jpeg','image/png','image/webp'].includes(arquivo.type) || arquivo.size > 2 * 1024 * 1024) {
                aviso('Selecione JPG, PNG ou WebP com até 2 MB.', true); e.target.value = ''; return;
            }
            try {
                const dataUrl = await new Promise((resolve,reject) => {
                    const leitor = new FileReader();
                    leitor.onload = () => resolve(leitor.result);
                    leitor.onerror = reject;
                    leitor.readAsDataURL(arquivo);
                });
                await api.put('/perfil/foto', { foto: dataUrl });
                await atualizarPerfil();
                aviso('Foto alterada com sucesso!');
            } catch (erro) { aviso(mensagemErro(erro), true); }
            finally { e.target.value = ''; }
        });
        $('btn-restaurar-foto').addEventListener('click', async () => {
            try { await api.delete('/perfil/foto'); await atualizarPerfil(); aviso('Foto padrão restaurada!'); }
            catch (erro) { aviso(mensagemErro(erro), true); }
        });
        atualizarPerfil();
    }
    async function buscarFavoritos() {
        if (!temToken()) return;
        try {
            favoritos = (await api.get('/favoritos')).data;
            for (const tipo of ['cursos', 'aulas']) {
                const el = $(`favoritos-${tipo}`);
                if (el) delete el.dataset.erro;
            }
        }
        catch (erro) {
            console.error('Erro ao buscar favoritos', erro);
            favoritos = { cursos: [], aulas: [] };
            for (const tipo of ['cursos', 'aulas']) {
                const el = $(`favoritos-${tipo}`);
                if (el) { el.textContent = mensagemErro(erro); el.dataset.erro = 'true'; }
            }
        }
    }
    function ehFavorito(tipo, id) {
        return favoritos[tipo]?.some(item => Number(item[tipo === 'cursos' ? 'id_curso' : 'id_aula']) === Number(id));
    }
    async function alternarFavorito(tipo, id, botao) {
        if (!temToken()) { alert('Faça login para favoritar.'); return; }
        botao.disabled = true;
        try {
            if (ehFavorito(tipo,id)) await api.delete(`/favoritos/${tipo}/${id}`);
            else await api.post(`/favoritos/${tipo}/${id}`);
            await buscarFavoritos();
            desenharBotoes();
            desenharLista();
        } catch (erro) { alert(mensagemErro(erro)); }
        finally { botao.disabled = false; }
    }
    function criarBotao(tipo, id) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'favorito-botao';
        botao.dataset.tipoFavorito = tipo;
        botao.dataset.idFavorito = id;
        botao.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); alternarFavorito(tipo,id,botao); });
        return botao;
    }
    function desenharBotoes() {
        document.querySelectorAll('[data-tipo-favorito]').forEach(botao => {
            const ativo = ehFavorito(botao.dataset.tipoFavorito,botao.dataset.idFavorito);
            botao.classList.toggle('ativo',ativo);
            botao.textContent = ativo ? '★ Favoritado' : '☆ Favoritar';
            botao.setAttribute('aria-pressed',String(ativo));
        });
    }
    function desenharLista() {
        for (const tipo of ['cursos','aulas']) {
            const container = $(`favoritos-${tipo}`);
            if (!container) continue;
            if (container.dataset.erro === 'true') continue;
            container.replaceChildren();
            const itens = favoritos[tipo] || [];
            if (!itens.length) { container.textContent = `Nenhum${tipo === 'aulas' ? 'a aula' : ' curso'} favorito ainda.`; continue; }
            itens.forEach(item => {
                const id = tipo === 'cursos' ? item.id_curso : item.id_aula;
                const linha = document.createElement('div');
                linha.className = 'favorito-item';
                const link = document.createElement('a');
                link.href = `course.html?id=${tipo === 'cursos' ? id : item.id_curso}`;
                link.textContent = tipo === 'cursos' ? item.nome : `${item.nome} (${item.curso_nome})`;
                linha.append(link, criarBotao(tipo,id));
                container.append(linha);
            });
            desenharBotoes();
        }
    }
    function instalarBotoes() {
        if (!temToken()) return;
        // Cursos são criados dinamicamente pelo carregarCursos() existente.
        document.querySelectorAll('.cursos-dinamicos .course-card[href*="id="]').forEach(card => {
            if (card.nextElementSibling?.matches('[data-tipo-favorito]')) return;
            const id = new URL(card.href,location.href).searchParams.get('id');
            if (id && /^\d+$/.test(id)) { const botao = criarBotao('cursos',id); card.after(botao); }
        });
        const idCurso = new URLSearchParams(location.search).get('id');
        if (idCurso && /^\d+$/.test(idCurso)) {
            const aulas = $('aulas-container');
            if (aulas) {
                aulas.querySelectorAll('.course-card').forEach(card => {
                    if (card.querySelector('[data-tipo-favorito]')) return;
                    // O id da aula vem da API, sem depender da ordem dos cards.
                    const id = card.dataset.idAula;
                    if (id) card.append(criarBotao('aulas',id));
                });
                const alvo = $('botao-favoritar-curso');
                if (!alvo) {
                    const botao = criarBotao('cursos',idCurso);
                    botao.id = 'botao-favoritar-curso';
                    aulas.before(botao);
                }
            }
        }
        desenharBotoes();
    }
    document.addEventListener('DOMContentLoaded', async () => {
        instalarPerfil();
        await buscarFavoritos();
        desenharLista();
        instalarBotoes();
        // O roteiro.js desenha cards após carregar a API; acompanhar a inserção.
        const observer = new MutationObserver(() => instalarBotoes());
        document.querySelectorAll('.cursos-dinamicos, #aulas-container').forEach(container => observer.observe(container,{childList:true}));
    });
})();
