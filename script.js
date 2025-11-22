/* --- 1. CONFIGURAÇÃO GERAL --- */
const githubUsername = 'NordicManX';

/* --- 2. RENDERIZAÇÃO DAS SKILLS (PRIORIDADE) --- */
// Colocamos no topo para garantir que carregue rápido no mobile
const skillsContainer = document.getElementById('skills-container');
const techStack = [
    { name: "Golang", icon: "fab fa-golang" },
    { name: "Python", icon: "fab fa-python" },
    { name: "JavaScript", icon: "fab fa-js" },
    { name: "Node.js", icon: "fab fa-node-js" },
    { name: "React", icon: "fab fa-react" },
    { name: "Vue.js", icon: "fab fa-vuejs" },
    { name: "HTML5", icon: "fab fa-html5" },
    { name: "CSS3", icon: "fab fa-css3-alt" },
    { name: "Docker", icon: "fab fa-docker" },
    { name: "Git", icon: "fab fa-git-alt" },
    { name: "SQL", icon: "fas fa-database" },
    { name: "NoSQL", icon: "fas fa-layer-group" },
    { name: "Linux", icon: "fab fa-linux" }
];

if (skillsContainer) {
    skillsContainer.innerHTML = '';
    techStack.forEach(skill => {
        const tag = document.createElement('div');
        tag.className = 'skill-tag';
        tag.innerHTML = `<i class="${skill.icon}"></i> ${skill.name}`;
        skillsContainer.appendChild(tag);
    });
}

/* --- 3. CONTROLES DE NAVEGAÇÃO (MENU & LOGIN) --- */
const sideMenu = document.getElementById('side-menu');
const hamburgerBtn = document.getElementById('hamburger-btn');
const closeMenuBtn = document.getElementById('close-menu');

const loginModal = document.getElementById('login-modal');
const closeLoginBtn = document.getElementById('close-login');

// Botões de Ação do Menu
const menuLoginBtn = document.getElementById('menu-login-btn');
const menuConfigBtn = document.getElementById('menu-config-btn');
const menuLogoutBtn = document.getElementById('menu-logout-btn');

// Funções de Abrir/Fechar
function toggleMenu() { sideMenu.classList.toggle('active'); }
function closeMenu() { sideMenu.classList.remove('active'); }

// Event Listeners do Menu
if (hamburgerBtn) hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
});

if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);

// Event Listeners das Opções do Menu
if (menuLoginBtn) {
    menuLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
        loginModal.classList.add('active');
    });
}

if (menuConfigBtn) {
    menuConfigBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert("Painel de Configurações em desenvolvimento.");
        closeMenu();
    });
}

if (menuLogoutBtn) {
    menuLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert("Sessão encerrada.");
        closeMenu();
    });
}

// Controles do Modal de Login
if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', () => loginModal.classList.remove('active'));
}

// Fechar ao clicar fora (Overlay)
window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.remove('active');
    if (e.target === sideMenu) closeMenu();
});

/* --- LÓGICA DE LOGIN (REAL COM NODE.JS) --- */
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const msg = document.getElementById('login-msg');

        msg.innerHTML = 'Conectando ao servidor seguro <i class="fas fa-spinner fa-spin"></i>';

        try {
            // URL do seu backend (Localmente é localhost:3000)
            // Quando subir pra Vercel, vamos mudar isso.
            const API_URL = 'http://localhost:3000/api/login';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: user, pass: pass })
            });

            const data = await response.json();

            if (data.success) {
                msg.innerHTML = 'Acesso Autorizado. Redirecionando...';
                msg.style.color = '#00ff88';

                // Salva que o usuário está logado
                localStorage.setItem('nordic_token', data.token);

                // Redireciona para a página interna (que vamos criar)
                setTimeout(() => {
                    // Por enquanto, apenas fecha e avisa
                    alert("Bem-vindo ao Sistema Privado!");
                    document.getElementById('login-modal').classList.remove('active');
                }, 1000);

            } else {
                msg.innerHTML = data.message || 'Acesso Negado.';
                msg.style.color = '#ff0055';
            }

        } catch (error) {
            console.error(error);
            msg.innerHTML = 'Erro de conexão com o servidor.';
            msg.style.color = '#ff0055';
        }
    });
}

/* --- 4. EFEITO DIGITAÇÃO --- */
const texts = ["Soluções Backend", "APIs Robustas", "Sistemas Web", "Automação", "Sistemas"];
let count = 0;
let index = 0;
let currentText = "";
let letter = "";

(function type() {
    const typingElement = document.getElementById("typing-text");
    if (!typingElement) return;

    if (count === texts.length) count = 0;
    currentText = texts[count];
    letter = currentText.slice(0, ++index);
    typingElement.textContent = letter;

    if (letter.length === currentText.length) {
        count++; index = 0; setTimeout(type, 2000);
    } else { setTimeout(type, 100); }
})();

/* --- 5. GITHUB API --- */
let allRepos = []; let currentPage = 1; const itemsPerPage = 8;

async function getRepos() {
    const container = document.getElementById('repos-container');
    if (!container) return;
    try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`);
        if (!response.ok) throw new Error('Erro na requisição');
        allRepos = await response.json();
        renderPage(1);
    } catch (e) {
        container.innerHTML = `<p style="color: #ff4444; font-family: monospace;">Erro ao carregar repositórios.</p>`;
    }
}

function renderPage(page) {
    const container = document.getElementById('repos-container');
    if (!container) return;
    container.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = allRepos.slice(start, end);

    paginatedItems.forEach((repo, index) => {
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = "_blank";
        card.className = 'repo-card';
        card.style.animationDelay = `${index * 0.1}s`;
        const description = repo.description ? repo.description : 'Projeto desenvolvido com foco em tecnologia e performance.';

        card.innerHTML = `
            <div class="repo-header">
                <div class="repo-name">${repo.name}</div>
                <i class="fas fa-folder-open repo-icon"></i>
            </div>
            <p class="repo-desc">${description}</p>
            <div class="repo-stats">
                <div class="stat-item"><i class="fas fa-circle" style="font-size: 6px;"></i> ${repo.language || 'Code'}</div>
                <div class="stat-item"><i class="fas fa-star"></i> ${repo.stargazers_count}</div>
                <div class="repo-link">View Code &rarr;</div>
            </div>`;
        container.appendChild(card);
    });
    updatePaginationControls();
}

function changePage(direction) {
    const totalPages = Math.ceil(allRepos.length / itemsPerPage);
    const nextPage = currentPage + direction;
    if (nextPage >= 1 && nextPage <= totalPages) {
        currentPage = nextPage;
        renderPage(currentPage);
        document.querySelector('.projects-section').scrollIntoView({ behavior: 'smooth' });
    }
}

function updatePaginationControls() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const pageInfo = document.getElementById('page-info');
    const totalPages = Math.ceil(allRepos.length / itemsPerPage);

    if (pageInfo) pageInfo.innerText = `Página ${currentPage} de ${totalPages}`;
    if (btnPrev) btnPrev.disabled = currentPage === 1;
    if (btnNext) btnNext.disabled = currentPage === totalPages || totalPages === 0;
}
getRepos();

/* --- 6. FUNDO DE PARTÍCULAS (AUTOMÁTICO + REPULSÃO) --- */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

if (canvas) {
    let w, h;
    let particles = [];
    let timeCycle = 0;

    // Variáveis de Controle
    let isMobile = false;
    let isTouching = false;

    // Começa no CENTRO (Fix tela preta iPhone)
    let mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        baseRadius: 400
    };

    // EVENTOS
    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; isTouching = true; });
    window.addEventListener('touchstart', (e) => { isTouching = true; if (e.touches.length > 0) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; } }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (e.touches.length > 0) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; } }, { passive: false });
    window.addEventListener('touchend', () => { isTouching = false; });

    class Particle {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.originX = x; this.originY = y;
            this.baseSize = 1.5;
            this.driftSpeedX = Math.random() * 0.02 + 0.01;
            this.driftSpeedY = Math.random() * 0.02 + 0.01;
            this.driftRange = Math.random() * 5 + 3;
        }

        draw() {
            // Usa posição segura se mouse falhar
            let mx = mouse.x || w / 2;
            let my = mouse.y || h / 2;

            let dx = mx - this.originX;
            let dy = my - this.originY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Efeitos Visuais (Ondas e Respiração)
            let breathing = Math.sin(timeCycle * 0.02) * 30;
            let dynamicBaseRadius = mouse.baseRadius + breathing;

            let angleToMouse = Math.atan2(dy, dx);
            let wave1 = Math.sin(angleToMouse * 5 + timeCycle * 0.05) * 20;
            let wave2 = Math.cos(angleToMouse * 3 - timeCycle * 0.03) * 30;
            let currentRadius = dynamicBaseRadius + wave1 + wave2;

            if (distance > currentRadius) return;

            let edgeFactor = distance / currentRadius;
            let alpha = 1 - edgeFactor;
            alpha = Math.max(0, alpha);
            if (isNaN(alpha)) alpha = 1;

            let currentSize = this.baseSize + (edgeFactor * 3);
            let color = `rgba(0, 243, 255, ${alpha})`;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.shadowBlur = 10 + (edgeFactor * 10);
            ctx.shadowColor = color;
            ctx.fill();
            ctx.restore();
        }

        update() {
            // 1. Drift Natural
            let driftX = Math.sin(timeCycle * this.driftSpeedX + this.originX) * this.driftRange;
            let driftY = Math.cos(timeCycle * this.driftSpeedY + this.originY) * this.driftRange;
            let targetX = this.originX + driftX;
            let targetY = this.originY + driftY;

            // 2. Interação com Mouse (Repulsão)
            let mx = mouse.x || w / 2;
            let my = mouse.y || h / 2;
            let dx = mx - this.originX;
            let dy = my - this.originY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            let ease = 0.02; // Retorno lento (Gelatina)

            if (distance < mouse.baseRadius) {
                let angle = Math.atan2(dy, dx);
                let force = (mouse.baseRadius - distance) / mouse.baseRadius;
                let push = force * (mouse.baseRadius * 0.4);

                // Subtrai para empurrar para longe (Repulsão)
                targetX -= Math.cos(angle) * push;
                targetY -= Math.sin(angle) * push;
                ease = 0.1; // Reação rápida ao empurrão
            }

            this.x += (targetX - this.x) * ease;
            this.y += (targetY - this.y) * ease;
        }
    }

    function init() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        particles = [];

        // Detecção Mobile
        isMobile = (w < 768) || ('ontouchstart' in window);

        const spacing = isMobile ? 45 : 35;
        mouse.baseRadius = isMobile ? 180 : 400;

        // Garante que começa no centro
        if (!isTouching) { mouse.x = w / 2; mouse.y = h / 2; }

        for (let y = 0; y < h; y += spacing) {
            for (let x = 0; x < w; x += spacing) {
                particles.push(new Particle(x, y));
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        timeCycle += 1.5;

        // MODO AUTOMÁTICO (GHOST MOUSE)
        if (!isTouching) {
            // Movimento suave infinito no centro
            let moveX = Math.sin(timeCycle * 0.01) * (w * 0.3);
            let moveY = Math.cos(timeCycle * 0.015) * (h * 0.2);

            let targetX = (w / 2) + moveX;
            let targetY = (h / 2) + moveY;

            // Suaviza o movimento do mouse fantasma
            mouse.x += (targetX - mouse.x) * 0.05;
            mouse.y += (targetY - mouse.y) * 0.05;
        }

        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }

    let resizeTimeout;
    window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(init, 100); });
    init(); animate();
}

/* --- 7. ENVIO DE FORMULÁRIO (EMAILJS) --- */
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const serviceID = "service_kjolmgl";
        const templateID = "template_gt38aha";
        const statusMsg = document.getElementById("form-status");
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalBtnText = submitBtn.innerHTML;

        submitBtn.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        emailjs.sendForm(serviceID, templateID, this).then(() => {
            contactForm.innerHTML = `
                <div class="success-message">
                    <i class="fas fa-check-circle"></i>
                    <h3>Transmissão Confirmada</h3>
                    <p>Um email de confirmação foi enviado para sua caixa de entrada.</p>
                    <button onclick="location.reload()" class="btn-tech-small">Nova Mensagem</button>
                </div>`;
        }, (err) => {
            submitBtn.innerHTML = originalBtnText; submitBtn.disabled = false;
            statusMsg.innerHTML = "Falha no envio."; statusMsg.classList.add('error');
        });
    });
}

/* --- 8. CONTADOR DE VISITAS --- */
const counterElement = document.getElementById('visit-count');
if (counterElement) {
    const namespace = 'nordicmanx-portfolio'; const key = 'visits';
    fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`)
        .then(response => response.json()).then(data => { counterElement.innerText = data.count; })
        .catch(error => { counterElement.innerText = "1"; });
}