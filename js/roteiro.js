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
function createPost(e) {
    try {
        e.preventDefault();
        alert('Post publicado com sucesso! 🎉');
        window.location.href = 'community.html';
    } catch (error) {
        console.error('Error in createPost:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM Content Loaded - Initializing...');
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
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

function handleLogin(event) {
    try {
        event.preventDefault();
        
        // Salvar perfil e status de login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userProfile', selectedUserProfile);
        
        // Redirecionar baseado no perfil
        if (selectedUserProfile === 'curator') {
            window.location.href = 'curador/curador-dashboard.html';
        } else if (selectedUserProfile === 'professional') {
            window.location.href = 'profissional/profissional-dashboard.html';
        } else {
            window.location.href = 'consumidor/home.html';
        }
    } catch (error) {
        console.error('Error in handleLogin:', error);
    }
}

function handleLogout() {
    try {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userProfile');
        window.location.href = 'login.html';
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
