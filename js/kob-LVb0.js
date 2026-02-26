
    'use strict';

    /* =========================================================
       1. UTILITÁRIOS E "MOCKS" DO SISTEMA (Base do Livro Vivo)
       ========================================================= */
    const $ = (q, r=document) => r.querySelector(q);
    const $$ = (q, r=document) => [...r.querySelectorAll(q)];

    window.toast = (msg) => {
      const c = $('#toast-container');
      const t = document.createElement('div');
      t.className = 'toast-msg'; t.textContent = msg;
      c.appendChild(t);
      setTimeout(() => { t.style.opacity = '0'; setTimeout(()=>t.remove(), 300); }, 2500);
    };

    function escapeHtml(str) {
      if(!str) return '';
      return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[m]);
    }

    function analyzeMD(md) {
      const txt = (md||'').trim();
      return {
        words: txt ? txt.split(/\s+/).length : 0,
        headings: (txt.match(/^#{1,6}\s/gm) || []).length,
        code: (txt.match(/```/g) || []).length / 2,
        quotes: (txt.match(/^>\s/gm) || []).length
      };
    }

    /* Sistema de Banco de Dados Local Fake para os Stacks */
    const DB_KEY = 'tl_stacks_monolith';
    function libLoad() {
      let data = JSON.parse(localStorage.getItem(DB_KEY) || 'null');
      if (!data) {
        // Mock inicial se estiver vazio
        data = [{
          id: 'doc_' + Date.now(),
          title: 'A Jornada da Inteligência',
          md: '<h2>Introdução</h2>\n<p>Este é um documento de demonstração integrado na interface do monólito.</p>\n<p>Você pode testar a leitura do <strong>TTS Dock</strong> clicando em qualquer parágrafo se o Outline estiver ligado.</p>\n<ul>\n<li>O sistema agora funciona como uma página única.</li>\n<li>Sinta-se à vontade para excluir ou renomear.</li>\n</ul>',
          createdAt: Date.now()
        }];
        localStorage.setItem(DB_KEY, JSON.stringify(data));
      }
      return data;
    }

    function libUpdate(id, changes) {
      const data = libLoad();
      const idx = data.findIndex(d => d.id === id);
      if (idx > -1) {
        data[idx] = { ...data[idx], ...changes };
        localStorage.setItem(DB_KEY, JSON.stringify(data));
      }
    }

    function libDel(id) {
      const data = libLoad().filter(d => d.id !== id);
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    // Função que "Lê" e renderiza o markdown na tela (simples para o monólito)
    function autoBuild(mdHtml) {
      const root = $('#root');
      root.innerHTML = `
        <div class="doc-reader">
          ${mdHtml}
          <div style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
             <button class="btn" data-action="home">← Voltar para Home</button>
          </div>
        </div>
      `;
      // Aviso o TTS para recalcular os blocos disponíveis
      if(window.ttsRebuild) window.ttsRebuild();
    }

    /* =========================================================
       2. AÇÕES GLOBAIS (O window.ACTIONS estendido)
       ========================================================= */
    window.ACTIONS = {
      'back'() { renderWelcome(); },
      'home'() { renderWelcome(); },
      'welcome'() { renderWelcome(); },
      'open-doc'(el) { 
        const id = el.dataset.id; 
        const doc = libLoad().find(d => d.id === id); 
        if(!doc) return; 
        autoBuild(doc.md); 
      },
      'del-doc'(el) { 
        const id = el.dataset.id; 
        if(confirm('Excluir documento?')){
          libDel(id); renderWelcome(); toast('Documento removido'); 
        }
      },
      'rename-doc'(el) { 
        const id = el.dataset.id; 
        const doc = libLoad().find(d => d.id === id); 
        if(!doc) return; 
        const novo = prompt('Novo título', doc.title) || ''; 
        if(novo.trim()) { 
          libUpdate(id, { title: novo.trim(), updatedAt: new Date().toISOString() }); 
          renderWelcome(); toast('Renomeado com sucesso'); 
        } 
      },
      'analisar-doc'(el) { 
        const id = el.dataset.id; 
        const doc = libLoad().find(d => d.id === id); 
        if(!doc) return; 
        const a = analyzeMD(doc.md); 
        toast(`Palavras: ${a.words} | Cabeçalhos: ${a.headings}`); 
      },
      'md-doc'(el) { 
        const id = el.dataset.id; 
        const doc = libLoad().find(d => d.id === id); 
        if(!doc) return; 
        const blob = new Blob([doc.md], {type: 'text/markdown'}); 
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = (doc.title || 'documento') + '.md'; 
        a.click(); URL.revokeObjectURL(a.href); 
      },
      'save-name'() { 
        const el = document.getElementById('welcomeName'); 
        const v = (el && el.value || '').trim(); 
        if(v) { localStorage.setItem('tl_user_name', v); toast('Nome salvo!'); } 
        else { localStorage.removeItem('tl_user_name'); toast('Nome limpo!'); } 
        renderWelcome(); 
      },
      'demo-btn'() {
        // Criar um doc de teste para ver a tela funcionando
        const data = libLoad();
        data.push({
          id: 'doc_' + Date.now(),
          title: 'Novo Documento ' + (data.length + 1),
          md: '<h2>Documento Gerado</h2><p>Este texto foi gerado via botão Demo.</p><p>Use o TTS Dock no canto da tela para escutar a leitura.</p>',
          createdAt: Date.now()
        });
        localStorage.setItem(DB_KEY, JSON.stringify(data));
        renderWelcome();
        toast('Novo stack criado!');
      },
      // Funções visuais/dummy para o resto dos botões pedidos no script
      'importar'(){ toast('Função de Enviar arquivo (Simulação)'); },
      'gerar'(){ toast('Função Gerar do Editor (Simulação)'); },
      'nested'(){ toast('Gerar Aninhado (Simulação)'); },
      'pdf'(){ toast('Função Imprimir PDF (Simulação)'); },
      'reading'(){ document.body.classList.toggle('reading-mode'); toast('Modo leitura alternado'); },
      'theme'(){ toast('Troca de tema (Simulação)'); }
    };

    // Delegação Global de Cliques (Roteador de Ações)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        const act = btn.dataset.action;
        if (window.ACTIONS[act]) {
          e.preventDefault();
          window.ACTIONS[act](btn);
        }
      }
    });

    /* =========================================================
       3. RENDERIZAÇÃO DA HOME (Baseada no seu script)
       ========================================================= */
    function renderWelcome() {
      const name = localStorage.getItem('tl_user_name') || '';
      const root = document.getElementById('root');
      const stacks = libLoad();
      
      const cards = stacks.map(d => {
        const a = analyzeMD(d.md);
        const dt = new Date(d.updatedAt || d.createdAt || Date.now()).toLocaleString();
        return `
        <div class="stack-card">
          <h4>${escapeHtml(d.title || 'Sem título')}</h4>
          <div class="meta">${dt} · ${a.words} palavras</div>
          <div class="row">
            <button class="btn" data-action="open-doc" data-id="${d.id}">Abrir</button>
            <button class="btn" data-action="rename-doc" data-id="${d.id}">Renomear</button>
            <button class="btn" data-action="md-doc" data-id="${d.id}">Baixar</button>
            <button class="btn" data-action="analisar-doc" data-id="${d.id}">Analisar</button>
            <button class="btn" style="background:rgba(255,50,50,0.2); border-color:rgba(255,50,50,0.4);" data-action="del-doc" data-id="${d.id}">Excluir</button>
          </div>
        </div>`;
      }).join('');

      root.innerHTML = `
      <details class="acc" open>
        <summary><span class="chev">📂</span><h2>👋 Boas‑vindas${name ? (', ' + escapeHtml(name)) : ''}</h2></summary>
        <div class="sec">
          <div class="welcome">
            <div class="row" style="align-items:center; margin-bottom: 20px;">
              <input id="welcomeName" class="field" placeholder="Seu nome..." value="${escapeHtml(name)}"/>
              <button class="btn" data-action="save-name">Salvar nome</button>
              <button class="btn" data-action="importar">Enviar Documento</button>
              <button class="btn" data-action="demo-btn">Gerar Demo</button>
              <button class="btn" data-action="gerar">Gerar do Editor</button>
              <button class="btn" data-action="nested">Gerar (aninhado)</button>
              <button class="btn" data-action="pdf">Imprimir (PDF)</button>
              <button class="btn" data-action="reading">Modo Leitura</button>
              <button class="btn" data-action="theme">Trocar Tema</button>
            </div>
            
            <div class="small">Stacks salvos no dispositivo:</div>
            <div class="stack-grid">
              ${cards || '<div class="small" style="opacity:.8; padding: 20px;">Sem documentos salvos ainda.</div>'}
            </div>
          </div>
        </div>
      </details>`;

      // Avisa o TTS Dock que o conteúdo da tela mudou
      if(window.ttsRebuild) window.ttsRebuild();
    }

    /* =========================================================
       4. PATCH DO MASTERBLOCK NATIVO
       ========================================================= */
    function ensureHomeInMaster() {
      const area = $('#masterActions');
      if(!area) return;
      if(!area.querySelector('[data-act="home"]')){
        const b = document.createElement('button');
        b.className = 'chip'; b.textContent = '🏠 Home'; b.dataset.act = 'home';
        b.dataset.action = 'home'; // Linka com nosso sistema de actions nativo
        area.insertBefore(b, area.firstChild);
      }
    }

    /* =========================================================
       5. KOBLLUX TTS DOCK V32 (Totalmente Integrado)
       ========================================================= */
    function initTTS() {
      const POS_KEY  = 'kob_tts_pos_standalone';
      const PREF_KEY = 'kob_tts_prefs_standalone';
      const BLOCK_SEL= ['h1','h2','h3','h4','h5','h6','p','li','blockquote','.callout','.equation','pre','td','th','.stack-card h4'].join(',');

      const PREFS = Object.assign({ outline: true, clickToSpeak: true }, JSON.parse(localStorage.getItem(PREF_KEY)||'{}'));
      const setCSS = (v,val)=> document.documentElement.style.setProperty(v,val);

      // Criação do Dock Flutuante
      const dock = document.createElement('div');
      dock.className = 'kob-tts-dock';
      dock.innerHTML = `
        <button id="tts-on" title="Voz On/Off" aria-pressed="false">🔊</button>
        <button id="tts-prev" title="Anterior">◀</button>
        <button id="tts-next" title="Próximo">▶</button>
        <button id="tts-sel" title="Ler seleção">✂︎</button>
        <button id="tts-stop" title="Parar">■</button>
        <button id="tts-reread" title="Re-Ler">⟳</button>
        <button id="tts-grid" title="Outline / Click-to-Speak">⌗</button>
        <button id="tts-voice" title="Trocar Voz">🎙</button>
        <small id="tts-status">Pronto</small>
      `;
      document.body.appendChild(dock);

      const outline = document.getElementById('kob-tts-outline');

      // Sistema de Drag and Drop Nativo
      (()=>{ 
        try{ const s=JSON.parse(localStorage.getItem(POS_KEY)); if(s){ setCSS('--tts-left', s.left); setCSS('--tts-bottom', s.bottom); } }catch{}
        let sx=0,sy=0,sl=0,sb=0,drag=false;
        const onDown=(ev)=>{ 
          if(ev.target.tagName === 'BUTTON') return;
          const e=ev.touches?ev.touches[0]:ev; drag=true; dock.classList.add('is-drag'); sx=e.clientX; sy=e.clientY;
          const cs=getComputedStyle(document.documentElement);
          sl=parseFloat(cs.getPropertyValue('--tts-left'))||16; sb=parseFloat(cs.getPropertyValue('--tts-bottom'))||20;
          addEventListener('pointermove',onMove,{passive:false}); addEventListener('pointerup',onUp,{passive:false});
          addEventListener('touchmove',onMove,{passive:false}); addEventListener('touchend',onUp,{passive:false});
        };
        const onMove=(ev)=>{ 
          if(!drag) return; const e=ev.touches?ev.touches[0]:ev;
          setCSS('--tts-left', Math.max(0, sl+(e.clientX-sx))+'px');
          setCSS('--tts-bottom', Math.max(0, sb-(e.clientY-sy))+'px');
        };
        const onUp=()=>{ 
          if(!drag) return; drag=false; dock.classList.remove('is-drag'); 
          localStorage.setItem(POS_KEY, JSON.stringify({ left: getComputedStyle(document.documentElement).getPropertyValue('--tts-left').trim(), bottom: getComputedStyle(document.documentElement).getPropertyValue('--tts-bottom').trim() }));
        };
        dock.addEventListener('pointerdown',onDown); dock.addEventListener('touchstart',onDown);
      })();

      // Engine de Voz
      const synth = window.speechSynthesis;
      let VOICES=[], baseVoice=null, voiceIdx=0;
      function loadVoices(){ VOICES=synth.getVoices()||[]; const pt=VOICES.filter(v=>/pt/i.test(v.lang)); baseVoice=pt[0]||VOICES[0]||null; }
      if(synth){ synth.onvoiceschanged = loadVoices; loadVoices(); }

      // Core State
      let blocks=[], idx=0, speaking=false;
      const setPressed = (btn,on)=> btn?.setAttribute('aria-pressed', on?'true':'false');
      const setStatus = t => { const e=$('#tts-status',dock); if(e) e.textContent=String(t); };

      // Expõe rebuild para uso global (Quando muda de Home para Documento)
      window.ttsRebuild = function rebuild() {
        blocks = $$('#root '+BLOCK_SEL).map(node => ({ node, raw: node.innerText.trim() })).filter(b => b.raw);
        idx = 0;
        setStatus(blocks.length ? `${blocks.length} blocos` : 'Vazio');
      };

      function highlight(){
        $$('[data-tts-current]').forEach(el=>el.removeAttribute('data-tts-current'));
        const b=blocks[idx]; if(!b) return;
        b.node.setAttribute('data-tts-current','true');
        if(PREFS.outline){
          const r=b.node.getBoundingClientRect();
          outline.style.display='block';
          outline.style.left=(window.scrollX+r.left-6)+'px'; outline.style.top=(window.scrollY+r.top-6)+'px';
          outline.style.width=(r.width+12)+'px'; outline.style.height=(r.height+12)+'px';
          try{ b.node.scrollIntoView({behavior:'smooth', block:'center'}); }catch{}
        }
      }

      function speakCurrent(){
        if(idx>=blocks.length){ speaking=false; setPressed($('#tts-on',dock),false); toast('Fim da leitura.'); outline.style.display='none'; return; }
        const b = blocks[idx];
        let text = (b.raw||'').replace(/\bCopiar\b/g, ' ').replace(/\s{2,}/g,' ').trim();
        if(!text){ idx++; return speakCurrent(); }

        try{ synth.cancel(); }catch{}
        const u = new SpeechSynthesisUtterance(text);
        if(baseVoice) u.voice = baseVoice;
        u.lang = baseVoice?.lang || 'pt-BR';
        u.onend = u.onerror = ()=>{ if(speaking){ idx++; speakCurrent(); } };

        highlight();
        setStatus(`${idx+1}/${blocks.length}`);
        synth.speak(u);
      }

      function toggle(){ 
        if(speaking){ speaking=false; synth?.cancel(); setPressed($('#tts-on',dock),false); outline.style.display='none'; setStatus('Pausado'); }
        else { speaking=true; setPressed($('#tts-on',dock),true); speakCurrent(); }
      }

      // Eventos dos botões do Dock
      $('#tts-on',dock).onclick = toggle;
      $('#tts-prev',dock).onclick = ()=>{ speaking=true; setPressed($('#tts-on',dock),true); idx=Math.max(0,idx-1); speakCurrent(); };
      $('#tts-next',dock).onclick = ()=>{ speaking=true; setPressed($('#tts-on',dock),true); idx++; speakCurrent(); };
      $('#tts-stop',dock).onclick = ()=>{ speaking=false; synth?.cancel(); setPressed($('#tts-on',dock),false); outline.style.display='none'; setStatus('Parado'); };
      $('#tts-reread',dock).onclick = ()=>{ window.ttsRebuild(); speaking=true; setPressed($('#tts-on',dock),true); speakCurrent(); };
      
      $('#tts-grid',dock).onclick = ()=>{ 
        PREFS.outline = !PREFS.outline; PREFS.clickToSpeak = PREFS.outline; 
        localStorage.setItem(PREF_KEY, JSON.stringify(PREFS));
        setPressed($('#tts-grid',dock), PREFS.outline);
        if(!PREFS.outline) outline.style.display='none'; else highlight();
        toast(PREFS.outline ? 'Outline Ligado' : 'Outline Desligado');
      };
      setPressed($('#tts-grid',dock), PREFS.outline);

      $('#tts-voice',dock).onclick = ()=>{ 
        const pt = VOICES.filter(v=>/pt/i.test(v.lang)); if(!pt.length) return;
        voiceIdx = (voiceIdx+1) % pt.length; baseVoice = pt[voiceIdx];
        toast('Voz: ' + (baseVoice.name||baseVoice.lang));
      };

      $('#tts-sel',dock).onclick = ()=>{
        const t = String(window.getSelection()).trim();
        if(!t){ toast('Selecione algo na tela primeiro.'); return; }
        synth?.cancel(); const u=new SpeechSynthesisUtterance(t);
        if(baseVoice) u.voice=baseVoice; synth.speak(u);
      };

      // Click to Speak nativo
      document.addEventListener('click', (ev)=>{
        if(!PREFS.clickToSpeak || ev.target.closest('.kob-tts-dock') || ev.target.closest('button')) return;
        const blk = ev.target.closest(BLOCK_SEL);
        if(!blk) return;
        const i = blocks.findIndex(b=> b.node===blk);
        if(i > -1) { idx=i; speaking=true; setPressed($('#tts-on',dock),true); speakCurrent(); }
      });
    }

    /* =========================================================
       6. BOOT INICIAL
       ========================================================= */
    document.addEventListener('DOMContentLoaded', () => {
      ensureHomeInMaster();
      renderWelcome();
      initTTS();
    });

  