// Módulo de productos
const ProductsModule = {
  async loadProducts() {
    try {
      const res = await fetch('assets/products.json');
      if (res.ok) return await res.json();
    } catch (e) {
      const embedded = document.querySelector('script#products');
      if (embedded?.textContent) {
        try { return JSON.parse(embedded.textContent); } catch (e) { }
      }
    }
    return { products: [] };
  },

  formatMoney(n) {
    return '$' + Number(n).toLocaleString('es-CO');
  },

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = '¡Código copiado!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    });
  }
};

// Renderizado de páginas
async function renderIndex() {
  const data = await ProductsModule.loadProducts();
  const grid = document.getElementById('grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  data.products.forEach(product => {
    const card = document.createElement('a');
    card.className = 'card';
    card.href = 'producto.html?id=' + product.id;
    card.innerHTML = `
      <div class="card__img">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
      </div>
      <div class="card__body">
        <h2>${product.name}</h2>
        <div class="prices">
          <span class="price">1 unid: ${ProductsModule.formatMoney(product.price)}</span>
          <span class="price price--deal">2x1 c/u: ${ProductsModule.formatMoney(product.price2)}</span>
        </div>
        <div class="code-container">
          <span class="code">Cod: ${product.id}</span>
          <button class="copy-btn" onclick="event.preventDefault(); ProductsModule.copyToClipboard('${product.id}')">
            📋 Copiar
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

async function renderProductPage(id) {
  const data = await ProductsModule.loadProducts();
  const product = data.products.find(x => x.id === id);
  if (!product) {
    window.location.href = 'index.html';
    return;
  }

  document.title = `${product.name} | Catálogo Halloween`;
  document.getElementById('pname').textContent = product.name;
  document.getElementById('p1').textContent = ProductsModule.formatMoney(product.price);
  document.getElementById('p2').textContent = ProductsModule.formatMoney(product.price2);
  document.getElementById('pid').textContent = product.id;

  // Configurar el botón de WhatsApp
  const whatsappBtn = document.getElementById('whatsapp-buy');
  const message = encodeURIComponent(`¡Hola! Me interesa comprar: ${product.name} (Código: ${product.id})`);
  whatsappBtn.href = `https://wa.me/573246052525?text=${message}`;

  // Renderizar galería
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  product.images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = product.name;
    img.loading = 'lazy';
    img.addEventListener('click', () => openLightbox(src));
    gallery.appendChild(img);
  });
}

function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  img.src = src;
  lightbox.classList.add('is-open');
}

document.addEventListener('click', e => {
  if (e.target.matches('.lightbox__close') || e.target.id === 'lightbox') {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('is-open');
  }
});

// Exportar funciones necesarias
window.renderIndex = renderIndex;
window.renderProductPage = renderProductPage;