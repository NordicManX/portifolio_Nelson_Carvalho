/* --- CONFIGURAÇÃO DE AMBIENTE --- */
const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : '';

// 1. VERIFICAÇÃO DE SEGURANÇA (Ao abrir a página)
const token = localStorage.getItem('nordic_token');
if (!token) {
    alert("Acesso não autorizado. Faça login.");
    window.location.href = 'index.html';
}

// 2. LOGOUT
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('nordic_token');
    window.location.href = 'index.html';
});

// 3. LISTAR ARQUIVOS
async function loadFiles() {
    const listContainer = document.getElementById('files-list');
    listContainer.innerHTML = '<p style="color:#888; text-align:center;">Carregando...</p>';

    try {
        const res = await fetch(`${BASE_URL}/api/files`);
        const files = await res.json();

        listContainer.innerHTML = '';

        if (files.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; margin-top:20px;">Nenhum arquivo encontrado.</p>';
            return;
        }

        files.forEach(file => {
            // Ícone dependendo do tipo
            const iconClass = file.type === 'link' ? 'fas fa-link' : 'fas fa-file-alt';
            const typeClass = file.type === 'link' ? 'type-link' : 'type-file';

            // Ação de clique: Link abre nova aba, Arquivo baixa
            const actionAttr = file.type === 'link' ? `href="${file.content}" target="_blank"` : `href="#" onclick="downloadBase64('${file.content}', '${file.name}')"`;

            const item = document.createElement('div');
            item.className = `dash-file-item ${typeClass}`;
            item.innerHTML = `
                <i class="${iconClass} df-icon"></i>
                <div class="df-info">
                    <span class="df-name">${file.name}</span>
                    <span class="df-meta">${file.type.toUpperCase()} • ${file.size} • ${new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="df-actions">
                    <a ${actionAttr} class="btn-action" title="Acessar"><i class="fas fa-external-link-alt"></i></a>
                    <button onclick="openEditModal('${file._id}', '${file.name}')" class="btn-action" title="Editar"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteFile('${file._id}')" class="btn-action btn-delete" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            `;
            listContainer.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        listContainer.innerHTML = '<p style="color:red;">Erro ao carregar arquivos.</p>';
    }
}

// 4. UPLOAD DE ARQUIVO (Base64)
const fileInput = document.getElementById('file-input');
const dropArea = document.getElementById('drop-area');
const fileNameDisplay = document.getElementById('file-selected-name');

dropArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        fileNameDisplay.innerText = this.files[0].name;
        // Auto-preenche o nome se estiver vazio
        const nameInput = document.getElementById('file-name-input');
        if (!nameInput.value) nameInput.value = this.files[0].name;
    }
});

document.getElementById('form-file').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    const name = document.getElementById('file-name-input').value;

    if (!file) return alert("Selecione um arquivo!");
    if (file.size > 4 * 1024 * 1024) return alert("Arquivo muito grande! Máximo 4MB (limite Vercel). Para maiores, use Link.");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function () {
        const base64 = reader.result;
        await saveFile({
            name: name,
            type: 'file',
            content: base64,
            size: (file.size / 1024).toFixed(1) + ' KB'
        });
    };
});

// 5. SALVAR LINK
document.getElementById('form-link').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('link-name-input').value;
    const url = document.getElementById('link-url-input').value;

    await saveFile({
        name: name,
        type: 'link',
        content: url,
        size: 'Nuvem'
    });
});

// Função Genérica de Salvar
async function saveFile(payload) {
    const btn = document.querySelector('.upload-form.active .btn-submit');
    const originalText = btn.innerText;
    btn.innerText = "Salvando...";
    btn.disabled = true;

    try {
        const res = await fetch(`${BASE_URL}/api/files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert("Salvo com sucesso!");
            loadFiles(); // Recarrega lista
            // Limpa forms
            document.getElementById('form-file').reset();
            document.getElementById('form-link').reset();
            fileNameDisplay.innerText = "";
        } else {
            alert("Erro ao salvar.");
        }
    } catch (e) {
        console.error(e);
        alert("Erro de conexão.");
    }
    btn.innerText = originalText;
    btn.disabled = false;
}

// 6. DELETAR
async function deleteFile(id) {
    if (!confirm("Tem certeza que deseja excluir?")) return;

    try {
        await fetch(`${BASE_URL}/api/files/${id}`, { method: 'DELETE' });
        loadFiles();
    } catch (e) {
        alert("Erro ao deletar.");
    }
}

// 7. EDITAR NOME
const editModal = document.getElementById('edit-modal');
const editInput = document.getElementById('edit-name');
const editIdInput = document.getElementById('edit-id');

function openEditModal(id, currentName) {
    editIdInput.value = id;
    editInput.value = currentName;
    editModal.classList.add('active');
}

document.querySelector('.close-edit').addEventListener('click', () => {
    editModal.classList.remove('active');
});

document.getElementById('save-edit-btn').addEventListener('click', async () => {
    const id = editIdInput.value;
    const newName = editInput.value;

    try {
        await fetch(`${BASE_URL}/api/files/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });
        editModal.classList.remove('active');
        loadFiles();
    } catch (e) {
        alert("Erro ao editar.");
    }
});

// 8. UTILITÁRIO: Download Base64
window.downloadBase64 = function (base64, fileName) {
    const link = document.createElement("a");
    link.href = base64;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 9. TABS (Alternar entre Arquivo e Link)
window.switchTab = function (tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.upload-form').forEach(f => f.classList.remove('active'));

    if (tab === 'file') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('form-file').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('form-link').classList.add('active');
    }
}

// Inicia
loadFiles();

/* --- PARTICLES NO DASHBOARD (Cópia Simplificada) --- */
// Para manter o visual legal
const cvs = document.getElementById('particles');
if (cvs) {
    const ctx = cvs.getContext('2d');
    let w = cvs.width = window.innerWidth;
    let h = cvs.height = window.innerHeight;
    let parts = [];

    for (let i = 0; i < 50; i++) {
        parts.push({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2
        });
    }

    function anim() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#00f3ff';
        parts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        });
        requestAnimationFrame(anim);
    }
    anim();
}