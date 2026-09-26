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
    const conteudo = document.getElementById('post-descricao').value;
    const idPerfil = localStorage.getItem('userIdPerfil');

    try {
        await api.post('/posts', { conteudo, id_perfil: idPerfil });
        alert('Post publicado com sucesso! 🎉');
        window.location.href = 'community.html';
    } catch (error) {
        console.error('Erro ao criar post:', error);
        alert('Não foi possível publicar o post.');
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
        const { usuario, role } = response.data;

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

function handleLogout() {
    try {
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
const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

// 2) Busca os posts no backend e desenha os cards na tela.
async function carregarPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    try {
        const response = await api.get('/posts');
        const posts = response.data;

        container.innerHTML = '';

        if (posts.length === 0) {
            container.innerHTML = '<p>Nenhum post encontrado ainda.</p>';
            return;
        }

        posts.forEach(post => {
            const inicialNome = post.autor ? post.autor.charAt(0).toUpperCase() : '?';
            const dataFormatada = new Date(post.data).toLocaleDateString('pt-BR');

            const card = document.createElement('div');
            card.className = 'post-card';
            card.innerHTML = `
                <div class="post-header">
                    <div class="user-avatar">${inicialNome}</div>
                    <div class="user-info">
                        <div class="user-name">${post.autor}</div>
                        <div class="post-time">${dataFormatada}</div>
                    </div>
                </div>
                <div class="post-description">
                    ${post.conteudo}
                </div>
            `;
            container.appendChild(card);
        });


    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        container.innerHTML = '<p>Não foi possível carregar os posts. Tente novamente mais tarde.</p>';
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

document.addEventListener('DOMContentLoaded', () => {
  const nomeUsuario = localStorage.getItem('userNome');
  const elementoNome = document.getElementById('user-name-display');

  if (nomeUsuario && elementoNome) {
    elementoNome.innerText = nomeUsuario;
  }
});