/* --- 1. CONFIGURAÇÃO --- */
const githubUsername = 'NordicManX';

// Variáveis de Controle da Paginação
let allRepos = [];
let currentPage = 1;
const itemsPerPage = 8;

/* --- 2. EFEITO DIGITAÇÃO (TYPEWRITER) --- */
const texts = ["Soluções Backend", "APIs Robustas", "Sistemas Web", "Automação", "Nordic Tech"];
let count = 0;
let index = 0;
let currentText = "";
let letter = "";

(function type() {
    if (count === texts.length) count = 0;
    currentText = texts[count];
    letter = currentText.slice(0, ++index);

    const typingElement = document.getElementById("typing-text");
    if (typingElement) typingElement.textContent = letter;

    if (letter.length === currentText.length) {
        count++;
        index = 0;
        setTimeout(type, 2000);
    } else {
        setTimeout(type, 100);
    }
})();

/* --- 3. GITHUB API COM PAGINAÇÃO --- */
async function getRepos() {
    const container = document.getElementById('repos-container');
    if (!container) return;

    try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`);
        if (!response.ok) throw new Error('Erro na requisição');
        allRepos = await response.json();
        renderPage(1);
    } catch (e) {
        container.innerHTML = `<p style="color: #ff4444; font-family: monospace;">Erro ao carregar repositórios. Verifique a conexão.</p>`;
        console.error(e);
    }
}

function renderPage(page) {
    const container = document.getElementById('repos-container');
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
                <div class="stat-item">
                    <i class="fas fa-circle" style="font-size: 6px;"></i>
                    ${repo.language || 'Code'}
                </div>
                <div class="stat-item">
                    <i class="fas fa-star"></i>
                    ${repo.stargazers_count}
                </div>
                <div class="repo-link">View Code &rarr;</div>
            </div>
        `;
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

    pageInfo.innerText = `Página ${currentPage} de ${totalPages}`;
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages || totalPages === 0;
}
getRepos();

/* --- 4. FUNDO: RESPONSIVO, REPULSÃO & MODO AUTOMÁTICO MOBILE --- */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

if (canvas) {
    let w, h;
    let particles = [];
    let timeCycle = 0;

    // Variáveis novas para o modo automático
    let isMobile = false;
    let isTouching = false;

    let mouse = { x: -1000, y: -1000, baseRadius: 400 };

    // --- EVENTOS DE MOUSE (PC) ---
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    // --- EVENTOS DE TOQUE (MOBILE) ---
    window.addEventListener('touchstart', (e) => {
        isTouching = true; // Marca que o usuário está tocando
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        isTouching = false; // Usuário soltou a tela
        // Não resetamos mouse.x para permitir transição suave
    });

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
            let dx = mouse.x - this.originX;
            let dy = mouse.y - this.originY;
            let distance = Math.sqrt(dx * dx + dy * dy);

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
            let driftX = Math.sin(timeCycle * this.driftSpeedX + this.originX) * this.driftRange;
            let driftY = Math.cos(timeCycle * this.driftSpeedY + this.originY) * this.driftRange;

            let targetX = this.originX + driftX;
            let targetY = this.originY + driftY;

            let dx = mouse.x - this.originX;
            let dy = mouse.y - this.originY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            let ease = 0.02;

            if (distance < mouse.baseRadius) {
                let angle = Math.atan2(dy, dx);
                let force = (mouse.baseRadius - distance) / mouse.baseRadius;
                let push = force * (mouse.baseRadius * 0.4);

                targetX -= Math.cos(angle) * push;
                targetY -= Math.sin(angle) * push;
                ease = 0.1;
            }
            this.x += (targetX - this.x) * ease;
            this.y += (targetY - this.y) * ease;
        }
    }

    function init() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        particles = [];

        // Verifica se é mobile
        isMobile = w < 768;

        const spacing = isMobile ? 50 : 35;
        mouse.baseRadius = isMobile ? 150 : 400;

        for (let y = 0; y < h; y += spacing) {
            for (let x = 0; x < w; x += spacing) {
                particles.push(new Particle(x, y));
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        timeCycle += 1.5;

        // --- LÓGICA AUTOMÁTICA PARA MOBILE ---
        // Se for celular E ninguém estiver tocando, a luz se mexe sozinha
        if (isMobile && !isTouching) {
            mouse.x = (w / 2) + Math.sin(timeCycle * 0.01) * (w / 3);
            mouse.y = (h / 2) + Math.cos(timeCycle * 0.015) * (h / 4);
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { setTimeout(init, 100); });
    init();
    animate();
}

/* --- 5. ENVIO DE FORMULÁRIO (VIA EMAILJS) --- */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // --- CONFIGURAÇÃO ---
        const serviceID = "service_kjolmgl";
        const templateID = "template_gt38aha";
        // --------------------

        const statusMsg = document.getElementById("form-status");
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalBtnText = submitBtn.innerHTML;

        submitBtn.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        emailjs.sendForm(serviceID, templateID, this)
            .then(() => {
                contactForm.innerHTML = `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <h3>Transmissão Confirmada</h3>
                        <p>Um email de confirmação foi enviado para sua caixa de entrada.</p>
                        <button onclick="location.reload()" class="btn-tech-small">Nova Mensagem</button>
                    </div>
                `;
            }, (err) => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                statusMsg.innerHTML = "Falha no envio. Verifique as chaves do EmailJS.";
                statusMsg.classList.add('error');
                console.error('Erro EmailJS:', err);
            });
    });
}

/* --- 6. RENDERIZAÇÃO DAS SKILLS COM ÍCONES --- */
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