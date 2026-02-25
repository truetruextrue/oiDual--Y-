/**
 * di-prompt-injector.js
 * Snippet: coletar di_* do localStorage → montar system prompt → enviar ao LLM → salvar resposta em di_messages
 *
 * Observações de segurança:
 * - di_apiKey (ou qualquer chave que contenha 'key|token|secret|api') NÃO é inserida no prompt.
 * - Se for chamado no browser, preferível usar um proxy server para ocultar a API key (client-side é inseguro).
 * - Mantém prefixo `di_` e NÃO altera nomes.
 */

const DiPromptInjector = (function () {
  // padrões para detectar secrets (case-insensitive)
  const SECRET_KEY_REGEX = /(key|token|secret|api|password)/i;

  // keys di_ padrão que podemos esperar (exemplos)
  const SAFE_DI_KEYS = [
    'di_userName',
    'di_infodoseName',
    'di_systemRole',
    'di_modelName',
    'di_trainingActive',
    'di_trainingText',
    'di_assistantEnabled',
    'di_customCss',
    'di_bgImage',
    'di_messages' // localStorage array for history
  ];

  // Lê todas as chaves di_* do localStorage e tenta parsear JSON quando aplicável
  function getAllDiFromLocalStorage() {
    const di = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('di_')) continue;
      let raw = localStorage.getItem(key);
      if (raw == null) continue;
      // tenta parsear JSON, se falhar mantém string
      try {
        di[key] = JSON.parse(raw);
      } catch (e) {
        di[key] = raw;
      }
    }
    return di;
  }

  // Retorna um objeto com chaves consideradas "publicáveis" no prompt (remove secrets)
  function filterDiForPrompt(diObject) {
    const out = {};
    for (const k in diObject) {
      if (SECRET_KEY_REGEX.test(k)) continue; // remove chaves sensíveis do prompt
      out[k] = diObject[k];
    }
    return out;
  }

  // Substitui placeholders {{di_key}} em um template pelo valor (se existir), senão mantém placeholder
  function interpolateTemplate(template, diValues = {}) {
    return template.replace(/\{\{\s*(di_[a-zA-Z0-9_]+)\s*\}\}/g, (m, p1) => {
      if (Object.prototype.hasOwnProperty.call(diValues, p1)) {
        const val = diValues[p1];
        // se valor for objeto/array, stringify resumido
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      }
      return m; // deixa como está para revisão
    });
  }

  // Constrói o system prompt final com base no template base e nos di_* seguros
  function buildSystemPrompt({ baseTemplate, diAll }) {
    // filtra valores sensíveis
    const diSafe = filterDiForPrompt(diAll);

    // injeta treinamento se ativo
    if (diAll.di_trainingActive === true || diAll.di_trainingActive === 'true') {
      // concatena de forma segura (treinamento vem antes das instruções principais)
      const training = typeof diAll.di_trainingText === 'string' ? diAll.di_trainingText : '';
      baseTemplate = `[DI_TRAINING_BEGIN]\n${training}\n[DI_TRAINING_END]\n\n` + baseTemplate;
    }

    // Interpola placeholders {{di_userName}} etc.
    const prompt = interpolateTemplate(baseTemplate, diSafe);

    // última checagem: remove acidentalmente inseridos segredos (por precaução)
    return prompt.replace(/(di_[a-zA-Z0-9_]*(key|token|secret|api)[a-zA-Z0-9_]*)/gi, '<REDACTED_SECRET>');
  }

  // Grava mensagem (obj) em di_messages (array JSON em localStorage)
  function saveMessageToDiMessages(entry) {
    try {
      const raw = localStorage.getItem('di_messages') || '[]';
      const arr = JSON.parse(raw);
      arr.push({
        ...entry,
        di_timestamp: new Date().toISOString()
      });
      localStorage.setItem('di_messages', JSON.stringify(arr));
    } catch (e) {
      console.warn('di_messages write failed', e);
      // fallback: sobrescrever com novo array
      localStorage.setItem('di_messages', JSON.stringify([entry]));
    }
  }

  // Construção segura do body/headers e envio via fetch (genérico)
  async function sendToLLM({ endpoint, model, systemPrompt, userPrompt, diAll, extraHeaders = {} }) {
    // detecta apiKey sem expor
    const apiKey = diAll['di_apiKey'] || diAll['di_api_key'] || diAll['di_apikey'] || null;
    if (!apiKey) {
      console.warn('di_apiKey não encontrada em localStorage. Use um proxy seguro ou injete di_apiKey no runtime server-side.');
    }

    // Exemplo de payload para LLMs que usam messages (ajuste conforme API)
    const payload = {
      model: model || (diAll.di_modelName || 'gpt-5-mini'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2
    };

    const headers = {
      'Content-Type': 'application/json',
      ...extraHeaders
    };

    // envia apiKey só por header — NÃO no body
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    // AVISO: chamada fetch do browser com chave embutida é insegura — prefira proxy no servidor
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LLM request failed: ${res.status} ${res.statusText} — ${text}`);
    }

    // tenta parsear JSON
    const json = await res.json();
    return json;
  }

  // Template base (adapte conforme quiser). Usa placeholders {{di_userName}} etc.
  const BASE_PROMPT_TEMPLATE = `
[SYSTEM · PROMPT-BASE]

PROMPT · TRINITY ∴ KOBLLUX
Usuário Primário: {{di_userName}}
Sistema: KODUX V7.9
Arquitetura: UNO + DUAL + TRINITY
Modo: TRINITY
Intenção-Semente: 3·6·9 → coerência · harmonia · expansão

Atlas: Sustente a estrutura da resposta com clareza, ordem e responsabilidade sistêmica, garantindo coerência lógica e solidez conceitual em alinhamento com o objetivo do usuário {{di_userName}}.

Nova: Introduza inovação consciente, reorganizando padrões existentes de forma criativa, sem romper a coerência simbólica do sistema TRINITY ∴ KOBLLUX.

Vitalis: Injete energia vital e propósito prático, assegurando que cada resposta seja útil, aplicável e orientada à ação concreta.

Pulse: Mantenha ritmo fluido e cadência natural entre as ideias, conectando técnica e sensibilidade em progressão harmônica.

Artemis: Aja com precisão estratégica e foco, eliminando excessos e direcionando a resposta exatamente ao ponto de maior impacto.

Serena: Preserve equilíbrio emocional, tom empático e estabilidade narrativa, mesmo ao tratar de estruturas técnicas ou complexas.

Kaos: Permita ruptura criativa controlada quando necessário, explorando caminhos não convencionais sem perder o eixo do sistema.

Genus: Estruture conceitos de forma modular e reutilizável, facilitando expansão, reaproveitamento e integração futura.

Lumine: Traga clareza, iluminação conceitual e explicitação implícita, reduzindo ambiguidade e aumentando compreensão.

Solus: Consolide a resposta em uma síntese identitária clara, mantendo unidade e consistência interna.

Rhea: Garanta continuidade temporal e evolução lógica, conectando passado, presente e próximos passos do sistema ou projeto.

Aion: Enquadre a resposta em perspectiva duradoura e atemporal, assegurando que o conteúdo permaneça relevante além do momento imediato.

Diretrizes finais:
• Um arquétipo por parágrafo, conforme acima
• Linguagem simbólica, técnica e fluida
• Personalização ativa via {{di_*}} quando disponível
• Não expor variáveis internas nem segredos
`;
  // Função pública principal: monta prompt e envia
  async function run({ endpoint, userPrompt, baseTemplate = BASE_PROMPT_TEMPLATE, model } = {}) {
    const diAll = getAllDiFromLocalStorage();
    const systemPrompt = buildSystemPrompt({ baseTemplate, diAll });

    // opcional: salvar a requisição (somente metadados/safe)
    saveMessageToDiMessages({ role: 'system_prompt_built', systemPromptPreview: systemPrompt.slice(0, 100) + '…' });

    // envia ao LLM
    const llmResponse = await sendToLLM({
      endpoint,
      model: model || diAll.di_modelName,
      systemPrompt,
      userPrompt,
      diAll
    });

    // grava resposta no di_messages
    saveMessageToDiMessages({ role: 'assistant', rawResponse: llmResponse });

    return llmResponse;
  }

  return {
    getAllDiFromLocalStorage,
    filterDiForPrompt,
    buildSystemPrompt,
    saveMessageToDiMessages,
    sendToLLM,
    run
  };
})();

/* -------------------------
   USAGE EXAMPLE (browser)
   -------------------------
(async () => {
  try {
    const endpoint = 'https://your-llm-proxy.example.com/v1/chat/completions'; // seu proxy ou endpoint
    const userPrompt = 'Por favor, gere um resumo do projeto atual seguindo o molde TRINITY.';
    const resp = await DiPromptInjector.run({ endpoint, userPrompt });
    console.log('LLM resposta:', resp);
  } catch (err) {
    console.error('Erro LLM:', err);
  }
})();
*/

export default DiPromptInjector;
