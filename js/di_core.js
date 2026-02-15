/* =========================================================
   DI_CORE.JS — ATLAS ∴ ESTRUTURA PRIMORDIAL
   Define o namespace global 'di_' e gerenciamento de estado.
   ========================================================= */

(function(global) {
    "use strict";

    // 🜂 Nova: Namespace Root
    const di_ = global.di_ || {};

    // 🜃 Vitalis: Estado Centralizado (Fonte da Verdade)
    di_.state = {
        apiKey: localStorage.getItem('di_apiKey') || '',
        modelName: localStorage.getItem('di_modelName') || 'nvidia/nemotron-3-nano-30b-a3b:free',
        userName: localStorage.getItem('di_userName') || 'Viajante',
        infodoseName: localStorage.getItem('di_infodoseName') || 'KOBLLUX',
        theme: localStorage.getItem('uno:theme') || 'medium',
        solarMode: localStorage.getItem('di_solarMode') || 'night'
    };

    // 🜄 Pulse: Barramento de Eventos Simples
    di_.bus = {
        listeners: {},
        on: function(event, callback) {
            if (!this.listeners[event]) this.listeners[event] = [];
            this.listeners[event].push(callback);
        },
        emit: function(event, data) {
            if (this.listeners[event]) {
                this.listeners[event].forEach(cb => cb(data));
            }
        }
    };

    // 🜅 Artemis: Registro de Módulos
    di_.modules = {};
    di_.register = function(name, moduleInitFn) {
        di_.modules[name] = {
            init: moduleInitFn,
            instance: null
        };
        // 🜆 Serena: Debug
        console.log(`[ATLAS] Módulo registrado: ${name}`);
    };

    // 🜈 Genus: Helpers Globais de Armazenamento
    di_.storage = {
        set: (key, val) => {
            if (key === 'di_apiKey') di_.state.apiKey = val;
            if (key === 'di_userName') di_.state.userName = val;
            localStorage.setItem(key, val);
            // Sincroniza estado reativo se necessário
            di_.bus.emit('state-change', { key, val });
        },
        get: (key, def) => localStorage.getItem(key) || def
    };

    // 🜊 Solus: Inicializador Mestre
    di_.init = function() {
        console.log("[ATLAS] Inicializando Sistema KOBLLUX...");
        Object.keys(di_.modules).forEach(name => {
            try {
                if (typeof di_.modules[name].init === 'function') {
                    di_.modules[name].instance = di_.modules[name].init();
                }
            } catch (e) {
                console.error(`[KAOS] Erro ao iniciar ${name}:`, e);
            }
        });
        di_.bus.emit('ready', true);
    };

    // Expor globalmente
    global.di_ = di_;

    // Auto-start no DOMReady
    document.addEventListener('DOMContentLoaded', () => {
        di_.init();
    });

})(window);

