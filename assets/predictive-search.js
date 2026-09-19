/**
 * Asmaan Live Predictive Search Engine
 */
(function() {
  'use strict';

  class PredictiveSearch {
    constructor() {
      this.modal = document.getElementById('predictive-search-modal');
      if (!this.modal) return;

      this.input = document.getElementById('predictive-search-input');
      this.clearBtn = document.getElementById('predictive-search-clear');
      this.defaultContainer = document.getElementById('predictive-search-default');
      this.loadingIndicator = document.getElementById('predictive-search-loading');
      this.dynamicContainer = document.getElementById('predictive-search-dynamic');
      this.footer = document.getElementById('predictive-search-footer');
      this.countEl = document.getElementById('predictive-search-count');
      this.viewAllLink = document.getElementById('predictive-search-view-all');
      this.labels = {};
      try {
        const labelsEl = document.getElementById('predictive-search-labels');
        if (labelsEl) this.labels = JSON.parse(labelsEl.textContent);
      } catch (err) {
        this.labels = {};
      }

      this.debounceTimer = null;
      this.currentQuery = '';
      this.abortController = null;

      this.initEvents();
    }

    initEvents() {
      document.querySelectorAll('[data-search-modal-open]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      });

      this.modal.querySelectorAll('[data-search-close]').forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal.classList.contains('is-active')) {
          this.close();
        }
      });

      if (this.input) {
        this.input.addEventListener('input', () => {
          const query = this.input.value.trim();
          if (this.clearBtn) {
            this.clearBtn.style.display = query.length === 0 ? 'none' : 'flex';
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

      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', () => {
          this.input.value = '';
          this.clearBtn.style.display = 'none';
          this.input.focus();
          this.resetToDefault();
        });
      }

      this.modal.querySelectorAll('.predictive-search-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const term = tag.getAttribute('data-search-term');
          if (term && this.input) {
            this.input.value = term;
            if (this.clearBtn) this.clearBtn.style.display = 'flex';
            this.handleInput(term);
          }
        });
      });
    }

    open() {
      this.modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        if (this.input) {
          this.input.focus();
        }
      }, 50);
    }

    close() {
      this.modal.classList.remove('is-active');
      document.body.style.overflow = '';
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
      if (this.loadingIndicator) this.loadingIndicator.style.display = 'none';
      if (this.dynamicContainer) {
        this.dynamicContainer.style.display = 'none';
        this.dynamicContainer.innerHTML = '';
      }
      if (this.defaultContainer) this.defaultContainer.style.display = 'block';
      if (this.footer) this.footer.style.display = 'none';
    }

    async fetchResults(query) {
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      if (this.defaultContainer) this.defaultContainer.style.display = 'none';
      if (this.loadingIndicator) this.loadingIndicator.style.display = 'block';
      if (this.dynamicContainer) this.dynamicContainer.style.display = 'none';
      if (this.footer) this.footer.style.display = 'none';

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
        if (this.loadingIndicator) this.loadingIndicator.style.display = 'none';
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
      this.dynamicContainer.style.display = 'block';

      if (totalCount === 0) {
        this.dynamicContainer.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 0;">
            <p style="color: rgba(255,255,255,0.8); font-size: 0.95rem; margin: 0 0 0.5rem 0;">${this.escapeHtml(this.t('noResults', { query: query }))}</p>
            <p style="color: rgba(255,255,255,0.4); font-size: 0.75rem; margin: 0;">${this.escapeHtml(this.t('noResultsHint'))}</p>
          </div>
        `;
        if (this.footer) this.footer.style.display = 'none';
        return;
      }

      // Products
      if (products.length > 0) {
        const prodSection = document.createElement('div');
        prodSection.innerHTML = `
          <h4 style="font-family: var(--font-mono, monospace); font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin: 0 0 0.75rem 0;">${this.escapeHtml(this.t('products', { count: products.length }))}</h4>
          <div class="predictive-search-product-grid">
            ${products.map(product => {
              const formattedPrice = this.formatMoney(product.price);
              const isAvailable = product.available !== false;
              const imgUrl = product.featured_image?.url || product.image || '';
              return `
                <a href="${product.url}" class="predictive-search-product-card">
                  <div class="predictive-search-product-img">
                    ${imgUrl ? `<img src="${imgUrl}" alt="${this.escapeHtml(product.title)}" loading="lazy">` : '<span style="font-size: 0.7rem; color: rgba(255,255,255,0.2); font-family: monospace;">N/A</span>'}
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <h5 style="font-size: 0.85rem; font-weight: 600; color: #fff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.escapeHtml(product.title)}</h5>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                      <span style="font-size: 0.75rem; font-family: var(--font-mono, monospace); color: rgba(255,255,255,0.7);">${formattedPrice}</span>
                      ${!isAvailable ? `<span style="font-size: 0.65rem; font-family: monospace; text-transform: uppercase; padding: 0.1rem 0.35rem; border-radius: 0.25rem; background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3);">${this.escapeHtml(this.t('soldOut'))}</span>` : ''}
                    </div>
                  </div>
                </a>
              `;
            }).join('')}
          </div>
        `;
        this.dynamicContainer.appendChild(prodSection);
      }

      // Collections
      if (collections.length > 0) {
        const colSection = document.createElement('div');
        colSection.style.marginTop = '1.25rem';
        colSection.innerHTML = `
          <h4 style="font-family: var(--font-mono, monospace); font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin: 0 0 0.75rem 0;">${this.escapeHtml(this.t('collections', { count: collections.length }))}</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${collections.map(col => `
              <a href="${col.url}" style="padding: 0.4rem 0.8rem; border-radius: 0.5rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); font-size: 0.75rem; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
                <span>${this.escapeHtml(col.title)}</span>
                <span style="color: rgba(255,255,255,0.4);">&rarr;</span>
              </a>
            `).join('')}
          </div>
        `;
        this.dynamicContainer.appendChild(colSection);
      }

      // Articles & Pages
      if (articles.length > 0 || pages.length > 0) {
        const infoSection = document.createElement('div');
        infoSection.style.marginTop = '1.25rem';
        const items = [...articles.map(a => ({ ...a, type: this.t('article') })), ...pages.map(p => ({ ...p, type: this.t('page') }))];
        infoSection.innerHTML = `
          <h4 style="font-family: var(--font-mono, monospace); font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin: 0 0 0.75rem 0;">${this.escapeHtml(this.t('info', { count: items.length }))}</h4>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            ${items.map(item => `
              <a href="${item.url}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.85rem; border-radius: 0.65rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-decoration: none; color: #fff;">
                <span style="font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.escapeHtml(item.title)}</span>
                <span style="font-size: 0.65rem; font-family: var(--font-mono, monospace); text-transform: uppercase; color: rgba(255,255,255,0.4);">${this.escapeHtml(item.type)}</span>
              </a>
            `).join('')}
          </div>
        `;
        this.dynamicContainer.appendChild(infoSection);
      }

      // Footer
      if (this.footer && this.viewAllLink) {
        this.footer.style.display = 'flex';
        if (this.countEl) {
          this.countEl.textContent = this.t('showing', { count: totalCount });
        }
        this.viewAllLink.href = `${window.ASMAAN_CONFIG?.routes?.search_url || '/search'}?q=${encodeURIComponent(query)}`;
      }
    }

    renderError() {
      if (!this.dynamicContainer) return;
      this.dynamicContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem 0; color: rgba(255,255,255,0.5); font-size: 0.8rem;">
          ${this.escapeHtml(this.t('error'))}
        </div>
      `;
      this.dynamicContainer.style.display = 'block';
    }

    t(key, vars) {
      let text = this.labels[key] || '';
      Object.keys(vars || {}).forEach((name) => {
        text = text.split('{' + name + '}').join(vars[name]);
      });
      return text;
    }

    // The suggest API returns prices as decimal strings in the shop currency (e.g. "2400.00").
    formatMoney(price) {
      const cents = typeof price === 'string' && price.includes('.') ? Math.round(parseFloat(price) * 100) : Math.round(Number(price));
      if (isNaN(cents)) return '';
      const format = this.labels.moneyFormat || '{{amount}}';
      const group = (precision, thousands, decimal) => {
        const parts = (cents / 100).toFixed(precision).split('.');
        parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
        return parts.join(decimal);
      };
      const match = format.match(/\{\{\s*(\w+)\s*\}\}/);
      let value;
      switch (match ? match[1] : 'amount') {
        case 'amount_no_decimals': value = group(0, ',', '.'); break;
        case 'amount_with_comma_separator': value = group(2, '.', ','); break;
        case 'amount_no_decimals_with_comma_separator': value = group(0, '.', ','); break;
        case 'amount_with_apostrophe_separator': value = group(2, "'", '.'); break;
        default: value = group(2, ',', '.');
      }
      if (cents % 100 === 0) value = value.replace(/[.,]00$/, '');
      const tmp = document.createElement('div');
      tmp.innerHTML = format.replace(/\{\{\s*\w+\s*\}\}/, value);
      return tmp.textContent;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.asmaanPredictiveSearch = new PredictiveSearch();
    });
  } else {
    window.asmaanPredictiveSearch = new PredictiveSearch();
  }
})();
