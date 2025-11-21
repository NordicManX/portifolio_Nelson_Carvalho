# ⚡Nelon Ántonio Filho - Portfolio

![Project Status](https://img.shields.io/badge/status-active-success?style=for-the-badge&logo=github)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

> Um portfólio minimalista, de alta performance e com estética Cyberpunk/Nordic. Desenvolvido em Vanilla JavaScript com foco em interatividade e consumo de APIs.

---

## 📸 Preview

<div align="center">
  <img src="./assets/preview.png" alt="Preview do Portfolio" width="100%">
  <br>
  <em>Spotlight interativo com grade líquida e design Neon Blue.</em>
</div>

---

## 🚀 Tecnologias

O projeto foi construído utilizando as melhores práticas de **Clean Code** e separação de responsabilidades (MVC no Front-end).

* ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) **Estrutura Semântica**
* ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) **Variáveis, Flexbox, Grid & Animações**
* ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) **ES6+, Fetch API, Canvas API & Async/Await**
* ![Formspree](https://img.shields.io/badge/Formspree-Red?style=for-the-badge) **Backend-as-a-Service para Emails**

---

## 🧬 Funcionalidades Principais

### 1. Liquid Grid & Spotlight (Canvas)
Um fundo interativo desenhado via **HTML5 Canvas**. 
- **Spotlight:** O mouse funciona como uma lanterna que revela os pontos da grade.
- **Física Líquida:** Os pontos sofrem repulsão do mouse e retornam suavemente à posição original com efeito elástico (*Lerp*).
- **Pulsação:** O campo de luz "respira" (aumenta e diminui) organicamente.
- **Responsivo:** A densidade de pontos e o tamanho da luz se ajustam automaticamente para Mobile ou Desktop.

### 2. Integração GitHub API
Os projetos não são estáticos. O site consome a API pública do GitHub para:
- Listar repositórios reais do usuário.
- Exibir estatísticas (Linguagem, Stars, Forks).
- **Paginação Automática:** Exibe 8 projetos por vez com controles de navegação e animação de entrada (Fade-in cascata).

### 3. Formulário AJAX (HUD Style)
Sistema de contato integrado ao **Formspree**.
- Validação de campos.
- Envio assíncrono (AJAX): A página **não recarrega**.
- Feedback visual de "Enviando..." e tela de "Transmissão Confirmada" estilizada.

---

## ⚙️ Como Configurar

Para usar este template, clone o repositório e edite as variáveis principais:

### 1. Clonar
```bash
git clone [https://github.com/SEU-USUARIO/nome-do-repo.git](https://github.com/SEU-USUARIO/nome-do-repo.git)
cd nome-do-repo
