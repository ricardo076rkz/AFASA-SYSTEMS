// Password Toggle
function togglePassword(inputId) {
    try {
        const input = document.getElementById(inputId);
        if (!input) return;

        const button = input.nextElementSibling;

        if (input.type === 'password') {
            input.type = 'text';
            if (button) button.textContent = '🙈';
        } else {
            input.type = 'password';
            if (button) button.textContent = '👁️';
        }
    } catch (error) {
        console.error('Error in togglePassword:', error);
    }
}

// Search Functionality - Enhanced
function toggleSearch() {
    try {
        const searchContainer = document.getElementById('search-container');
        if (searchContainer) {
            searchContainer.classList.toggle('hidden');
            if (!searchContainer.classList.contains('hidden')) {
                const searchInput = document.getElementById('course-search');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.value = '';
                    // Reset all courses to visible
                    document.querySelectorAll('.course-card').forEach(course => {
                        course.style.display = 'block';
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error in toggleSearch:', error);
    }
}

function searchCourses() {
    try {
        const query = document.getElementById('course-search')?.value.toLowerCase() || '';
        const courses = document.querySelectorAll('.course-card');
        let foundCount = 0;

        courses.forEach(course => {
            const title = course.querySelector('.course-title')?.textContent.toLowerCase() || '';
            const meta = course.querySelector('.course-meta')?.textContent.toLowerCase() || '';

            if (title.includes(query) || meta.includes(query) || query === '') {
                course.style.display = 'block';
                foundCount++;
                // Add highlight animation
                course.style.animation = 'fadeIn 0.3s ease';
            } else {
                course.style.display = 'none';
            }
        });

        // Show no results message
        let noResultsMsg = document.getElementById('no-results-message');
        if (foundCount === 0 && query !== '') {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'no-results-message';
                noResultsMsg.style.cssText = 'text-align: center; padding: 40px 20px; color: var(--gray);';
                noResultsMsg.innerHTML = `
                    <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                    <div style="font-size: 18px; margin-bottom: 8px;">Nenhum curso encontrado</div>
                    <div style="font-size: 14px;">Tente buscar com outros termos</div>
                `;
                document.querySelector('.section')?.appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
        } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    } catch (error) {
        console.error('Error in searchCourses:', error);
    }
}

// Clear search
function clearSearch() {
    try {
        const searchInput = document.getElementById('course-search');
        if (searchInput) {
            searchInput.value = '';
            searchCourses();
            const clearBtn = document.getElementById('clear-search-btn');
            if (clearBtn) clearBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error in clearSearch:', error);
    }
}

// Modal Functions
function showModal(modalId) {
    try {
        console.log('showModal called with:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('Modal opened:', modalId);
        } else {
            console.error('Modal not found:', modalId);
        }
    } catch (error) {
        console.error('Error in showModal:', error);
    }
}

function closeModal(modalId) {
    try {
        console.log('closeModal called with:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            console.log('Modal closed:', modalId);
        }
    } catch (error) {
        console.error('Error in closeModal:', error);
    }
}

// FAQ Toggle
function toggleFAQ(button) {
    try {
        const faqItem = button.closest('.faq-item');
        const isExpanded = faqItem.classList.contains('expanded');

        // Close all other FAQs
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('expanded');
        });

        // Toggle current FAQ
        if (!isExpanded) {
            faqItem.classList.add('expanded');
        }
    } catch (error) {
        console.error('Error in toggleFAQ:', error);
    }
}

// Post Filtering
function filterPosts(category) {
    try {
        const posts = document.querySelectorAll('.post-card');
        const buttons = document.querySelectorAll('.filter-btn');

        // Update active button
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Filter posts
        posts.forEach(post => {
            if (category === 'todos') {
                post.style.display = 'block';
            } else if (category === 'pratos' && post.dataset.category === 'prato') {
                post.style.display = 'block';
            } else if (category === 'hortas' && post.dataset.category === 'horta') {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Error in filterPosts:', error);
    }
}

// Like Toggle
function toggleLike(button) {
    try {
        button.classList.toggle('liked');
        const countSpan = button.querySelector('span:last-child');
        if (!countSpan) return;

        let count = parseInt(countSpan.textContent);

        if (button.classList.contains('liked')) {
            countSpan.textContent = count + 1;
        } else {
            countSpan.textContent = count - 1;
        }
    } catch (error) {
        console.error('Error in toggleLike:', error);
    }
}

// Create Post
async function createPost(e) {
    e.preventDefault();
    const botao = e.currentTarget.querySelector('button[type="submit"]');
    if (botao.disabled) return;

    const conteudo = document.getElementById('post-descricao').value.trim();
    if (!conteudo) {
        alert('Escreva o conteúdo do post.');
        return;
    }

    botao.disabled = true;
    try {
        await api.post('/posts', { conteudo });
        alert('Post publicado com sucesso!');
        window.location.href = 'community.html';
    } catch (erro) {
        if (!tratarSessaoExpirada(erro)) {
            alert(mensagemErroApi(erro, 'Não foi possível publicar o post.'));
        }
    } finally {
        botao.disabled = false;
    }
}

// Carregar categorias no <select> da tela de criar curso (GET /api/categorias)
async function carregarCategorias() {
    const select = document.getElementById('curso-categoria');
    if (!select) return;

    try {
        const response = await api.get('/categorias');
        response.data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id_categoria;
            option.textContent = cat.nome_categoria;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        alert('Não foi possível carregar as categorias.');
    }
}

// Create Curso (POST /api/cursos) - só profissional
async function criarCurso(e) {
    e.preventDefault();
    const botao = document.getElementById('btn-criar-curso');
    const nome = document.getElementById('curso-nome').value.trim();
    const descricao = document.getElementById('curso-descricao').value.trim();
    const horas = document.getElementById('curso-tempo').value;
    const id_categoria = document.getElementById('curso-categoria').value;

    botao.disabled = true;
    botao.textContent = '⏳ SALVANDO...';

    try {
        // O token vai sozinho no cabeçalho (interceptor do api). O papel é conferido no servidor.
        await api.post('/cursos', {
            nome,
            descricao,
            tempo: horas ? `${horas} hours` : null,
            id_categoria
        });
        alert('Curso criado com sucesso! 🎉');
        window.location.href = 'profissional-dashboard.html';
    } catch (error) {
        console.error('Erro ao criar curso:', error);
        if (error.response && error.response.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = '../login.html';
            return;
        }
        const mensagem = (error.response && error.response.data && error.response.data.mensagem)
            || 'Não foi possível criar o curso.';
        alert(mensagem);
        botao.disabled = false;
        botao.textContent = '✅ CRIAR CURSO';
    }
}

// Create Receita: publica como post (POST /api/posts), o mesmo que o createPost usa
async function criarReceita(e) {
    e.preventDefault();
    const botao = document.getElementById('btn-publicar-receita');
    const conteudo = document.getElementById('receita-descricao').value.trim();

    if (!conteudo) {
        alert('Escreva a receita antes de publicar.');
        return;
    }

    botao.disabled = true;
    botao.textContent = '⏳ PUBLICANDO...';

    try {
        await api.post('/posts', { conteudo });
        alert('Receita publicada com sucesso! 🍽️');
        window.location.href = 'profissional-dashboard.html';
    } catch (error) {
        console.error('Erro ao publicar receita:', error);
        if (error.response && error.response.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = '../login.html';
            return;
        }
        alert('Não foi possível publicar a receita.');
        botao.disabled = false;
        botao.textContent = '📤 PUBLICAR';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    try {
        console.log('DOM Content Loaded - Initializing...');

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });

        // Add fade-in animation to cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        });

        document.querySelectorAll('.course-card, .post-card, .stat-card').forEach(el => {
            observer.observe(el);
        });

        // Set active nav item based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'home.html';
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href && href.includes(currentPage.replace('.html', ''))) {
                item.classList.add('active');
            }
        });

        console.log('Initialization complete');
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
    }
});

// Make functions globally available
window.togglePassword = togglePassword;
window.toggleSearch = toggleSearch;
window.searchCourses = searchCourses;
window.clearSearch = clearSearch;
window.showModal = showModal;
window.closeModal = closeModal;
window.toggleFAQ = toggleFAQ;
window.filterPosts = filterPosts;
window.toggleLike = toggleLike;
window.createPost = createPost;
window.criarCurso = criarCurso;
window.criarReceita = criarReceita;

// ✅ NOVO: Profile Selection Functions
let selectedUserProfile = 'consumer'; // Estado global do perfil selecionado

const profileDescriptions = {
    consumer: 'Acesse cursos e aprenda',
    professional: 'Compartilhe conhecimento',
    curator: 'Gerencie cursos e conteúdo'
};

function selectProfile(profile) {
    try {
        selectedUserProfile = profile;

        // Atualizar visual dos botões
        document.querySelectorAll('.profile-option').forEach(btn => {
            btn.classList.remove('active');
        });

        const selectedButton = document.querySelector(`[data-profile="${profile}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // Atualizar descrição
        const descriptionElement = document.getElementById('profile-description');
        if (descriptionElement) {
            descriptionElement.textContent = profileDescriptions[profile];
        }

        console.log('Profile selected:', profile);
    } catch (error) {
        console.error('Error in selectProfile:', error);
    }
}

async function handleSignup(event) {
    event.preventDefault(); // impede o recarregamento padrão da página

    const nome = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const senha = document.getElementById('signup-password').value;
    const cpf = document.getElementById('signup-cpf').value;

    try {
        await api.post('/cadastro', { nome, email, senha, cpf });
        alert('Conta criada com sucesso! Faça login para continuar.');
        window.location.href = 'login.html';

    } catch (error) {
        const mensagem = error.response?.data?.mensagem || 'Erro ao criar conta.';
        alert(mensagem);
        console.error('Erro no cadastro:', error);
    }
}

window.handleSignup = handleSignup;


async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-password').value;

    try {
        const response = await api.post('/login', { email, senha });
        const { usuario, role, token } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userProfile', role);
        localStorage.setItem('userNome', usuario.nome);
        localStorage.setItem('userIdPerfil', usuario.idPerfil);

        if (role === 'curator') {
            window.location.href = 'curador/curador-dashboard.html';
        } else if (role === 'professional') {
            window.location.href = 'profissional/profissional-dashboard.html';
        } else {
            window.location.href = 'consumidor/home.html';
        }

    } catch (error) {
        const mensagem = error.response?.data?.mensagem || 'Erro ao fazer login.';
        alert(mensagem);
        console.error('Erro no login:', error);
    }
}

async function handleLogout() {
    try {
        // Avisa o servidor para revogar a sessão no banco (se falhar, sai mesmo assim).
        try { await api.post('/logout'); } catch (e) { /* token já expirado ou servidor fora */ }

        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userProfile');
        // [Correção pós-reorganização] Chamada a partir de curador/ ou profissional/,
        // por isso precisa subir uma pasta ('../') para alcançar login.html na raiz.
        window.location.href = '../login.html';
    } catch (error) {
        console.error('Error in handleLogout:', error);
    }
}

// ✅ NOVO: Tab Switching Function
function switchTab(tabName, tabGroupId) {
    try {
        const tabGroup = document.querySelector(`#${tabGroupId}`);
        if (!tabGroup) return;

        // Atualizar botões de tab
        tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active', 'active-green');
        });

        const activeTab = tabGroup.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            // Adicionar classe apropriada baseada no tipo
            if (activeTab.hasAttribute('data-color') && activeTab.getAttribute('data-color') === 'green') {
                activeTab.classList.add('active-green');
            } else {
                activeTab.classList.add('active');
            }
        }

        // Mostrar/esconder conteúdo
        document.querySelectorAll(`[data-tab-content]`).forEach(content => {
            content.style.display = 'none';
        });

        const activeContent = document.querySelector(`[data-tab-content="${tabName}"]`);
        if (activeContent) {
            activeContent.style.display = 'block';
        }

        console.log('Tab switched to:', tabName);
    } catch (error) {
        console.error('Error in switchTab:', error);
    }
}

// ✅ NOVO: Curator Actions
function approveContent(contentId) {
    try {
        if (confirm('Aprovar este conteúdo?\n\nO conteúdo será publicado e o profissional começará a ganhar por visualizações.')) {
            alert(`✅ Conteúdo #${contentId} APROVADO!\n\nO profissional foi notificado e o conteúdo está publicado.`);
            // Aqui você adicionaria a lógica para remover o card ou atualizar a interface
        }
    } catch (error) {
        console.error('Error in approveContent:', error);
    }
}

function rejectContent(contentId) {
    try {
        const reason = prompt('Digite o motivo da rejeição:\n\n(O profissional receberá esta mensagem)');
        if (reason && reason.trim()) {
            alert(`❌ Conteúdo #${contentId} REJEITADO!\n\nMotivo: ${reason}\n\nO profissional foi notificado e poderá corrigir o conteúdo.`);
            // Aqui você adicionaria a lógica para remover o card ou atualizar a interface
        }
    } catch (error) {
        console.error('Error in rejectContent:', error);
    }
}

// Tornar funções globais
window.selectProfile = selectProfile;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.switchTab = switchTab;
window.approveContent = approveContent;
window.rejectContent = rejectContent;

// [Reorganização de pastas] Nenhuma lógica foi alterada aqui. As únicas mudanças neste
// arquivo foram os 3 caminhos de redirecionamento de login (curador-dashboard.html,
// profissional-dashboard.html e home.html), atualizados para refletir as novas pastas
// curador/, profissional/ e consumidor/ criadas na reorganização de estrutura.
console.log('Script.js loaded successfully');

// ====================================================
// ETAPA 3 - Integração com API via Axios (GET /api/posts)
// ====================================================

// 1) Instância do Axios já configurada com o endereço base da API.
// MEU ESPAÇO: Live Server (localhost:5500) usa a API Node local na porta 3000.
// No Render, use a mesma origem; evite apontar uma versão nova para uma API antiga.
const ESTA_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE_URL = ESTA_LOCAL
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : (window.location.hostname === 'afasa-systems.onrender.com'
        ? '/api'
        : 'https://afasa-systems.onrender.com/api');

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor: antes de CADA requisição, anexa o token (se existir) no cabeçalho Authorization.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2) Busca os posts no backend e desenha os cards na tela.
async function carregarPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.textContent = 'Carregando posts...';

    try {
        const response = await api.get('/posts');
        const posts = response.data;
        const idPerfil = Number(localStorage.getItem('userIdPerfil'));
        const autenticado = Boolean(localStorage.getItem('token'));
        container.replaceChildren();

        if (posts.length === 0) {
            container.textContent = 'Nenhum post publicado ainda.';
            return;
        }

        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'post-card';
            card.dataset.idPost = post.id_post;
            card.innerHTML = `
                <div class="post-header">
                    <div class="user-avatar"></div>
                    <div class="user-info">
                        <div class="user-name"></div>
                        <div class="post-time"></div>
                    </div>
                </div>
                <div class="post-description"></div>
                <form class="post-controles hidden">
                    <fieldset class="post-campos">
                        <div class="post-actions">
                            <button type="button" class="action-btn" data-acao="editar">Editar</button>
                            <button type="button" class="action-btn" data-acao="excluir">Excluir</button>
                        </div>
                        <div class="post-editor hidden">
                            <label>Conteúdo do post
                                <textarea rows="5" required></textarea>
                            </label>
                            <div class="post-actions">
                                <button type="submit" class="action-btn">Salvar</button>
                                <button type="button" class="action-btn" data-acao="cancelar">Cancelar</button>
                            </div>
                        </div>
                    </fieldset>
                </form>
            `;

            const autor = post.autor || 'Usuário';
            card.querySelector('.user-avatar').textContent = autor.charAt(0).toUpperCase();
            card.querySelector('.user-name').textContent = autor;
            card.querySelector('.post-time').textContent =
                post.data.slice(0, 10).split('-').reverse().join('/');

            const descricao = card.querySelector('.post-description');
            descricao.textContent = post.conteudo;
            container.appendChild(card);

            const formulario = card.querySelector('form');
            if (!autenticado || idPerfil !== Number(post.id_perfil)) {
                formulario.remove();
                return;
            }
            formulario.classList.remove('hidden');

            const campos = formulario.querySelector('fieldset');
            const acoes = formulario.querySelector('.post-actions');
            const editor = formulario.querySelector('.post-editor');
            const texto = formulario.querySelector('textarea');

            function mostrarEdicao(ativa) {
                editor.classList.toggle('hidden', !ativa);
                acoes.classList.toggle('hidden', ativa);
                descricao.classList.toggle('hidden', ativa);
            }

            formulario.querySelector('[data-acao="editar"]').addEventListener('click', async () => {
                campos.disabled = true;
                try {
                    const resposta = await api.get('/posts/' + post.id_post);
                    texto.value = resposta.data.conteudo;
                    mostrarEdicao(true);
                } catch (erro) {
                    if (!tratarSessaoExpirada(erro)) {
                        alert(mensagemErroApi(erro, 'Não foi possível abrir o post.'));
                    }
                } finally {
                    campos.disabled = false;
                }
                if (!editor.classList.contains('hidden')) texto.focus();
            });

            formulario.querySelector('[data-acao="cancelar"]').addEventListener('click', () => {
                mostrarEdicao(false);
                formulario.querySelector('[data-acao="editar"]').focus();
            });

            formulario.addEventListener('submit', async evento => {
                evento.preventDefault();
                if (campos.disabled) return;
                const conteudo = texto.value.trim();
                if (!conteudo) {
                    alert('Escreva o conteúdo do post.');
                    texto.focus();
                    return;
                }

                campos.disabled = true;
                try {
                    await api.put('/posts/' + post.id_post, { conteudo });
                    await carregarPosts();
                } catch (erro) {
                    if (!tratarSessaoExpirada(erro)) {
                        alert(mensagemErroApi(erro, 'Não foi possível editar o post.'));
                    }
                } finally {
                    campos.disabled = false;
                }
            });

            formulario.querySelector('[data-acao="excluir"]').addEventListener('click', async () => {
                if (!confirm('Excluir este post? Esta ação é definitiva.')) return;
                campos.disabled = true;
                try {
                    await api.delete('/posts/' + post.id_post);
                    await carregarPosts();
                } catch (erro) {
                    if (!tratarSessaoExpirada(erro)) {
                        alert(mensagemErroApi(erro, 'Não foi possível excluir o post.'));
                    }
                } finally {
                    campos.disabled = false;
                }
            });
        });
    } catch (erro) {
        console.error('Erro ao carregar posts:', erro);
        container.textContent = 'Não foi possível carregar os posts. Recarregue a página para tentar novamente.';
    }
}

// ==============================================================================
// ETAPA 4: RENDERIZAÇÃO DINÂMICA DE CURSOS E INICIALIZAÇÃO DA PÁGINA
// ==============================================================================

/**
 * Busca a lista de cursos cadastrados no backend (/api/cursos)
 * e gera dinamicamente os cards no container HTML (#cursos-container).
 */

function formatarDuracao(intervalo) {
    if (!intervalo) return 'N/A';
    if (typeof intervalo === 'string') return intervalo;
    const horas = intervalo.hours || 0;
    const minutos = intervalo.minutes || 0;
    return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
}

async function carregarCursos() {
    const containers = document.querySelectorAll('.cursos-dinamicos');
    if (containers.length === 0) return;

    try {
        const response = await api.get('/cursos');
        const cursos = response.data;

        containers.forEach(container => {
            container.innerHTML = '';
            if (cursos.length === 0) {
                container.innerHTML = '<p>Nenhum curso encontrado ainda.</p>';
                return;
            }
            cursos.forEach(curso => {
                const card = document.createElement('a');
                card.href = `course.html?id=${curso.id_curso}`;
                card.className = 'course-card';
                card.innerHTML = `
                    <div class="course-info">
                        <div class="course-title">${curso.nome}</div>
                        <div class="course-meta">
                            <span>📚 ${curso.categoria}</span>
                            <span>⏱️ ${formatarDuracao(curso.tempo)}</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        });

    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarPosts();
    carregarCursos();
    carregarCategorias();
});


async function carregarAulas() {
    const container = document.getElementById('aulas-container');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const idCurso = params.get('id');
    if (!idCurso) return;

    try {
        const response = await api.get(`/cursos/${idCurso}/aulas`);
        const aulas = response.data;

        container.innerHTML = '';
        aulas.forEach((aula, index) => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.dataset.idAula = aula.id_aula; // MEU ESPAÇO: identifica a aula para favoritar.
            card.innerHTML = `
                <div class="course-info">
                    <div class="course-title">${index + 1}. ${aula.nome}</div>
                    <div class="course-meta"><span>⏱️ ${aula.duracao}</span></div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar aulas:', error);
    }
}

document.addEventListener('DOMContentLoaded', carregarAulas);


async function carregarPlantas() {
    const container = document.getElementById('plantas-container');
    if (!container) return;

    try {
        const response = await api.get('/plantas');
        const plantas = response.data;

        container.innerHTML = '';
        plantas.forEach(planta => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.style.cssText = 'text-align:left; padding:20px; cursor:pointer;';
            card.innerHTML = `
                <div style="font-weight:600; font-size:18px;">${planta.nome}</div>
                <div class="stat-label">${planta.categoria ?? ''}</div>
                <div>${planta.descricao ?? ''}</div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar plantas:', error);
    }
}

document.addEventListener('DOMContentLoaded', carregarPlantas);


// ------------------------------------------------------------------------------
// ATUALIZAÇÃO DO PERFIL COM DADOS DO USUÁRIO LOGADO
// ------------------------------------------------------------------------------
function carregarDadosPerfil() {
    const nomeUsuario = localStorage.getItem('userNome');

    const elNome = document.getElementById('user-profile-name');
    const elAvatar = document.getElementById('user-profile-avatar');

    if (nomeUsuario) {
        if (elNome) {
            elNome.innerText = nomeUsuario;
        }
        if (elAvatar) {
            // Pega a primeira letra do nome e coloca em maiúscula para o avatar
            elAvatar.innerText = nomeUsuario.charAt(0).toUpperCase();
        }
    }
}

document.addEventListener('DOMContentLoaded', carregarDadosPerfil);

// Mostra o atalho "Voltar ao Painel" no perfil, só para quem logou como profissional
function mostrarAtalhoPainel() {
    const atalho = document.getElementById('atalho-painel');
    if (atalho && localStorage.getItem('userProfile') === 'professional') {
        atalho.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', mostrarAtalhoPainel);

document.addEventListener('DOMContentLoaded', () => {
    const nomeUsuario = localStorage.getItem('userNome');
    const elementoNome = document.getElementById('user-name-display');

    if (nomeUsuario && elementoNome) {
        elementoNome.innerText = nomeUsuario;
    }
});
// === Lógica do Modal de Recuperação de Senha ===

function openForgotModal() {
    const modal = document.getElementById('forgot-modal');
    if (modal) modal.classList.add('active');
}

function closeForgotModal() {
    const modal = document.getElementById('forgot-modal');
    if (modal) modal.classList.remove('active');
}

function closeForgotModalOnOverlay(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeForgotModal();
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-email').value;

    try {
        // Envio com Axios (descomente e substitua o endpoint correto da sua API):
        // await axios.post('/api/auth/forgot-password', { email });

        alert(`Instruções de redefinição enviadas com sucesso para: ${email}`);
        document.getElementById('forgot-password-form').reset();
        closeForgotModal();
    } catch (error) {
        console.error("Erro ao solicitar redefinição:", error);
        alert("Ocorreu um erro ao enviar a solicitação. Tente novamente.");
    }
}


// ====================================================
// MATERIAIS DE ESTUDO (vídeo, PDF e link externo)
// ====================================================

const ROTULOS_MATERIAL = {
    video: { icone: '🎬', texto: 'Vídeo' },
    pdf: { icone: '📄', texto: 'PDF' },
    link: { icone: '🔗', texto: 'Link externo' }
};

let idMaterialEmEdicao = null;

// Atualiza os campos de acordo com o tipo escolhido
function atualizarCamposMaterial() {
    const tipo = document.getElementById('mat-tipo');
    const campoUrl = document.getElementById('mat-url');
    const campoArquivo = document.getElementById('mat-arquivo');
    const containerArquivo = document.getElementById('mat-arquivo-container');
    const ajudaUrl = document.getElementById('mat-url-ajuda');
    const ajudaArquivo = document.getElementById('mat-arquivo-ajuda');

    if (!tipo || !campoUrl || !campoArquivo || !containerArquivo) return;

    if (tipo.value === 'link') {
        containerArquivo.style.display = 'none';
        campoArquivo.value = '';
        campoArquivo.required = false;

        campoUrl.required = true;
        campoUrl.placeholder = 'https://...';
        ajudaUrl.textContent = 'Informe a URL do conteúdo externo.';

    } else if (tipo.value === 'pdf') {
        containerArquivo.style.display = 'block';
        campoArquivo.accept = '.pdf,application/pdf';
        campoArquivo.required = false;

        campoUrl.required = false;
        campoUrl.placeholder = 'https://.../arquivo.pdf';
        ajudaUrl.textContent = 'Informe uma URL de PDF ou envie um arquivo PDF.';
        ajudaArquivo.textContent = 'Arquivo PDF. Tamanho máximo: 50 MB.';

    } else {
        containerArquivo.style.display = 'block';
        campoArquivo.accept = '.mp4,.webm,.ogg,video/mp4,video/webm,video/ogg';
        campoArquivo.required = false;

        campoUrl.required = false;
        campoUrl.placeholder = 'https://youtube.com/...';
        ajudaUrl.textContent = 'Informe uma URL do YouTube, Vimeo ou de um vídeo.';
        ajudaArquivo.textContent = 'Vídeo MP4, WebM ou OGG. Tamanho máximo: 50 MB.';
    }
}

// Transforma links do YouTube/Vimeo em endereços de incorporação
function urlEmbedVideo(url) {
    let endereco;

    try {
        endereco = new URL(url);
    } catch {
        return null;
    }

    const host = endereco.hostname.toLowerCase().replace(/^(www|m)\./, '');
    let id = null;

    if (host === 'youtu.be') {
        id = endereco.pathname.slice(1).split('/')[0];
    } else if (host === 'youtube.com') {
        const partes = endereco.pathname.split('/').filter(Boolean);

        if (endereco.pathname === '/watch') {
            id = endereco.searchParams.get('v');
        } else if (['embed', 'shorts', 'live'].includes(partes[0])) {
            id = partes[1];
        }

        if (id && /^[\w-]{6,20}$/.test(id)) {
            return `https://www.youtube-nocookie.com/embed/${id}`;
        }

        return null;
    } else if (host === 'vimeo.com' || host === 'player.vimeo.com') {
        id = endereco.pathname.split('/').filter(Boolean).pop();

        return /^\d+$/.test(id || '')
            ? `https://player.vimeo.com/video/${id}`
            : null;
    }

    return id && /^[\w-]{6,20}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : null;
}

function ehUrlWeb(url) {
    return typeof url === 'string' && /^https?:\/\//i.test(url);
}

// Monta o card de um material
function criarCardMaterial(material) {
    const rotulo = ROTULOS_MATERIAL[material.tipo] || ROTULOS_MATERIAL.link;

    const card = document.createElement('div');
    card.className = 'course-card';
    card.style.cssText = 'display:block; padding:16px;';

    const titulo = document.createElement('div');
    titulo.className = 'course-title';
    titulo.textContent = `${rotulo.icone} ${material.titulo}`;
    card.appendChild(titulo);

    const meta = document.createElement('div');
    meta.className = 'course-meta';

    const tag = document.createElement('span');
    tag.textContent = material.aula_nome
        ? `${rotulo.texto} • Aula: ${material.aula_nome}`
        : `${rotulo.texto} • Curso todo`;

    meta.appendChild(tag);
    card.appendChild(meta);

    // Prioriza o arquivo enviado; caso contrário, utiliza a URL cadastrada.
    let enderecoMaterial = material.url || '';

    if (material.arquivo_url) {
        try {
            const baseApi = new URL(API_BASE_URL, window.location.href);
            enderecoMaterial = new URL(
                material.arquivo_url,
                baseApi.origin
            ).href;
        } catch (erro) {
            console.error('Erro ao montar endereço do arquivo:', erro);
            return card;
        }
    }

    if (!ehUrlWeb(enderecoMaterial)) return card;

    if (material.tipo === 'video') {
        const embed = material.arquivo_url
            ? null
            : urlEmbedVideo(enderecoMaterial);

        if (embed) {
            const quadro = document.createElement('iframe');
            quadro.src = embed;
            quadro.title = material.titulo;
            quadro.allowFullscreen = true;
            quadro.setAttribute('loading', 'lazy');
            quadro.setAttribute(
                'allow',
                'accelerometer; encrypted-media; picture-in-picture; fullscreen'
            );
            quadro.style.cssText =
                'width:100%; aspect-ratio:16/9; border:0; border-radius:8px; margin-top:12px; background:#000;';

            card.appendChild(quadro);
            return card;
        }

        if (material.arquivo_url || /\.(mp4|webm|ogg)$/i.test(new URL(enderecoMaterial).pathname)) {
            const video = document.createElement('video');
            video.src = enderecoMaterial;
            video.controls = true;
            video.preload = 'metadata';
            video.style.cssText =
                'width:100%; aspect-ratio:16/9; border-radius:8px; margin-top:12px; background:#000;';

            card.appendChild(video);
            return card;
        }
    }

    const botao = document.createElement('a');
    botao.href = enderecoMaterial;
    botao.target = '_blank';
    botao.rel = 'noopener noreferrer';
    botao.className = 'btn btn-primary';
    botao.style.cssText =
        'display:inline-block; margin-top:12px; text-decoration:none; text-align:center;';

    botao.textContent = material.tipo === 'pdf'
        ? '📄 Abrir PDF'
        : material.tipo === 'video'
            ? '🎬 Assistir'
            : '🔗 Acessar conteúdo';

    card.appendChild(botao);

    return card;
}

// Tela do curso: lista os materiais para o aluno
async function carregarMateriais() {
    const container = document.getElementById('materiais-container');
    if (!container) return;

    const idCurso = new URLSearchParams(window.location.search).get('id');
    if (!idCurso) return;

    try {
        const response = await api.get(`/cursos/${idCurso}/materiais`);

        container.innerHTML = '';

        if (response.data.length === 0) {
            const vazio = document.createElement('p');
            vazio.style.color = 'var(--gray-light)';
            vazio.textContent = 'Este curso ainda não tem materiais de estudo.';
            container.appendChild(vazio);
            return;
        }

        response.data.forEach(material => {
            container.appendChild(criarCardMaterial(material));
        });

    } catch (error) {
        console.error('Erro ao carregar materiais:', error);
        container.textContent = 'Não foi possível carregar os materiais.';
    }
}

document.addEventListener('DOMContentLoaded', carregarMateriais);

// ====================================================
// GERENCIAR MATERIAIS - PROFISSIONAL
// ====================================================

function mensagemErroApi(error, padrao) {
    return (
        error.response?.data?.mensagem ||
        padrao
    );
}

function tratarSessaoExpirada(error) {
    if (error.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '../login.html';
        return true;
    }

    return false;
}

// Carrega os cursos do profissional
async function iniciarGerenciarMateriais() {
    const selectCurso = document.getElementById('mat-curso');
    if (!selectCurso) return;

    try {
        const response = await api.get('/meus-cursos');

        response.data.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id_curso;
            option.textContent = curso.nome;
            selectCurso.appendChild(option);
        });

        if (response.data.length === 0) {
            document.getElementById('mat-aviso').textContent =
                'Você ainda não criou nenhum curso. Crie um curso primeiro.';
        }

        const idUrl = new URLSearchParams(window.location.search).get('id');

        if (idUrl && response.data.some(c => String(c.id_curso) === idUrl)) {
            selectCurso.value = idUrl;
            await aoMudarCursoMaterial();
        }

        atualizarCamposMaterial();

    } catch (error) {
        if (tratarSessaoExpirada(error)) return;

        console.error('Erro ao carregar seus cursos:', error);

        document.getElementById('mat-aviso').textContent =
            mensagemErroApi(error, 'Não foi possível carregar seus cursos.');
    }
}

// Carrega as aulas e os materiais do curso selecionado
async function aoMudarCursoMaterial() {
    const idCurso = document.getElementById('mat-curso').value;
    const selectAula = document.getElementById('mat-aula');

    selectAula.innerHTML = '<option value="">Curso todo</option>';

    cancelarEdicaoMaterial();

    if (!idCurso) {
        document.getElementById('mat-lista').innerHTML = '';
        return;
    }

    try {
        const aulas = await api.get(`/cursos/${idCurso}/aulas`);

        aulas.data.forEach(aula => {
            const option = document.createElement('option');
            option.value = aula.id_aula;
            option.textContent = aula.nome;
            selectAula.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar aulas:', error);
    }

    await listarMateriaisGerenciar();
}

// Lista os materiais cadastrados
async function listarMateriaisGerenciar() {
    const idCurso = document.getElementById('mat-curso').value;
    const lista = document.getElementById('mat-lista');

    lista.innerHTML = '';

    if (!idCurso) return;

    try {
        const response = await api.get(`/cursos/${idCurso}/materiais`);

        if (response.data.length === 0) {
            const vazio = document.createElement('p');
            vazio.style.color = 'var(--gray-light)';
            vazio.textContent = 'Nenhum material cadastrado neste curso.';
            lista.appendChild(vazio);
            return;
        }

        response.data.forEach(material => {
            const bloco = document.createElement('div');
            bloco.appendChild(criarCardMaterial(material));

            const acoes = document.createElement('div');
            acoes.style.cssText = 'display:flex; gap:8px; margin:8px 0 16px;';

            const editar = document.createElement('button');
            editar.type = 'button';
            editar.className = 'btn';
            editar.textContent = '✏️ Editar';
            editar.onclick = () => iniciarEdicaoMaterial(material);

            const excluir = document.createElement('button');
            excluir.type = 'button';
            excluir.className = 'btn';
            excluir.textContent = '🗑️ Excluir';
            excluir.onclick = () => excluirMaterial(material.id_material);

            acoes.appendChild(editar);
            acoes.appendChild(excluir);

            bloco.appendChild(acoes);
            lista.appendChild(bloco);
        });

    } catch (error) {
        console.error('Erro ao listar materiais:', error);
        lista.textContent = 'Não foi possível carregar os materiais.';
    }
}

// Prepara o formulário para edição
function iniciarEdicaoMaterial(material) {
    idMaterialEmEdicao = material.id_material;

    document.getElementById('mat-titulo').value = material.titulo;
    document.getElementById('mat-tipo').value = material.tipo;
    document.getElementById('mat-url').value = material.url || '';
    document.getElementById('mat-aula').value = material.id_aula || '';

    // O navegador não permite preencher automaticamente um input file.
    document.getElementById('mat-arquivo').value = '';

    atualizarCamposMaterial();

    if (material.arquivo_url) {
        document.getElementById('mat-arquivo-ajuda').textContent =
            'Já existe um arquivo cadastrado. Selecione outro para substituí-lo ou deixe vazio para manter o atual.';
    }

    document.getElementById('btn-salvar-material').textContent =
        '💾 SALVAR ALTERAÇÕES';

    document.getElementById('btn-cancelar-edicao').style.display = 'block';

    document.getElementById('mat-titulo').focus();
}

// Cancela a edição e limpa o formulário

// Cancela a edição e limpa o formulário sem perder o curso selecionado
function cancelarEdicaoMaterial() {
    idMaterialEmEdicao = null;

    const form = document.getElementById('form-material');
    const selectCurso = document.getElementById('mat-curso');

    if (!form) return;

    // Guarda o curso atualmente selecionado
    const cursoSelecionado = selectCurso ? selectCurso.value : '';

    // Limpa os campos do formulário
    form.reset();

    // Restaura o curso selecionado
    if (selectCurso) {
        selectCurso.value = cursoSelecionado;
    }

    document.getElementById('btn-salvar-material').textContent =
        '✅ ADICIONAR MATERIAL';

    document.getElementById('btn-cancelar-edicao').style.display = 'none';

    atualizarCamposMaterial();
}


// Cadastra ou atualiza um material
async function salvarMaterial(e) {
    e.preventDefault();

    const idCurso = document.getElementById('mat-curso').value;

    if (!idCurso) {
        alert('Escolha um curso.');
        return;
    }

    const botao = document.getElementById('btn-salvar-material');
    const tipo = document.getElementById('mat-tipo').value;
    const titulo = document.getElementById('mat-titulo').value.trim();
    const url = document.getElementById('mat-url').value.trim();
    const arquivo = document.getElementById('mat-arquivo').files[0] || null;
    const idAula = document.getElementById('mat-aula').value;

    if (!titulo) {
        alert('Informe o título do material.');
        return;
    }

    if (arquivo && url) {
        // Ao selecionar arquivo, ele será utilizado no lugar da URL.
        // A URL não será enviada junto.
    }

    if (tipo === 'link' && (!url || arquivo)) {
        alert('Materiais do tipo link devem utilizar somente uma URL.');
        return;
    }

    if (tipo !== 'link' && !url && !arquivo && !idMaterialEmEdicao) {
        alert('Informe uma URL ou selecione um arquivo.');
        return;
    }

    if (arquivo && arquivo.size > 50 * 1024 * 1024) {
        alert('O arquivo ultrapassa o limite de 50 MB.');
        return;
    }

    if (arquivo) {
        const tiposPermitidos = {
            pdf: ['application/pdf'],
            video: ['video/mp4', 'video/webm', 'video/ogg']
        };

        if (!tiposPermitidos[tipo]?.includes(arquivo.type)) {
            alert('O formato do arquivo não corresponde ao tipo de material escolhido.');
            return;
        }
    }

    // FormData é necessário para enviar arquivos ao Multer.
    const dados = new FormData();

    dados.append('titulo', titulo);
    dados.append('tipo', tipo);
    dados.append('id_aula', idAula);

    // Quando existe arquivo, envia somente o arquivo, sem a URL.
    if (arquivo) {
        dados.append('arquivo', arquivo);
    } else if (url) {
        dados.append('url', url);
    }

    botao.disabled = true;
    botao.textContent = '⏳ SALVANDO...';

    try {
        if (idMaterialEmEdicao) {
            await api.put(`/materiais/${idMaterialEmEdicao}`, dados);
        } else {
            await api.post(`/cursos/${idCurso}/materiais`, dados);
        }

        cancelarEdicaoMaterial();
        await listarMateriaisGerenciar();

        alert('Material salvo com sucesso!');

    } catch (error) {
        if (tratarSessaoExpirada(error)) return;

        console.error('Erro ao salvar material:', error);

        alert(
            mensagemErroApi(error, 'Não foi possível salvar o material.')
        );

    } finally {
        botao.disabled = false;

        botao.textContent = idMaterialEmEdicao
            ? '💾 SALVAR ALTERAÇÕES'
            : '✅ ADICIONAR MATERIAL';
    }
}

// Exclui um material
async function excluirMaterial(idMaterial) {
    if (!confirm('Excluir este material?')) return;

    try {
        await api.delete(`/materiais/${idMaterial}`);

        if (idMaterialEmEdicao === idMaterial) {
            cancelarEdicaoMaterial();
        }

        await listarMateriaisGerenciar();

    } catch (error) {
        if (tratarSessaoExpirada(error)) return;

        console.error('Erro ao excluir material:', error);

        alert(
            mensagemErroApi(error, 'Não foi possível excluir o material.')
        );
    }
}

// Disponibiliza as funções para o HTML
window.atualizarCamposMaterial = atualizarCamposMaterial;
window.aoMudarCursoMaterial = aoMudarCursoMaterial;
window.salvarMaterial = salvarMaterial;
window.cancelarEdicaoMaterial = cancelarEdicaoMaterial;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    atualizarCamposMaterial();
    iniciarGerenciarMateriais();
});
