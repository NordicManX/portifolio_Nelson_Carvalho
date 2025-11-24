/* --- CONFIGURAÇÃO DE AMBIENTE --- */
const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : '';

// 1. VERIFICAÇÃO DE SEGURANÇA
const token = localStorage.getItem('nordic_token');
let currentUser = localStorage.getItem('nordic_user') || 'Visitante';
let currentRole = localStorage.getItem('nordic_role') || 'user';
let currentAvatar = localStorage.getItem('nordic_avatar') || '';
let currentDisplayName = localStorage.getItem('nordic_displayName') || currentUser;

if (!token) {
    alert("Acesso não autorizado. Faça login.");
    window.location.href = 'index.html';
}

// 2. INTERFACE DO HEADER
function updateHeaderUI() {
    const userDisplay = document.getElementById('user-display');
    const headerAvatar = document.getElementById('header-avatar');
    const headerIcon = document.getElementById('header-icon');

    userDisplay.innerHTML = `${currentDisplayName} ${currentRole === 'admin' ? '<small style="color:var(--neon-red)">(Admin)</small>' : ''}`;

    if (currentAvatar && currentAvatar.length > 50) {
        headerAvatar.src = currentAvatar;
        headerAvatar.style.display = 'inline-block';
        if (headerIcon) headerIcon.style.display = 'none';
    } else {
        headerAvatar.style.display = 'none';
        if (headerIcon) headerIcon.style.display = 'inline-block';
    }
}
updateHeaderUI();

// 3. CONTROLE DE PRIVILÉGIOS
const adminUsersPanel = document.getElementById('admin-users-panel');

if (currentRole === 'admin') {
    loadUsers();
    if (adminUsersPanel) adminUsersPanel.style.display = 'block';
} else {
    if (adminUsersPanel) adminUsersPanel.style.display = 'none';
}

// 4. LOGOUT
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

// ============================================================
// MÓDULO DE ARQUIVOS
// ============================================================

async function loadFiles() {
    const listContainer = document.getElementById('files-list');
    if (!listContainer) return;
    listContainer.innerHTML = '<p class="loading-text">Carregando dados...</p>';

    try {
        const res = await fetch(`${BASE_URL}/api/files`);
        const files = await res.json();
        listContainer.innerHTML = '';

        if (!files || files.length === 0) {
            listContainer.innerHTML = '<p class="loading-text">Nenhum arquivo encontrado.</p>';
            return;
        }

        files.forEach(file => {
            const iconClass = file.type === 'link' ? 'fas fa-link' : 'fas fa-file-alt';
            const typeClass = file.type === 'link' ? 'type-link' : 'type-file';

            const actionAttr = file.type === 'link'
                ? `href="${file.content}" target="_blank"`
                : `href="#" onclick="downloadBase64('${file.content}', '${file.name}')"`;

            const actionButtons = `
                <button onclick="openEditFileModal('${file._id}', '${file.name}')" class="btn-action" title="Editar"><i class="fas fa-edit"></i></button>
                <button onclick="deleteFile('${file._id}')" class="btn-action btn-delete" title="Excluir"><i class="fas fa-trash"></i></button>
            `;

            const item = document.createElement('div');
            item.className = `dash-file-item ${typeClass}`;
            item.setAttribute('data-name', file.name.toLowerCase());

            item.innerHTML = `
                <i class="${iconClass} df-icon"></i>
                <div class="df-info">
                    <span class="df-name">${file.name}</span>
                    <span class="df-meta">${file.type.toUpperCase()} • ${file.size}</span>
                </div>
                <div class="df-actions">
                    <a ${actionAttr} class="btn-action" title="Acessar"><i class="fas fa-external-link-alt"></i></a>
                    ${actionButtons}
                </div>
            `;
            listContainer.appendChild(item);
        });

        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value) searchInput.dispatchEvent(new Event('input'));

    } catch (error) {
        console.error(error);
        listContainer.innerHTML = '<p style="color:var(--neon-red); text-align:center">Erro ao carregar arquivos.</p>';
    }
}

// PESQUISA
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.dash-file-item');
        items.forEach(item => {
            const name = item.getAttribute('data-name');
            if (name && name.includes(term)) item.style.display = 'flex';
            else item.style.display = 'none';
        });
    });
}

// UPLOAD
const fileInput = document.getElementById('file-input');
if (fileInput) {
    const dropArea = document.getElementById('drop-area');
    const fileNameDisplay = document.getElementById('file-selected-name');

    dropArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            fileNameDisplay.innerText = this.files[0].name;
            const nameInput = document.getElementById('file-name-input');
            if (!nameInput.value) nameInput.value = this.files[0].name;
        }
    });

    document.getElementById('form-file').addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        const name = document.getElementById('file-name-input').value;

        if (!file) return alert("Selecione um arquivo!");
        if (file.size > 4.5 * 1024 * 1024) return alert("Arquivo muito grande! Máximo 4.5MB.");

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async function () {
            await saveFile({
                name: name, type: 'file', content: reader.result,
                size: (file.size / 1024).toFixed(1) + ' KB'
            });
        };
    });

    document.getElementById('form-link').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('link-name-input').value;
        const url = document.getElementById('link-url-input').value;
        await saveFile({ name: name, type: 'link', content: url, size: 'Nuvem' });
    });
}

async function saveFile(payload) {
    const btn = document.querySelector('.upload-form.active .btn-submit');
    const originalText = btn.innerText;
    btn.innerText = "Salvando..."; btn.disabled = true;
    try {
        const res = await fetch(`${BASE_URL}/api/files`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert("Salvo com sucesso!"); loadFiles();
            document.getElementById('form-file').reset(); document.getElementById('form-link').reset();
            const disp = document.getElementById('file-selected-name'); if (disp) disp.innerText = "";
        } else { alert("Erro ao salvar."); }
    } catch (e) { alert("Erro de conexão."); }
    btn.innerText = originalText; btn.disabled = false;
}

// AÇÕES GLOBAIS
window.deleteFile = async function (id) {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) return;
    try { await fetch(`${BASE_URL}/api/files/${id}`, { method: 'DELETE' }); loadFiles(); } catch (e) { alert("Erro."); }
}

const editFileModal = document.getElementById('edit-modal');
const editInput = document.getElementById('edit-name');
const editIdInput = document.getElementById('edit-id');

window.openEditFileModal = function (id, currentName) {
    editIdInput.value = id; editInput.value = currentName;
    editFileModal.classList.add('active');
}

document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal-overlay').classList.remove('active');
    });
});

document.getElementById('save-edit-btn').addEventListener('click', async () => {
    const id = editIdInput.value; const newName = editInput.value;
    try {
        await fetch(`${BASE_URL}/api/files/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName })
        });
        editFileModal.classList.remove('active'); loadFiles();
    } catch (e) { alert("Erro."); }
});

window.downloadBase64 = function (base64, fileName) {
    const link = document.createElement("a"); link.href = base64; link.download = fileName;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

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

// ============================================================
// MÓDULO DE USUÁRIOS
// ============================================================

async function loadUsers() {
    const list = document.getElementById('users-list');
    if (!list) return;
    try {
        const res = await fetch(`${BASE_URL}/api/users`);
        const users = await res.json();
        list.innerHTML = '';
        users.forEach(user => {
            const avatarSrc = (user.avatar && user.avatar.length > 50)
                ? user.avatar
                : 'https://via.placeholder.com/40/000000/FFFFFF/?text=' + user.username.charAt(0).toUpperCase();
            const isAdmin = user.role === 'admin';
            const display = user.displayName || user.username;
            const deleteBtn = (user.username !== currentUser)
                ? `<button onclick="deleteUser('${user._id}')" class="btn-action btn-delete"><i class="fas fa-trash"></i></button>` : '';
            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <img src="${avatarSrc}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--neon-blue)">
                <div class="user-card-info" style="flex:1; overflow:hidden; margin-left:10px;">
                    <span class="user-card-name" style="display:block; font-weight:bold; color:#e0e0e0">${display}</span>
                    <span class="user-card-role ${isAdmin ? 'admin' : ''}" style="font-size:0.75rem; color:#94a3b8">${user.role.toUpperCase()}</span>
                </div>${deleteBtn}`;
            list.appendChild(card);
        });
    } catch (e) { console.error("Erro usuários", e); }
}

window.openNewUserModal = function () { document.getElementById('new-user-modal').classList.add('active'); }

const formNewUser = document.getElementById('form-new-user');
if (formNewUser) {
    formNewUser.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('new-user-login').value;
        const name = document.getElementById('new-user-name').value;
        const pass = document.getElementById('new-user-pass').value;
        const role = document.getElementById('new-user-role').value;
        try {
            const res = await fetch(`${BASE_URL}/api/users`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass, role: role, displayName: name })
            });
            if (res.ok) {
                alert("Usuário criado!"); document.getElementById('new-user-modal').classList.remove('active');
                formNewUser.reset(); loadUsers();
            } else {
                const d = await res.json(); alert(d.error || "Erro");
            }
        } catch (e) { alert("Erro de conexão"); }
    });
}

window.deleteUser = async function (id) {
    if (!confirm("Remover acesso?")) return;
    try { await fetch(`${BASE_URL}/api/users/${id}`, { method: 'DELETE' }); loadUsers(); } catch (e) { alert("Erro"); }
}

// ============================================================
// MÓDULO DE PERFIL
// ============================================================
const profileBtn = document.getElementById('profile-btn');
const profileModal = document.getElementById('profile-modal');
const avatarInput = document.getElementById('avatar-input');
const previewAvatar = document.getElementById('preview-avatar');

if (profileBtn) {
    profileBtn.addEventListener('click', () => {
        document.getElementById('profile-name').value = currentDisplayName;
        if (currentAvatar && currentAvatar.length > 50) previewAvatar.src = currentAvatar;
        profileModal.classList.add('active');
    });
}
if (avatarInput) {
    avatarInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => previewAvatar.src = e.target.result;
            reader.readAsDataURL(this.files[0]);
        }
    });
}
const saveProfileBtn = document.getElementById('save-profile-btn');
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        const newName = document.getElementById('profile-name').value;
        const newPass = document.getElementById('profile-pass').value;
        const file = avatarInput.files[0];
        const btn = saveProfileBtn; btn.innerText = "Salvando..."; btn.disabled = true;
        let payload = { username: currentUser, displayName: newName, password: newPass ? newPass : undefined };
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async function () { payload.avatar = reader.result; await sendProfileUpdate(payload); }
        } else { payload.avatar = currentAvatar; await sendProfileUpdate(payload); }
    });
}
async function sendProfileUpdate(payload) {
    try {
        const res = await fetch(`${BASE_URL}/api/users/profile`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('nordic_displayName', data.user.displayName);
            localStorage.setItem('nordic_avatar', data.user.avatar || '');
            currentDisplayName = data.user.displayName; currentAvatar = data.user.avatar || '';
            alert("Atualizado!"); document.getElementById('profile-modal').classList.remove('active'); updateHeaderUI();
        } else { alert("Erro ao atualizar."); }
    } catch (e) { alert("Erro de conexão."); }
    document.getElementById('save-profile-btn').innerText = "SALVAR ALTERAÇÕES";
    document.getElementById('save-profile-btn').disabled = false;
}

// ============================================================
// PARTICLES (FUNDO ANIMADO) - ATUALIZADO
// ============================================================
const cvs = document.getElementById('particles');
if (cvs) {
    const ctx = cvs.getContext('2d');
    let w = cvs.width = window.innerWidth;
    let h = cvs.height = window.innerHeight;

    // ATUALIZAÇÃO PARA RESPONSIVIDADE (RESIZE)
    window.addEventListener('resize', () => {
        w = cvs.width = window.innerWidth;
        h = cvs.height = window.innerHeight;
    });

    let parts = [];
    for (let i = 0; i < 40; i++) parts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5 });

    function anim() {
        ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#00f3ff';
        parts.forEach(p => {
            p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
        });
        requestAnimationFrame(anim);
    }
    anim();
}

loadFiles();