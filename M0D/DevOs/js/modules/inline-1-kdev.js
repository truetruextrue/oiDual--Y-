<script>
    const KDevPanel = {
        isOpen: false,
        resources: [],
        
        init() {
            // Initialize lucide icons if not already done by main scripts
            if (window.lucide) lucide.createIcons();
            this.scan();
        },

        toggle() {
            const panel = document.getElementById('dev-panel');
            this.isOpen = !this.isOpen;
            if(this.isOpen) {
                this.scan(); // Rescan dom for dynamic injected elements
                panel.classList.remove('-translate-x-full');
            } else {
                panel.classList.add('-translate-x-full');
            }
        },

        updateVar(varName, value) {
            document.documentElement.style.setProperty(varName, value);
            // Update the display text next to the color picker
            const displaySpan = document.getElementById(`val${varName}`);
            if(displaySpan) displaySpan.innerText = value;
        },

        scan() {
            this.resources = [];
            // Catch all stylesheets and external scripts
            const elements = document.querySelectorAll('link[rel="stylesheet"], script[src]');
            
            elements.forEach((el, index) => {
                const type = el.tagName.toLowerCase() === 'link' ? 'css' : 'js';
                const url = type === 'css' ? el.href : el.src;
                
                // Exclude tailwind/lucide from easy accidental deletion, but keep them in list
                const isCore = url.includes('tailwindcss') || url.includes('lucide');
                const isKodux = url.includes('kodux');
                
                // To safely toggle CSS without destroying it, we use disabled property.
                // For JS it's harder, but we'll manipulate the DOM node.
                let active = true;
                if(type === 'css') active = !el.disabled;
                else active = el.getAttribute('data-dev-disabled') !== 'true';

                this.resources.push({ el, type, url, active, isCore, isKodux });
            });
            
            this.render();
        },

        render() {
            const container = document.getElementById('dev-resources-list');
            container.innerHTML = '';
            
            if (this.resources.length === 0) {
                container.innerHTML = '<p class="text-[10px] text-white/30 text-center py-4">Nenhum recurso encontrado.</p>';
                return;
            }

            this.resources.forEach((res, i) => {
                const isCSS = res.type === 'css';
                const bgClass = res.isKodux ? 'bg-blue-900/10 border-blue-500/30' : 'bg-white/[0.02] border-white/5';
                const badgeColor = isCSS ? 'text-pink-400 bg-pink-400/10' : 'text-yellow-400 bg-yellow-400/10';
                
                const html = `
                    <div class="p-3 mb-2 border rounded-xl ${bgClass} transition-all duration-300 ${!res.active ? 'opacity-50 grayscale' : ''}" id="res-card-${i}">
                        <div class="flex justify-between items-center mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase ${badgeColor}">${res.type}</span>
                                ${res.isKodux ? '<span class="text-[8px] font-bold tracking-widest text-blue-400 uppercase"><i data-lucide="shield-check" class="w-3 h-3 inline pb-0.5"></i> Kodux</span>' : ''}
                            </div>
                            
                            <!-- Toggle Switch -->
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" ${res.active ? 'checked' : ''} onchange="KDevPanel.toggleResource(${i}, this.checked)">
                                <div class="w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                            </label>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            <input type="text" value="${res.url}" onchange="KDevPanel.updateUrl(${i}, this.value)" class="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[9px] font-mono text-white/70 outline-none focus:border-blue-500/50 focus:text-white transition-colors">
                            <button onclick="KDevPanel.deleteResource(${i})" class="text-white/20 hover:text-red-400 transition p-1" title="Remover Tag"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });
            if (window.lucide) lucide.createIcons();
        },

        toggleResource(i, isActive) {
            const res = this.resources[i];
            res.active = isActive;
            
            if (res.type === 'css') {
                res.el.disabled = !isActive;
            } else {
                // JS disable hack for DOM (won't stop already running JS, but stops it on export/reload)
                if (!isActive) {
                    res.el.setAttribute('data-dev-disabled', 'true');
                    res.el.type = 'javascript/blocked'; // Break execution if added dynamically
                } else {
                    res.el.removeAttribute('data-dev-disabled');
                    res.el.type = 'text/javascript';
                    
                    // To actually run it NOW, we need to clone and replace
                    const newScript = document.createElement('script');
                    newScript.src = res.url;
                    res.el.parentNode.replaceChild(newScript, res.el);
                    res.el = newScript; // update ref
                }
            }
            
            const card = document.getElementById(`res-card-${i}`);
            if(isActive) {
                card.classList.remove('opacity-50', 'grayscale');
            } else {
                card.classList.add('opacity-50', 'grayscale');
            }
        },

        updateUrl(i, newUrl) {
            const res = this.resources[i];
            res.url = newUrl;
            if (res.type === 'css') {
                res.el.href = newUrl;
            } else {
                // Changing JS URL requires replacing the tag to execute
                const newScript = document.createElement('script');
                newScript.src = newUrl;
                res.el.parentNode.replaceChild(newScript, res.el);
                res.el = newScript;
            }
            this.scan(); // Refresh UI
        },

        addResource() {
            const type = document.getElementById('dev-new-type').value;
            const url = document.getElementById('dev-new-url').value;
            
            if(!url) return;

            if (type === 'css') {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                document.head.appendChild(link);
            } else {
                const script = document.createElement('script');
                script.src = url;
                document.body.appendChild(script);
            }
            
            document.getElementById('dev-new-url').value = '';
            this.scan();
        },

        deleteResource(i) {
            const res = this.resources[i];
            res.el.remove();
            this.scan();
        },

        exportHTML() {
            // 1. Clone the current document
            const cloneDoc = document.documentElement.cloneNode(true);
            
            // 2. Remove Dev Panel UI from the clone
            const panelToRemove = cloneDoc.querySelector('#dev-panel');
            const btnToRemove = cloneDoc.querySelector('#dev-btn');
            // Remove the dev panel script block itself by looking for KDevPanel
            const scriptTags = cloneDoc.querySelectorAll('script');
            scriptTags.forEach(script => {
                if(script.innerHTML.includes('KDevPanel')) {
                    script.remove();
                }
            });

            if(panelToRemove) panelToRemove.remove();
            if(btnToRemove) btnToRemove.remove();
            
            // 3. Clean up blocked JS tags from toggles
            const blockedScripts = cloneDoc.querySelectorAll('script[data-dev-disabled="true"]');
            blockedScripts.forEach(s => s.remove());

            // 4. Inject current inline CSS variables into head so they persist!
            const computedBg = document.documentElement.style.getPropertyValue('--bg');
            if (computedBg) {
               const styleTag = document.createElement('style');
               styleTag.innerHTML = `
                :root {
                    --bg: ${document.documentElement.style.getPropertyValue('--bg')};
                    --bg-dark: ${document.documentElement.style.getPropertyValue('--bg-dark')};
                    --active-color: ${document.documentElement.style.getPropertyValue('--active-color')};
                }
               `;
               cloneDoc.querySelector('head').appendChild(styleTag);
            }

            // 5. Generate File
            const htmlContent = '<!DOCTYPE html>\n' + cloneDoc.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'FusionOS_Export.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    // Initialize on load
    document.addEventListener('DOMContentLoaded', () => {
        KDevPanel.init();
    });