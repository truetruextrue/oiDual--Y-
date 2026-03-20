/* ═══════════════════════════════════════════════════════════
   0x00 · INICIAR · B · D8
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-matrix-densa-arquitetura-veeb/js/0x00_iniciar_B_D8.js
   Opcode    : 0x00 · INICIAR · ○ · 396Hz
   V.E.E.B.  : Base
   Degrau    : D8 (system)
   Fórmula   : Base · ponto zero · S=Σbᵢ·2^(i-1) · identidade do sistema
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 251  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=396)
     χ = -20  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
// ===== CONFIGURAÇÕES =====
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const TEMPERATURE = 0.2;
let apiKey = localStorage.getItem('di_apiKey') || '';
let modelName = localStorage.getItem('di_modelName') || 'nvidia/nemotron-3-nano-30b-a3b:free';
let training = localStorage.getItem('di_trainingText') || '';
let assistantEnabled = (localStorage.getItem('di_assistantEnabled') === '1');
let trainingActive = (localStorage.getItem('di_trainingActive') !== '0');
let conversation = [];
let pages = [], currentPage = 0, autoAdvance = true;

// ===== UTILITÁRIOS =====
const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const createEl = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
const showToaster = (txt, type='default') => { /* (implementar conforme necessário) */ };
const speakText = (txt, onend) => {
  if (!txt) { if (onend) onend(); return; }
  const u = new SpeechSynthesisUtterance(txt);
  u.lang = 'pt-BR'; u.rate = 0.99; u.pitch = 1.1;
  if (onend) u.onend = onend;
  speechSynthesis.speak(u);
};

// ===== PARSER MARKDOWN SIMPLES =====
function mdToHtml(md) {
  if (!md) return '';
  md = md.replace(/```([^`]*)```/gs, (_, code) => '<pre><code>' + escapeHtml(code) + '</code></pre>');
  md = md.replace(/`([^`]+)`/g, (_, c) => '<code>' + escapeHtml(c) + '</code>');
  md = md.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  md = md.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  md = md.replace(/(^|\n)[\-\*]\s+(.+?)(?=\n|$)/g, (_, pre, item) => pre + '<li>' + item + '</li>');
  md = md.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  const paras = md.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return paras.map(p => '<p>' + p.replace(/\n/g,'<br>') + '</p>').join('');
}

// ===== DIVISÃO EM BLOCOS PARA PAGINAÇÃO =====
const splitBlocks = text => {
  if (!text || !text.trim()) return [['Sem conteúdo.','','']];
  let paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (paras.length < 3 || paras.length % 3 !== 0) {
    const sens = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    paras = sens.map(s => s.trim()).filter(Boolean);
  }
  const groups = [];
  for (let i=0; i<paras.length; i+=3) groups.push(paras.slice(i, i+3));
  return groups;
};

// ===== RENDERIZAÇÃO DAS PÁGINAS =====
const renderPaginatedResponse = text => {
  speechSynthesis.cancel();
  autoAdvance = true;
  const respEl = document.getElementById('response');
  Array.from(respEl.querySelectorAll('.page')).forEach(p => { if (!p.classList.contains('initial')) p.remove(); });
  pages = [];
  const groups = splitBlocks(text);
  const titles = ['🎁 Recompensa Inicial','👁️ Exploração e Curiosidade','⚡ Antecipação Vibracional'];
  const controls = respEl.querySelector('.response-controls');

  groups.forEach((tris, gi) => {
    const page = createEl('div', gi === 0 ? 'page active' : 'page');
    tris.forEach((body, j) => {
      const cls = j===0 ? 'intro' : j===1 ? 'middle' : 'ending';
      const htmlBody = mdToHtml(body);
      const b = createEl('div', 'response-block '+cls, `<h3>${titles[j]}</h3><div class="block-body">${htmlBody}</div>`);
      const meta = createEl('div','meta');
      const crystalBtn = createEl('button','crystal-btn','✶');
      crystalBtn.title = 'Cristalizar';
      crystalBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        cristalizar({ title: titles[j], content: body });
        crystalBtn.innerText = '✓'; setTimeout(() => crystalBtn.innerText = '✶', 1200);
      });
      meta.appendChild(crystalBtn);
      b.appendChild(meta);
      b.dataset.state = '';
      b.addEventListener('click', (ev) => {
        if (ev.target.closest('.meta')) return;
        const alreadySpoken = b.dataset.state === 'spoken';
        if (!alreadySpoken) {
          speechSynthesis.cancel();
          const textToSpeak = b.querySelector('.block-body') ? b.querySelector('.block-body').innerText : body;
          speakText(textToSpeak);
          b.classList.add('clicked'); b.dataset.state = 'spoken';
        } else {
          b.classList.add('expanded'); b.dataset.state = '';
          if (!assistantEnabled) {
            assistantEnabled = true; localStorage.setItem('di_assistantEnabled','1');
            updateToggleBtnVisual();
            if (training && trainingActive) conversation.unshift({ role:'system', content: training });
          }
          const blockText = `${titles[j]}\n\n${body}`;
          showLoading('Pulso em Expansão...');
          speakText('Pulso em Expansão...');
          conversation.push({ role:'user', content: blockText });
          callAI();
        }
      });
      page.appendChild(b);
    });
    page.appendChild(createEl('p','footer-text','<em>Do seu jeito. <strong>Sempre</strong> único. <strong>Sempre</strong> seu.</em>'));
    if (controls && controls.parentNode) respEl.insertBefore(page, controls);
    else respEl.appendChild(page);
    pages.push(page);
  });

  currentPage = 0;
  const pi = document.getElementById('pageIndicator');
  if (pi) pi.textContent = `1 / ${pages.length}`;
  speakPage(0);
};

const speakPage = i => {
  const page = pages[i]; if (!page) return;
  const body = Array.from(page.querySelectorAll('.block-body')).map(n => n.innerText).join(' ');
  speakText(body, () => {
    if (!autoAdvance) return;
    if (i < pages.length - 1) { changePage(1); speakPage(i+1); } else { speakText('Sempre único, sempre seu.'); }
  });
};

const changePage = offset => {
  const np = currentPage + offset; if (np<0 || np>=pages.length) return;
  pages[currentPage]?.classList.remove('active');
  pages[np]?.classList.add('active');
  currentPage = np;
  const pi = document.getElementById('pageIndicator');
  if (pi) pi.textContent = `${currentPage+1} / ${pages.length}`;
};

const showLoading = msg => {
  const respEl = document.getElementById('response');
  const controls = respEl.querySelector('.response-controls');
  respEl.querySelectorAll('.page').forEach(p => { if(!p.classList.contains('initial')) p.remove(); });
  const page = createEl('div','page active');
  page.appendChild(createEl('p','footer-text',msg));
  if (controls && controls.parentNode) respEl.insertBefore(page, controls);
  else respEl.appendChild(page);
  pages = [page]; currentPage = 0;
  const pi = document.getElementById('pageIndicator');
  if (pi) pi.textContent = '…';
};

// ===== CHAMADA À API =====
async function callAI() {
  apiKey = localStorage.getItem('di_apiKey') || apiKey;
  if (!apiKey) {
    alert('Nenhuma API Key ativa! Ative uma chave no Card (Cofre) ou no Painel.');
    return;
  }
  const messagesToSend = [];
  if (assistantEnabled && trainingActive && training) messagesToSend.push({ role:'system', content: training });
  conversation.forEach(m => { if (m.role !== 'system') messagesToSend.push(m); });

  try {
    const resp = await fetch(API_ENDPOINT, {
      method:'POST',
      headers:{ 'Authorization':`Bearer ${apiKey}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ model: modelName, messages: messagesToSend, temperature: TEMPERATURE })
    });
    if (!resp.ok) throw new Error('Erro API: ' + resp.status);
    const data = await resp.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || 'Resposta vazia';
    conversation.push({ role:'assistant', content: answer });
    renderPaginatedResponse(answer);
  } catch (err) {
    console.error(err);
    const errorMsg = 'Falha na conexão. Verifique se a chave está ativa no Card.';
    conversation.push({ role:'assistant', content: errorMsg });
    renderPaginatedResponse(errorMsg);
  }
}

async function sendMessage() {
  const respEl = document.getElementById('response');
  const initPage = respEl.querySelector('.page.initial');
  if (initPage) initPage.remove();
  const input = document.getElementById('userInput');
  const raw = input.value.trim(); if (!raw) return;
  input.value = '';
  speechSynthesis.cancel(); speakText('');

  if (raw.toLowerCase().includes('oi dual')) {
    assistantEnabled = true; localStorage.setItem('di_assistantEnabled','1');
    updateToggleBtnVisual();
    showLoading('Conectando Dual Infodose...');
    if (training && trainingActive) conversation.unshift({ role:'system', content: training });
  } else { showLoading('Processando...'); }
  conversation.push({ role:'user', content: raw });
  callAI();
}

// ===== CRISTALIZAÇÃO =====
const CRYSTAL_KEY = 'di_cristalizados';
function cristalizar({ title, content }) {
  const list = JSON.parse(localStorage.getItem(CRYSTAL_KEY) || '[]');
  list.unshift({ id: Date.now(), title, content, user: userName, infodose: infodoseName, at: new Date().toISOString() });
  localStorage.setItem(CRYSTAL_KEY, JSON.stringify(list));
  refreshCrystalList();
}
function refreshCrystalList() {
  const list = JSON.parse(localStorage.getItem(CRYSTAL_KEY) || '[]');
  const el = document.getElementById('crystalList'); el.innerHTML = '';
  if (!list.length) { el.innerHTML = '<div class="small">Vazio.</div>'; return; }
  list.forEach(it => {
    const row = createEl('div','crystal-item');
    const left = createEl('div','','<strong>'+it.title+'</strong><div class="small">'+(it.infodose||'')+'</div><div style="margin-top:4px;font-size:0.8em">'+it.content.slice(0,100)+'...</div>');
    const actions = createEl('div','actions');
    const copyBtn = createEl('button','btn btn-sec','Copy'); copyBtn.onclick=()=>navigator.clipboard.writeText(it.content);
    const delBtn = createEl('button','btn btn-sec','Del'); delBtn.onclick=()=>{
      const arr=JSON.parse(localStorage.getItem(CRYSTAL_KEY)||'[]');
      localStorage.setItem(CRYSTAL_KEY, JSON.stringify(arr.filter(x=>x.id!==it.id)));
      refreshCrystalList();
    };
    actions.append(copyBtn, delBtn); row.append(left, actions); el.appendChild(row);
  });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async () => {
  // Configurar vozes
  speechSynthesis.onvoiceschanged = () => { window._vozes = speechSynthesis.getVoices(); };

  // Botões principais
  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  document.getElementById('userInput').addEventListener('keypress', e => { if (e.key==='Enter') sendMessage(); });
  document.querySelector('[data-action="prev"]').addEventListener('click', () => changePage(-1));
  document.querySelector('[data-action="next"]').addEventListener('click', () => changePage(1));

  // Botão toggle (assistente)
  const toggleBtn = document.getElementById('toggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      assistantEnabled = !assistantEnabled;
      localStorage.setItem('di_assistantEnabled', assistantEnabled ? '1' : '0');
      showToaster(assistantEnabled ? 'Assistant ON' : 'Assistant OFF', assistantEnabled ? 'success' : 'default');
      updateToggleBtnVisual();
    });
    updateToggleBtnVisual();
  }

  // Botão cristal
  document.getElementById('crystalBtn')?.addEventListener('click', ()=>{
    refreshCrystalList();
    document.getElementById('crystalModal').classList.add('active');
  });
  document.getElementById('closeCrystal')?.addEventListener('click', ()=>document.getElementById('crystalModal').classList.remove('active'));

  // Exportar/limpar cristais
  document.getElementById('exportAllCrystal')?.addEventListener('click', ()=>{
    const list = JSON.parse(localStorage.getItem(CRYSTAL_KEY)||'[]');
    if(!list.length) return alert('Nada.');
    const b = new Blob([JSON.stringify(list,null,2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download='crystals.json'; a.click();
  });
  document.getElementById('clearAllCrystal')?.addEventListener('click', ()=>{
    localStorage.removeItem(CRYSTAL_KEY); refreshCrystalList();
  });
});

function updateToggleBtnVisual() {
  const btn = document.getElementById('toggleBtn');
  if (!btn) return;
  if (assistantEnabled) {
    btn.classList.add('active');
    btn.title = "Assistant ON";
  } else {
    btn.classList.remove('active');
    btn.title = "Assistant OFF";
  }
}