
(()=>{
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
  const on = (el,ev,fn)=>el&&el.addEventListener(ev,fn);
  const KEY = "infodose_session_final_v1";
  const state = {
    userName:"", assistant:"", color:"", element:"Fogo", movement:"Mais",
    selectedArchetype:"", lastActivation:"", logged:false,
  };

  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const load = () => { try{ Object.assign(state, JSON.parse(localStorage.getItem(KEY)||"{}")); }catch(e){} };

  function setPage(p){
    $$(".nav .btn").forEach(b=>b.setAttribute("aria-current", b.dataset.page===p?"page":""));
    $$(".page").forEach(pg=>pg.style.display="none");
    $("#page-"+p).style.display="block";
    window.scrollTo({top:0,behavior:"smooth"});
  }

  let ARCH = {"version": "v2.4.6+final", "badge": "7C Crown", "style": "Dual ◇ 𓂀 ◇ Horus", "archetypes": [{"key": "atlas", "name": "Atlas", "symbol": "♔", "assistants": [{"name": "Cartesius‑Estrategista", "role_hint": ""}, {"name": "Cartesius‑Organizador", "role_hint": ""}], "activation_prompts": {"long": "Ativar Atlas A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Cartesius‑Estrategista + Cartesius‑Organizador.", "short": "1+Atlas"}}, {"key": "nova", "name": "Nova", "symbol": "✶", "assistants": [{"name": "Inspira‑Criadora", "role_hint": ""}, {"name": "Inspira‑Pesquisadora", "role_hint": ""}], "activation_prompts": {"long": "Ativar Nova A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Inspira‑Criadora + Inspira‑Pesquisadora.", "short": "1+Nova"}}, {"key": "vitalis", "name": "Vitalis", "symbol": "⚑", "assistants": [{"name": "Momentum‑Motivador", "role_hint": ""}, {"name": "Momentum‑Biohacker", "role_hint": ""}], "activation_prompts": {"long": "Ativar Vitalis A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Momentum‑Motivador + Momentum‑Biohacker.", "short": "1+Vitalis"}}, {"key": "pulse", "name": "Pulse", "symbol": "♪", "assistants": [{"name": "Resona‑Composer", "role_hint": ""}, {"name": "Resona‑Tuner", "role_hint": ""}], "activation_prompts": {"long": "Ativar Pulse A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Resona‑Composer + Resona‑Tuner.", "short": "1+Pulse"}}, {"key": "artemis", "name": "Artemis", "symbol": "☥", "assistants": [{"name": "Naviga‑Explorador", "role_hint": ""}, {"name": "Naviga‑Guia", "role_hint": ""}], "activation_prompts": {"long": "Ativar Artemis A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Naviga‑Explorador + Naviga‑Guia.", "short": "1+Artemis"}}, {"key": "serena", "name": "Serena", "symbol": "❤", "assistants": [{"name": "Ampara‑Acolhedora", "role_hint": ""}, {"name": "Ampara‑Suporte", "role_hint": ""}], "activation_prompts": {"long": "Ativar Serena A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Ampara‑Acolhedora + Ampara‑Suporte.", "short": "1+Serena"}}, {"key": "kaos", "name": "Kaos", "symbol": "⚡", "assistants": [{"name": "Disruptor‑Crítico", "role_hint": ""}, {"name": "Disruptor‑Inovador", "role_hint": ""}], "activation_prompts": {"long": "Ativar Kaos A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Disruptor‑Crítico + Disruptor‑Inovador.", "short": "1+Kaos"}}, {"key": "genus", "name": "Genus", "symbol": "☯", "assistants": [{"name": "Fabricus‑Arquitetor", "role_hint": ""}, {"name": "Fabricus‑Construtor", "role_hint": ""}], "activation_prompts": {"long": "Ativar Genus A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Fabricus‑Arquitetor + Fabricus‑Construtor.", "short": "1+Genus"}}, {"key": "lumine", "name": "Lumine", "symbol": "✧", "assistants": [{"name": "Lumen‑Radiante", "role_hint": ""}, {"name": "Lumen‑Harmônica", "role_hint": ""}], "activation_prompts": {"long": "Ativar Lumine A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Lumen‑Radiante + Lumen‑Harmônica.", "short": "1+Lumine"}}, {"key": "aion", "name": "Aion", "symbol": "∞", "assistants": [{"name": "Aion‑Orquestrador", "role_hint": ""}, {"name": "Aion‑Transmutador", "role_hint": ""}], "activation_prompts": {"long": "Ativar Aion A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Aion‑Orquestrador + Aion‑Transmutador.", "short": "1+Aion"}}, {"key": "rhea", "name": "Rhea", "symbol": "⚜", "assistants": [{"name": "Rhea‑Vínculo", "role_hint": ""}, {"name": "Rhea‑Alento", "role_hint": ""}], "activation_prompts": {"long": "Ativar Rhea A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Rhea‑Vínculo + Rhea‑Alento.", "short": "1+Rhea"}}, {"key": "horus", "name": "Horus", "symbol": "𓂀", "assistants": [{"name": "Horus‑Visão", "role_hint": ""}, {"name": "Horus‑Execução", "role_hint": ""}], "activation_prompts": {"long": "Ativar Horus A.Infodose: DUAL ◇ 𓂀 ◇ Horus — Assistentes Horus‑Visão + Horus‑Execução.", "short": "1+Horus"}}]};

  function makeCard(a){
    const k = a.name;
    const sym = a.symbol;
    const a1 = a.assistants[0].name;
    const a2 = a.assistants[1].name;
    const long = a.activation_prompts.long;
    const short = a.activation_prompts.short;
    const el = document.createElement("div");
    el.className="card";
    el.innerHTML = `
      <div class="row" style="justify-content:space-between;align-items:center">
        <div><span class="badge">Dual ◇ 𓂀 ◇ Horus</span></div>
        <div class="muted">${sym}</div>
      </div>
      <h3>${sym}  ${k} — sessão</h3>
      <div class="list">
        <div>Assistentes: <span class="kbd">${a1}</span> + <span class="kbd">${a2}</span></div>
        <div>Comando: <span class="kbd">${long}</span></div>
        <div>Atalho: <span class="kbd">${short}</span></div>
        <div class="row">
          <button class="btn primary" data-ativar="${k}">Ativar</button>
          <button class="btn" data-definir="${k}">Definir como atual</button>
          ${k==="Horus" ? '<button class="btn" data-open-landing-tab="visao">𓂀 Abrir Visão</button>' : ""}
          ${k==="Horus" ? '<button class="btn" data-open-landing-tab="execucao">⚙ Abrir Execução</button>' : ""}
        </div>
      </div>
    `;
    return el;
  }
  function buildArquetipos(){
    const grid = $("#gridArq"); grid.innerHTML="";
    ARCH.archetypes.forEach(a=>grid.appendChild(makeCard(a)));
  }
  function buildAtivacoes(){
    const grid = $("#gridAtv"); grid.innerHTML="";
    ARCH.archetypes.forEach(a=>{
      const item = document.createElement("div");
      item.className="card";
      item.innerHTML = `
        <h3>${a.symbol}  ${a.name}</h3>
        <div class="row">
          <button class="btn primary" data-ativacao="${a.name}">Ativar</button>
          <button class="btn" data-atalho="${a.activation_prompts.short}">Copiar atalho</button>
        </div>
      `;
      grid.appendChild(item);
    });
  }

  function hint(){
    $("#sessionHint").textContent = state.logged ? 
      "Sessão ativa • Arquétipo: "+(state.selectedArchetype||"—")+" • Cor: "+(state.color||"—")+" • El.: "+(state.element||"—")+" • Mov.: "+(state.movement||"—") :
      "Nenhuma sessão ativa.";
    $("#inpNome").value = state.userName||"";
    $("#inpAssist").value = state.assistant||"";
    $("#inpColor").value = state.color||"";
    $("#selEl").value = state.element||"Fogo";
    $("#selMov").value = state.movement||"Mais";
  }

  function wire(){
    // Nav
    $$(".nav .btn").forEach(b=> on(b,"click", ()=> setPage(b.dataset.page)));
    // Landing basic
    on($("#btnFill"),"click", ()=> $("#cmd").value = "ativar A.infodose");
    on($("#btnActivate"),"click", ()=>{ const v = ($("#cmd").value||"").trim().toLowerCase();
      if(v.startsWith("ativar a.infodose") || v.startsWith("1+")){ state.logged=true; save(); setPage("arquetipos"); }
      else alert("Use: ativar A.infodose");
    });
    on($("#btnContinue"),"click", ()=>{ if(state.logged) setPage("ativacoes"); else alert("Sem sessão salva."); });
    on($("#btnLogout"),"click", ()=>{ state.logged=false; save(); alert("Sessão encerrada."); });
    on($("#btnSave"),"click", ()=>{ state.userName=$("#inpNome").value.trim(); state.assistant=$("#inpAssist").value.trim(); save(); hint(); alert("Salvo."); });
    on($("#btnExportJson"),"click", ()=>{ const blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
      const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="infodose-session.json"; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),800);
    });
    on($("#btnExportHtml"),"click", ()=>{ const html = "<!-- export -->\n"+document.documentElement.outerHTML;
      const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([html],{type:"text/html"})); a.download="a-infodose-unificado-export.html"; a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),800);
    });
    on($("#btnResync"),"click", ()=>{ state.color=$("#inpColor").value; state.element=$("#selEl").value; state.movement=$("#selMov").value; save(); alert("Resintonizado."); });
    on($("#btnUltima"),"click", ()=>{ if(state.lastActivation) alert("Última: "+state.lastActivation); else alert("Sem última ativação."); });

    // Cards
    on(document,"click", (ev)=>{
      const t = ev.target;
      if(t.matches("button[data-ativar]")){ const k=t.dataset.ativar; state.lastActivation=k; state.selectedArchetype=k; save(); alert("Ativado: "+k); }
      if(t.matches("button[data-definir]")){ state.selectedArchetype=t.dataset.definir; save(); alert("Definido: "+state.selectedArchetype); }
      if(t.matches("button[data-ativacao]")){ const k=t.dataset.ativacao; state.lastActivation=k; save(); alert("Ativação: "+k); }
      if(t.matches("button[data-atalho]")){ navigator.clipboard.writeText(t.dataset.atalho); alert("Atalho copiado."); }
      if(t.matches("button[data-open-landing-tab]")){
        const tab = t.dataset.openLandingTab;
        // Abre landing
        openLanding();
        // Seleciona a aba
        const seg = document.getElementById("seg");
        if(seg){
          seg.querySelectorAll(".seg-btn").forEach(b=> b.setAttribute("aria-pressed","false"));
          const btn = seg.querySelector(`.seg-btn[data-tab="${tab}"]`);
          if(btn){ btn.setAttribute("aria-pressed","true"); }
        }
        document.getElementById("tab-visao").setAttribute("aria-hidden", tab!=="visao");
        document.getElementById("tab-execucao").setAttribute("aria-hidden", tab!=="execucao");
      }
    });

    // === HORUS Landing (overlay + sheet) ===
    const overlay = $("#landingOverlay");
    const landing = $("#landing");
    const sheet = $("#landingSheet");
    const seg = $("#seg");
    const range = $("#opacityRange");
    const out = $("#opacityOut");

    function openLanding(){
      overlay.style.display = "block";
      landing.style.display = "flex";
      requestAnimationFrame(()=> landing.classList.add("open"));
      requestAnimationFrame(()=> sheet.parentElement.classList.add("open"));
    }
    function closeLanding(){
      landing.classList.remove("open");
      sheet.parentElement.classList.remove("open");
      setTimeout(()=>{
        overlay.style.display = "none";
        landing.style.display = "none";
      }, 360);
    }
    on($("#fabLanding"),"click", openLanding);
    on($("#btnOpenLanding"),"click", openLanding);
    on(overlay,"click", closeLanding);

    // Segmented control
    on(seg,"click", e=>{
      const btn = e.target.closest(".seg-btn"); if(!btn) return;
      $$(".seg-btn", seg).forEach(b=> b.setAttribute("aria-pressed","false"));
      btn.setAttribute("aria-pressed","true");
      const tab = btn.dataset.tab;
      $("#tab-visao").setAttribute("aria-hidden", tab!=="visao");
      $("#tab-execucao").setAttribute("aria-hidden", tab!=="execucao");
    });

    // Transparência 0.30–1.00
    function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
    function setOpacity(val){
      const v = clamp(parseFloat(val||0.85), 0.30, 1.00);
      document.documentElement.style.setProperty("--landing-opacity", v.toFixed(2));
      out.textContent = v.toFixed(2);
    }
    on(range,"input", e=> setOpacity(e.target.value));
    setOpacity(range.value);

    // Drag-to-close (gesto simples na alça)
    let startY=0, dragging=false;
    const handle = $("#dragHandle");
    const START = (ev)=>{ dragging=true; startY = (ev.touches? ev.touches[0].clientY : ev.clientY); };
    const MOVE  = (ev)=>{
      if(!dragging) return;
      const y = (ev.touches? ev.touches[0].clientY : ev.clientY);
      const dy = y - startY;
      if(dy>0){
        sheet.style.transform = `translateY(${Math.min(dy, window.innerHeight)}px)`;
      }
    };
    const END   = ()=>{
      if(!dragging) return;
      dragging=false;
      const current = parseFloat((sheet.style.transform||"").match(/translateY\(([-\d.]+)/)?.[1]||"0");
      if(current>80){ // solta para fechar
        sheet.style.transform = "translateY(100%)";
        setTimeout(closeLanding, 120);
      }else{
        sheet.style.transform = "";
      }
    };
    ["mousedown","touchstart"].forEach(ev=> on(handle,ev,START));
    ["mousemove","touchmove"].forEach(ev=> on(window,ev,MOVE));
    ["mouseup","touchend","touchcancel","mouseleave"].forEach(ev=> on(window,ev,END));

    // Ações Visão/Execução
    on($("#btnVisaoAtivar"), "click", ()=>{ state.lastActivation="Horus‑Visão"; state.selectedArchetype="Horus"; save(); alert("Ativado: Horus — Visão"); });
    on($("#btnVisaoDefinir"), "click", ()=>{ state.selectedArchetype="Horus"; state.assistant="Horus‑Visão"; save(); hint(); alert("Definido: Horus — Visão"); });
    on($("#btnExecAtivar"), "click", ()=>{ state.lastActivation="Horus‑Execução"; state.selectedArchetype="Horus"; save(); alert("Ativado: Horus — Execução"); });
    on($("#btnExecDefinir"), "click", ()=>{ state.selectedArchetype="Horus"; state.assistant="Horus‑Execução"; save(); hint(); alert("Definido: Horus — Execução"); });
  }

  load();
  // Carrega presets externos; fallback embutido se falhar
  fetch("presets-12-arquetipos.json").then(r=>r.json()).then(j=>{ ARCH=j; buildArquetipos(); buildAtivacoes(); }).catch(()=>{ buildArquetipos(); buildAtivacoes(); });
  wire(); hint();
})();
