/**
 * Asmaan Live Predictive Search Engine
 * Native Shopify Search Suggest API Integration
 */
(function() {
  'use strict';

  class PredictiveSearch {
    constructor() {
      this.modal = document.getElementById('predictive-search-modal');
      if (!this.modal) return;

      this.backdrop = this.modal.querySelector('.predictive-search-backdrop');
      this.panel = this.modal.querySelector('.predictive-search-panel');
      this.input = document.getElementById('predictive-search-input');
      this.clearBtn = document.getElementById('predictive-search-clear');
      this.defaultContainer = document.getElementById('predictive-search-default');
      this.loadingIndicator = document.getElementById('predictive-search-loading');
      this.dynamicContainer = document.getElementById('predictive-search-dynamic');
      this.footer = document.getElementById('predictive-search-footer');
      this.countEl = document.getElementById('predictive-search-count');
      this.viewAllLink = document.getElementById('predictive-search-view-all');

      this.debounceTimer = null;
      this.currentQuery = '';
      this.abortController = null;

      this.initEvents();
    }

    initEvents() {
      // Open triggers
      document.querySelectorAll('[data-search-modal-open]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      });

      // Close triggers
      this.modal.querySelectorAll('[data-search-close]').forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
          this.close();
        }
      });

      // Input listening with debouncing
      if (this.input) {
        this.input.addEventListener('input', () => {
          const query = this.input.value.trim();
          if (this.clearBtn) {
            this.clearBtn.classList.toggle('hidden', query.length === 0);
          }
          this.handleInput(query);
        });

        this.input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const query = this.input.value.trim();
            if (query.length > 0) {
              window.location.href = `${window.ASMAAN_CONFIG?.routes?.search_url || '/search'}?q=${encodeURIComponent(query)}`;
            }
          }
        });
      }

      // Clear button
      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', () => {
          this.input.value = '';
          this.clearBtn.classList.add('hidden');
          this.input.focus();
          this.resetToDefault();
        });
      }

      // Quick tag clicks
      this.modal.querySelectorAll('.predictive-search-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const term = tag.getAttribute('data-search-term');
          if (term && this.input) {
            this.input.value = term;
            if (this.clearBtn) this.clearBtn.classList.remove('hidden');
            this.handleInput(term);
          }
        });
      });
    }

    open() {
      this.modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        if (this.backdrop) this.backdrop.classList.remove('opacity-0');
        if (this.panel) {
          this.panel.classList.remove('opacity-0', '-translate-y-4');
          this.panel.classList.add('opacity-100', 'translate-y-0');
        }
        if (this.input) {
          this.input.focus();
        }
      });
    }

    close() {
      if (this.backdrop) this.backdrop.classList.add('opacity-0');
      if (this.panel) {
        this.panel.classList.remove('opacity-100', 'translate-y-0');
        this.panel.classList.add('opacity-0', '-translate-y-4');
      }

      setTimeout(() => {
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    }

    handleInput(query) {
      clearTimeout(this.debounceTimer);

      if (!query || query.length < 2) {
        this.resetToDefault();
        return;
      }

      this.currentQuery = query;
      this.debounceTimer = setTimeout(() => {
        this.fetchResults(query);
      }, 250);
    }

    resetToDefault() {
      if (this.abortController) {
        this.abortController.abort();
      }
      if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
      if (this.dynamicContainer) {
        this.dynamicContainer.classList.add('hidden');
        this.dynamicContainer.innerHTML = '';
      }
      if (this.defaultContainer) this.defaultContainer.classList.remove('hidden');
      if (this.footer) this.footer.classList.add('hidden');
    }

    async fetchResults(query) {
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      if (this.defaultContainer) this.defaultContainer.classList.add('hidden');
      if (this.loadingIndicator) this.loadingIndicator.classList.remove('hidden');
      if (this.dynamicContainer) this.dynamicContainer.classList.add('hidden');
      if (this.footer) this.footer.classList.add('hidden');

      try {
        const searchBase = window.ASMAAN_CONFIG?.routes?.predictive_search_url || '/search/suggest';
        const url = `${searchBase}.json?q=${encodeURIComponent(query)}&resources[type]=product,collection,article,page&resources[limit]=6&resources[options][unavailable_products]=show&resources[options][fields]=title,body,product_type,tag,vendor`;

        const response = await fetch(url, { signal: this.abortController.signal });
        if (!response.ok) throw new Error('Search network failure');

        const data = await response.json();
        this.renderResults(data, query);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Predictive search error:', err);
        this.renderError();
      } finally {
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
      }
    }

    renderResults(data, query) {
      const results = data.resources?.results || {};
      const products = results.products || [];
      const collections = results.collections || [];
      const articles = results.articles || [];
      const pages = results.pages || [];

      const totalCount = products.length + collections.length + articles.length + pages.length;

      if (!this.dynamicContainer) return;
      this.dynamicContainer.innerHTML = '';
      this.dynamicContainer.classList.remove('hidden');

      if (totalCount === 0) {
        this.dynamicContainer.innerHTML = `
          <div class="text-center py-12">
            <p class="text-white/70 text-base mb-2">No results found for "${this.escapeHtml(query)}"</p>
            <p class="text-white/40 text-xs">Try checking your spelling or using more general terms.</p>
          </div>
        `;
        if (this.footer) this.footer.classList.add('hidden');
        return;
      }

      // Products Section
      if (products.length > 0) {
        const prodSection = document.createElement('div');
        prodSection.innerHTML = `
          <h4 class="text-xs font-mono tracking-widest uppercase text-white/40 mb-3">Products (${products.length})</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${products.map(product => {
              const formattedPrice = this.formatMoney(product.price);
              const isAvailable = product.available !== false;
              const imgUrl = product.featured_image?.url || product.image || '';
              return `
                <a href="${product.url}" class="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 transition-all group">
                  <div class="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                    ${imgUrl ? `<img src="${imgUrl}" alt="${this.escapeHtml(product.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">` : '<span class="text-xs text-white/20 font-mono">N/A</span>'}
                  </div>
                  <div class="min-w-0 flex-1">
                    <h5 class="text-sm font-medium text-white truncate group-hover:text-white/90">${this.escapeHtml(product.title)}</h5>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs font-mono text-white/70">${formattedPrice}</span>
                      ${!isAvailable ? '<span class="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">Sold out</span>' : ''}
                    </div>
                  </div>
                </a>
              `;
            }).join('')}
          </div>
        `;
        this.dynamicContainer.appendChild(prodSection);
      }

      // Collections Section
      if (collections.length > 0) {
        const colSection = document.createElement('div');
        colSection.innerHTML = `
          <h4 class="text-xs font-mono tracking-widest uppercase text-white/40 mb-3">Collections (${collections.length})</h4>
          <div class="flex flex-wrap gap-2">
            ${collections.map(col => `
              <a href="${col.url}" class="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/10 border border-white/10 text-xs text-white flex items-center gap-2 transition-colors">
                <span>${this.escapeHtml(col.title)}</span>
                <span class="text-white/40">&rarr;</span>
              </a>
            `).join('')}
          </div>
        `;
        this.dynamicContainer.appendChild(colSection);
      }

      // Articles & Pages Section
      if (articles.length > 0 || pages.length > 0) {
        const infoSection = document.createElement('div');
        const items = [...articles.map(a => ({ ...a, type: 'Article' })), ...pages.map(p => ({ ...p, type: 'Page' }))];
        infoSection.innerHTML = `
          <h4 class="text-xs font-mono tracking-widest uppercase text-white/40 mb-3">Articles & Information (${items.length})</h4>
          <div class="space-y-2">
            ${items.map(item => `
              <a href="${item.url}" class="block p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-colors">
                <div class="flex items-center justify-between">
                  <h5 class="text-xs font-medium text-white/90 truncate">${this.escapeHtml(item.title)}</h5>
                  <span class="text-[10px] font-mono text-white/40 uppercase ml-2">${item.type}</span>
                </div>
              </a>
            `).join('')}
          </div>
        `;
        this.dynamicContainer.appendChild(infoSection);
      }

      // Footer
      if (this.footer && this.viewAllLink) {
        this.footer.classList.remove('hidden');
        if (this.countEl) {
          this.countEl.textContent = `Showing ${totalCount} suggestions`;
        }
        this.viewAllLink.href = `${window.ASMAAN_CONFIG?.routes?.search_url || '/search'}?q=${encodeURIComponent(query)}`;
      }
    }

    renderError() {
      if (!this.dynamicContainer) return;
      this.dynamicContainer.innerHTML = `
        <div class="text-center py-8 text-white/50 text-xs">
          An error occurred while fetching search suggestions. Press Enter to view full results.
        </div>
      `;
      this.dynamicContainer.classList.remove('hidden');
    }

    formatMoney(cents) {
      if (typeof cents === 'string' && cents.includes('.')) {
        return cents;
      }
      const num = Number(cents) / 100;
      return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.asmaanPredictiveSearch = new PredictiveSearch();
    });
  } else {
    window.asmaanPredictiveSearch = new PredictiveSearch();
  }
})();
