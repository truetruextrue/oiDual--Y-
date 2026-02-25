// src/components/orb-2d.js
const CSS_PATH = '/src/core.css'; // ou null se já usar CSS global

const tmpl = document.createElement('template');
tmpl.innerHTML = /*html*/`
  <style></style>
  <div id="orb" part="orb" aria-hidden="false" tabindex="0"></div>
`;

class Orb2D extends HTMLElement {
  constructor(){
    super();
    this._shadow = this.attachShadow({mode:'open'});
    this._shadow.appendChild(tmpl.content.cloneNode(true));
    this.$orb = this._shadow.getElementById('orb');
  }

  connectedCallback(){
    // opcional: injeta apenas as regras relevantes para orb no shadow se quiser isolamento
    this._applyStyles().catch(()=>{/*fallback: usa CSS global automaticamente*/});

    // espelhando variáveis para :host para permitir theming com CSS variables globais
    // ex: <orb-2d style="--orb-size:80px"></orb-2d>
    const defaultSize = getComputedStyle(document.documentElement).getPropertyValue('--orb-size') || '64px';
    this.$orb.style.width = this.style.getPropertyValue('--orb-size') || defaultSize;
    this.$orb.style.height = this.style.getPropertyValue('--orb-size') || defaultSize;

    // Interactions simples
    this.$orb.addEventListener('click', ()=> this._onClick());
    this.$orb.addEventListener('keydown', (e)=> {
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._onClick(); }
    });
  }

  async _applyStyles(){
    // tentativa com Constructable Stylesheets (mais rápido)
    if('adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype && CSS_PATH) {
      const res = await fetch(CSS_PATH);
      const cssText = await res.text();
      const sheet = new CSSStyleSheet();
      await sheet.replace(cssText);
      this._shadow.adoptedStyleSheets = [...this._shadow.adoptedStyleSheets, sheet];
    } else if(CSS_PATH) {
      // fallback: buscar e injetar <style>
      const res = await fetch(CSS_PATH);
      const cssText = await res.text();
      const s = document.createElement('style');
      s.textContent = cssText;
      this._shadow.prepend(s);
    }
  }

  _onClick(){
    // exemplo simples: toggle class para animar (usa tuas regras #orb2d)
    this.$orb.classList.toggle('active');
    this.dispatchEvent(new CustomEvent('orb:toggle', {detail:{active: this.$orb.classList.contains('active')}}));
  }

  disconnectedCallback(){
    this.$orb.removeEventListener('click', this._onClick);
  }
}

customElements.define('orb-2d', Orb2D);
