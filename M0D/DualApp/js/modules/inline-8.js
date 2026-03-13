
(function(){
const STORAGE_KEY  = 'infodoseEnabled',
THEME_KEY    = 'infodoseTheme',
KIT_PRIMARY  = 'assets/icons/DualKittyKard-icon-3.png',
KIT_FALLBACK = 'assets/icons/dual_Dual_Infodose.svg',
CONFIG = {
TRAINING_FILE:'data/codex/mtlx-oo-2.txt',
API_URL      :'https://openrouter.ai/api/v1/chat/completions',
MODEL        :'deepseek/deepseek-chat-v3-0324:free',
TEMP         : 0.2,
CHUNK_SIZE   :12000,
AUTH_TOKEN   :'Bearer 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'
};
let training = '', chunks = [], chunkIndex = 0;
let isEnabled = false, isStudying = false;
let userName = '', assistantBase = '';
let conversation = [];
let pages = [], currentPage = 0, autoAdvance = true;
let originalLogo = '';
const $ = s => document.querySelector(s);
const create = (t,c,h) => {
const e = document.createElement(t);
if(c) e.className = c;
if(h) e.innerHTML = h;
return e;
};
particlesJS('particles-js',{
particles:{ number:{value:40}, color:{value:['#0ff','#f0f']},
shape:{type:'circle'}, opacity:{value:0.4}, size:{value:2.4},
move:{enable:true,speed:1.5}
}, retina_detect:true
});
function applyTheme(theme){
document.body.classList.remove('light','medium','vibe');
if(theme!=='dark') document.body.classList.add(theme);
}
function toggleTheme(){
const order=['dark','light','medium','vibe'];
const cur=localStorage.getItem(THEME_KEY)||'dark';
const next=order[(order.indexOf(cur)+1)%order.length];
applyTheme(next);
localStorage.setItem(THEME_KEY,next);
}
function changeLogo(srcs){
const cont=$('#logoContainer'), obj=$('#logoObj');
cont.classList.add('fading');
cont.addEventListener('transitionend',function once(){
cont.removeEventListener('transitionend',once);
if(Array.isArray(srcs)){
obj.data=srcs[0];
obj.onerror=()=>obj.data=srcs[1];
} else obj.data=srcs;
cont.classList.remove('fading');
});
}
async function init(){
applyTheme(localStorage.getItem(THEME_KEY)||'dark');
$('#themeToggle').addEventListener('click',toggleTheme);
originalLogo = $('#logoObj').data;
try {
training = await fetch(CONFIG.TRAINING_FILE).then(r=>r.text());
for(let i=0;i<training.length;i+=CONFIG.CHUNK_SIZE){
chunks.push(training.slice(i,i+CONFIG.CHUNK_SIZE));
}
} catch(e){ console.error('Falha no treino:',e); }
loadConfig();
if(!conversation.length){
conversation.push({
role:'system',
content:(chunks[0]||training)+'\n\nVocê é o assistente Dual.infodose.'
});
chunkIndex=1;
}
bindUI();
}
function loadConfig(){
if(localStorage.getItem(STORAGE_KEY)==='1'){
isEnabled=true;
userName=localStorage.getItem('userName')||'';
assistantBase=localStorage.getItem('assistantBase')||'';
conversation=[{
role:'system',
content:(chunks[0]||training)
+`\n\nUsuário: ${userName}.\nAssistente: ${assistantBase} dual.infodose.`
}];
chunkIndex=1;
updateUI();
}
}
function updateUI(){
$('#toggleBtn').classList.toggle('active',isEnabled);
$('#kittyBtn').classList.toggle('active',isStudying);
$('#assistantName').textContent = isStudying
? 'Estudos dual.infodose'
: (isEnabled ? `${assistantBase} dual.infodose` : '');
}
function showLoading(msg){
const wrap=$('.pages-wrapper');
wrap.innerHTML='';
const p=create('div','page active'), foot=create('p','footer-text loading','');
msg.split('').forEach((ch,i)=>{
const sp=create('span'); sp.textContent=ch;
sp.style.animationDelay=(i*0.02)+'s'; sp.classList.add('loading');
foot.appendChild(sp);
});
p.appendChild(foot); wrap.appendChild(p);
$('#pageIndicator').textContent = '1 / 1';
speechSynthesis.cancel();
speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
}
function splitText(t){
let ps = t.split(/\n\s*\n/).filter(p=>p.trim());
if(ps.length % 3 !== 0){
ps = (t.match(/[^\.!\?]+[\.!\?]+/g)||[]).map(s=>s.trim());
}
const out=[];
for(let i=0;i<ps.length;i+=3){
out.push(ps.slice(i,i+3));
}
return out;
}
function renderResponse(txt){
const wrap=$('.pages-wrapper');
wrap.innerHTML=''; pages=[]; currentPage=0; autoAdvance=true;
txt = txt
.replace(/`([^`]+)`/g,'<code>$1</code>')
.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
.replace(/\*(.+?)\*/g,'<em>$1</em>');
const groups = splitText(txt),
titles = ['🎁 Recompensa Inicial','👁️ Exploração','⚡️ Antecipação'];
groups.forEach((grp, gi)=>{
const pg = create('div','page'+(gi===0?' active':''),'');
grp.forEach((para,j)=>{
const cls = j===0?'intro':j===1?'middle':'ending';
const block = create('div',`response-block ${cls}`,`<p>${para}</p>`);
block.addEventListener('click',()=>{
autoAdvance=false;
const cleanPara = para
.replace(/["“”‘’]/g, '')                        // aspas
.replace(/[\u1F300-\u1F6FF\u1F900-\u1F9FF\u2600-\u26FF\u2700-\u27BF]/g, ''); // emojis
const utter = new SpeechSynthesisUtterance(cleanPara);
speechSynthesis.cancel();
speechSynthesis.speak(utter);
if (!block.dataset.spoken) {
block.dataset.spoken = '1';
block.classList.add('clicked');
} else {
block.classList.add('expanded');
if (!isEnabled) {
isEnabled = true;
localStorage.setItem(STORAGE_KEY, '1');
updateUI();
}
showLoading(' Pulso em Expansão...');
conversation.push({role:'user',content:`${titles[j]}\n\n${para}`});
callAI();
}
});
pg.appendChild(block);
});
wrap.appendChild(pg);
pages.push(pg);
});
$('#pageIndicator').textContent = `1 / ${pages.length}`;
autoSpeakPage(0);
}
function autoSpeakPage(i){
const txts = Array.from(pages[i].querySelectorAll('p'))
.map(p=>p.textContent).join(' ');
speechSynthesis.cancel();
const utter = new SpeechSynthesisUtterance(txts);
utter.onend = () => {
if (autoAdvance && i < pages.length - 1) {
changePage(1);
} else if (i === pages.length - 1) {
// Aqui, só após a ÚLTIMA página:
speechSynthesis.speak(
new SpeechSynthesisUtterance('Do seu jeito. Sempre único. Sempre seu.')
);
}
};
speechSynthesis.speak(utter);
}
function changePage(d){
const np = currentPage + d;
if(np<0||np>=pages.length) return;
pages[currentPage].classList.remove('active');
pages[np].classList.add('active');
currentPage=np;
$('#pageIndicator').textContent = `${np+1} / ${pages.length}`;
if(autoAdvance) autoSpeakPage(np)
}
async function callAI(){
try {
const res = await fetch(CONFIG.API_URL, {
method: 'POST',
headers: {
'Authorization': CONFIG.AUTH_TOKEN,
'Content-Type': 'application/json'
},
body: JSON.stringify({
model: CONFIG.MODEL,
messages: conversation,
temperature: CONFIG.TEMP
})
});
const payload = await res.json();
if (!res.ok) throw new Error(payload.error?.message || res.statusText);
if (!payload.choices?.length) throw new Error('Resposta vazia da API');
const ans = payload.choices[0].message.content.trim();
conversation.push({ role: 'assistant', content: ans });
renderResponse(ans);
} catch (err) {
console.error('callAI erro:', err);
const fallback = 'Desculpe, não consegui obter resposta. Tente novamente.';
conversation.push({ role: 'assistant', content: fallback });
renderResponse(fallback);
}
}
function bindUI(){
$('#sendBtn').addEventListener('click',onSend);
$('#userInput').addEventListener('keypress',e=>{ if(e.key==='Enter') onSend(); });
$('#voiceBtn').addEventListener('click',()=>{
const rec = new (window.SpeechRecognition||window.webkitSpeechRecognition)();
rec.lang='pt-BR'; rec.start();
rec.onresult=evt=>{
$('#userInput').value=evt.results[0][0].transcript; onSend();
};
});
document.querySelector('.control-buttons').addEventListener('click',e=>{
if(e.target.closest('.copy-button')){
const txt=pages.map(p=>p.innerText.trim()).join('\n\n');
navigator.clipboard.writeText(txt);
}
if(e.target.closest('.paste-button')){
navigator.clipboard.readText().then(txt=>$('#userInput').value=txt);
}
if(e.target.closest('#toggleBtn')){
if(!isEnabled) $('#loginBox').classList.add('active');
else {
isEnabled=false; localStorage.removeItem(STORAGE_KEY);
conversation=[]; updateUI();
}
}
if(e.target.closest('#kittyBtn')){
isStudying=!isStudying;
if(isStudying){
conversation=[{
role:'system',
content:(chunks[0]||training)+'\n\nVocê é Assistente de Estudos dual.infodose.'
}];
changeLogo([KIT_PRIMARY,KIT_FALLBACK]);
} else {
changeLogo(originalLogo); loadConfig();
}
updateUI();
}
});
document.querySelector('.pagination').addEventListener('click',e=>{
if(e.target.dataset.action==='prev') changePage(-1);
if(e.target.dataset.action==='next') changePage(1);
autoAdvance=false;
});
$('#loginForm').addEventListener('submit',e=>{
e.preventDefault();
const u=$('#userName').value.trim(), a=$('#assistantInput').value.trim();
if(!u||!a) return alert('Preencha os dados');
isEnabled=true; userName=u; assistantBase=a;
localStorage.setItem(STORAGE_KEY,'1');
localStorage.setItem('userName',u);
localStorage.setItem('assistantBase',a);
loadConfig(); $('#loginBox').classList.remove('active');
});
// toggle apenas da área de resposta (blocos/loading)
document.body.addEventListener('click',e=>{
if(e.target.closest('.footer-text')){
document.querySelector('.pages-wrapper').classList.toggle('collapsed');
e.target.closest('.footer-text').classList.toggle('active');
}
});
}
function onSend(){
const raw=$('#userInput').value.trim(); if(!raw) return;
$('#userInput').value=''; autoAdvance=false;
showLoading('Pulso enviado...Recebendo intenção…');
conversation.push({role:'user',content:raw});
callAI();
}
document.addEventListener('DOMContentLoaded',init);
})();
