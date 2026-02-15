/* =========================================================
   KOBLLUX VISIO & MEMORIA (V7.9) — RHEA ∴ CHAT SYSTEM
   Integração: di_.state.apiKey & di_.app.kobllux
   ========================================================= */

(function(di_) {
    "use strict";

    di_.register("kobllux", function() {

        // 🜂 Nova: Constantes Mapeadas para di_.storage
        const STORAGE = {
            API_KEY: 'di_apiKey',
            MODEL: 'di_modelName',
            SYSTEM_ROLE: 'di_systemRole',
            USER_ID: 'di_userName'
        };

        const KODUX = {
            ARQUETIPOS: { "Atlas":{Essencia:"Planejador"}, "Nova":{Essencia:"Inspira"}, "Vitalis":{Essencia:"Momentum"} }
        };

        // 🜄 Pulse: Core Logic (Fractal)
        const KoblluxCore = {
            async sha256Hex(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join(''); },
            classifyText(s) { return { tokens: (s.match(/[\p{L}\p{N}_-]+/gu)||[]) }; }, // Simplificado
            async process(input) { 
                if(!input)return null; 
                const seal = await this.sha256Hex(input + new Date().toISOString()); 
                return { raw: input, seal: seal.slice(0,16), trinity: { UNO: 'NÚCLEO' } }; 
            }
        };

        // 🜅 Artemis: App Controller
        const App = {
            state: { messages: [], isProcessing: false },
            
            init() {
                // UI Sync com di_.state
                const elKey = document.getElementById('apiKeyInput');
                if(elKey) elKey.value = di_.state.apiKey;
                
                const elUser = document.getElementById('inputUserId');
                if(elUser) elUser.value = di_.state.userName;

                this.bindEvents();
                this.updateUI();
                console.log("[KOBLLUX] Sistema Ativo.");
            },

            async handleSend() {
                const input = document.getElementById('userInput');
                const txt = input.value.trim();
                if (!txt || this.state.isProcessing) return;

                const fractal = await KoblluxCore.process(txt);
                input.value = '';
                this.addMessage('user', txt);
                this.state.isProcessing = true;

                // 🜆 Serena: Recupera Key do Estado Global
                const key = di_.state.apiKey; 
                const model = di_.state.modelName;

                if (!key && !model.includes(':free')) { 
                    this.addMessage('system', "Erro: API Key não detectada no Cofre (di_)."); 
                    this.state.isProcessing = false; 
                    return; 
                }

                try {
                    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: { 
                            'Authorization': `Bearer ${key}`, 
                            'Content-Type': 'application/json', 
                            'HTTP-Referer': location.origin 
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [ 
                                { role: 'system', content: localStorage.getItem('di_systemRole') || 'Você é Dual.' },
                                ...this.state.messages.slice(-10),
                                { role: 'user', content: `${txt}\n[SELO:${fractal.seal}]` } 
                            ]
                        })
                    });
                    const data = await res.json();
                    const aiContent = data.choices?.[0]?.message?.content || "Sem sinal.";
                    this.addMessage('ai', aiContent);

                } catch (e) { 
                    this.addMessage('system', `Erro conexão: ${e.message}`); 
                } finally { 
                    this.state.isProcessing = false; 
                }
            },

            addMessage(role, text) {
                const c = document.getElementById('chat-container');
                if(!c) return;
                const d = document.createElement('div'); 
                d.className = `msg-block ${role}`;
                d.innerHTML = role === 'ai' && window.marked ? marked.parse(text) : text.replace(/\n/g, '<br>');
                c.appendChild(d); 
                c.scrollTop = c.scrollHeight;
                if(role !== 'system') this.state.messages.push({ role: role==='ai'?'assistant':'user', content: text });
            },

            updateUI() {
                const display = document.getElementById('usernameDisplay');
                if(display) display.textContent = di_.state.userName;
            },

            bindEvents() {
                const btnSend = document.getElementById('btnSend');
                if(btnSend) btnSend.onclick = () => this.handleSend();
                const inputUser = document.getElementById('userInput');
                if(inputUser) inputUser.onkeypress = (e) => { if(e.key === 'Enter') this.handleSend(); };
                
                // Config Save
                const btnSave = document.getElementById('btnSaveConfig');
                if(btnSave) btnSave.onclick = () => {
                    di_.storage.set('di_apiKey', document.getElementById('apiKeyInput').value);
                    di_.storage.set('di_userName', document.getElementById('inputUserId').value);
                    this.updateUI();
                };
            }
        };

        // Auto-start
        App.init();

        return App;
    });

})(window.di_);

