/* --- 1. CONFIGURAÇÃO --- */
const githubUsername = 'NordicManX';

// Variáveis de Controle da Paginação
let allRepos = [];       // Guarda todos os repositórios baixados
let currentPage = 1;     // Página atual
const itemsPerPage = 8; // Quantos itens por página

/* --- 2. EFEITO DIGITAÇÃO --- */
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

// Função Principal: Busca os dados UMA vez
async function getRepos() {
    const container = document.getElementById('repos-container');
    if (!container) return;

    try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`);

        if (!response.ok) throw new Error('Erro na requisição');

        // Salva todos os repositórios na variável global
        allRepos = await response.json();

        // Renderiza a primeira página
        renderPage(1);

    } catch (e) {
        container.innerHTML = `<p style="color: #ff4444; font-family: monospace;">Erro ao carregar repositórios. Verifique a conexão.</p>`;
        console.error(e);
    }
}

// Função que desenha os cards na tela baseado na página
function renderPage(page) {
    const container = document.getElementById('repos-container');
    container.innerHTML = ''; // Limpa os cards anteriores (efeito de sumir os velhos)

    // Lógica Matemática: Define onde começa e termina a lista de 10
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = allRepos.slice(start, end); // Pega só os 10 da vez

    // Cria os cards (mesmo design HUD)
    paginatedItems.forEach((repo, index) => {
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = "_blank";
        card.className = 'repo-card';
        // Adiciona um delayzinho na animação para aparecer um por um (efeito cascata)
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

    // Atualiza os botões e texto da página
    updatePaginationControls();
}

// Função chamada ao clicar nos botões
function changePage(direction) {
    const totalPages = Math.ceil(allRepos.length / itemsPerPage);
    const nextPage = currentPage + direction;

    if (nextPage >= 1 && nextPage <= totalPages) {
        currentPage = nextPage;
        renderPage(currentPage);

        // Rola suavemente até o topo da seção de projetos
        document.querySelector('.projects-section').scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Atualiza estado dos botões (Habilita/Desabilita)
function updatePaginationControls() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const pageInfo = document.getElementById('page-info');
    const totalPages = Math.ceil(allRepos.length / itemsPerPage);

    pageInfo.innerText = `Página ${currentPage} de ${totalPages}`;

    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages || totalPages === 0;
}

// Inicia tudo
getRepos();

/* --- 4. FUNDO: PARTÍCULAS INTERATIVAS (MOUSE) --- */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;

    // Objeto que guarda a posição do mouse
    let mouse = {
        x: null,
        y: null,
        radius: 150 // Raio de interação (distância que o mouse atrai as linhas)
    }

    // Ouve o movimento do mouse
    window.addEventListener('mousemove', function (event) {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    // Quando o mouse sai da tela, reseta a posição para parar as linhas
    window.addEventListener('mouseout', function () {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.directionX = (Math.random() * 1) - 0.5; // Velocidade X
            this.directionY = (Math.random() * 1) - 0.5; // Velocidade Y
            this.size = (Math.random() * 2) + 1;
            this.color = '#00f3ff';
        }

        // Método para desenhar a bolinha
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = '#00f3ff'; // Cor do Núcleo
            ctx.fill();
        }

        // Método para atualizar a posição
        update() {
            // Verifica se bateu nas bordas da tela
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Detecção de colisão com o MOUSE
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius + this.size) {
                // Se o mouse estiver perto, a partícula é empurrada levemente (opcional)
                // ou apenas criamos a conexão visual (linhas).
                // Para fazer elas fugirem um pouco do mouse (efeito bolha):
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                    this.x += 2;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 2;
                }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                    this.y += 2;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 2;
                }
            }

            // Move a partícula
            this.x += this.directionX;
            this.y += this.directionY;

            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        // Cria partículas baseado no tamanho da tela (para não ficar pesado)
        let numberOfParticles = (canvas.height * canvas.width) / 9000;

        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    // Função que desenha as linhas de conexão
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                    ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

                // Se as partículas estiverem perto uma da outra, desenha linha
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(0, 243, 255,' + opacityValue + ')';
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect(); // Chama a função que liga os pontos
    }

    window.addEventListener('resize', function () {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        mouse.radius = ((canvas.height / 80) * (canvas.height / 80));
        init();
    });

    init();
    animate();
}

/* --- 5. ENVIO DE FORMULÁRIO (AJAX) --- */
const form = document.getElementById("contact-form");

async function handleSubmit(event) {
    event.preventDefault();
    const status = document.getElementById("form-status");
    const data = new FormData(event.target);

    fetch(event.target.action, {
        method: form.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            status.innerHTML = "Transmissão concluída com sucesso!";
            status.classList.add('success');
            form.reset(); // Limpa o formulário
        } else {
            response.json().then(data => {
                if (Object.hasOwn(data, 'errors')) {
                    status.innerHTML = data["errors"].map(error => error["message"]).join(", ");
                } else {
                    status.innerHTML = "Erro na transmissão. Tente novamente.";
                }
                status.classList.add('error');
            })
        }
    }).catch(error => {
        status.innerHTML = "Falha crítica na rede.";
        status.classList.add('error');
    });
}

if (form) {
    form.addEventListener("submit", handleSubmit);
}