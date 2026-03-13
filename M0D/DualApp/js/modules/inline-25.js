
(function(){
function wireButtons(){
const input = document.getElementById('userInput');
// SEND
const send = document.getElementById('sendBtn');
if (send && !send.dataset.koduxWired) {
const newSend = send.cloneNode(true);
send.parentNode.replaceChild(newSend, send);
newSend.dataset.koduxWired = "1";
newSend.addEventListener('click', () => {
const val = (input?.value || '').trim();
if (!val) { input?.focus(); return; }
if (typeof window.onSend === 'function') {
try { window.onSend(); return; } catch(e){}
}
// Fallback: dispatch click to any original sendBtn (if re-added later)
newSend.dispatchEvent(new Event('kodux-send', {bubbles:true}));
});
}
// VOICE
const voice = document.getElementById('voiceBtn');
if (voice && !voice.dataset.koduxWired) {
const newVoice = voice.cloneNode(true);
voice.parentNode.replaceChild(newVoice, voice);
newVoice.dataset.koduxWired = "1";
newVoice.addEventListener('click', () => {
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
try {
const rec = new SpeechRecognition();
rec.lang = 'pt-BR';
rec.interimResults = false;
rec.maxAlternatives = 1;
newVoice.classList.add('listening');
rec.onresult = (evt) => {
const transcript = evt.results[0][0].transcript || '';
if (input) input.value = transcript.trim();
const val = (input?.value || '').trim();
if (val && typeof window.onSend === 'function') {
try { window.onSend(); } catch(e){}
}
};
rec.onerror = () => { /* graceful fallback below onend */ };
rec.onend = () => {
newVoice.classList.remove('listening');
// Fallback: if user dictated or typed something, send it
const val = (input?.value || '').trim();
if (val && typeof window.onSend === 'function') {
try { window.onSend(); } catch(e){}
} else {
input?.focus();
}
};
rec.start();
return;
} catch(err) {
// continue to fallback
}
}
// No SR support -> treat as quick-send
const val = (input?.value || '').trim();
if (val && typeof window.onSend === 'function') {
try { window.onSend(); } catch(e){}
} else {
input?.focus();
}
});
}
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', wireButtons);
} else {
wireButtons();
}
})();
