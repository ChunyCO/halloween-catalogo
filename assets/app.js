// Módulo de productos
const ProductsModule = {
  async loadProducts() {
    try {
      const res = await fetch('assets/products.json');
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Error cargando productos:', e);
    }
    return { products: [] };
  },

  formatMoney(n) {
    return '$' + Number(n).toLocaleString('es-CO');
  },

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      UIModule.showToast('¡Código copiado!');
    });
  },

  createWhatsAppLink(product) {
    const message = `¡Hola! Me interesa la máscara ${product.name} (Código: ${product.id}). ¿Está disponible?`;
    return `https://wa.me/573246052525?text=${encodeURIComponent(message)}`;
  }
};

// Módulo de UI
const UIModule = {
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  },

  createGallery(product) {
    const gallery = document.createElement('div');
    gallery.className = 'product__gallery';
    
    product.images.forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${product.name} - Imagen ${index + 1}`;
      img.loading = 'lazy';
      img.dataset.index = index;
      img.addEventListener('click', () => this.openLightbox(src));
      gallery.appendChild(img);
    });
    
    return gallery;
  },

  setupGalleryNavigation(product) {
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    const gallery = document.getElementById('gallery');
    
    let currentIndex = 0;
    const totalImages = product.images.length;

    const updateNavigation = () => {
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === totalImages - 1;
    };

    const showImage = (index) => {
      const images = gallery.querySelectorAll('img');
      images.forEach((img, i) => {
        img.style.display = i === index ? 'block' : 'none';
      });
      currentIndex = index;
      updateNavigation();
    };

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        showImage(currentIndex - 1);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < totalImages - 1) {
        showImage(currentIndex + 1);
      }
    });

    // Mostrar la primera imagen al cargar
    showImage(0);
  },

  openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    img.src = src;
    img.alt = 'Vista ampliada';
    lightbox.classList.add('is-open');
  },

  closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('is-open');
  }
};

// Inicialización
async function initialize() {
  const { products } = await ProductsModule.loadProducts();
  return { products };
}

// Renderizado de páginas
async function renderIndex() {
  const { products } = await initialize();
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('a');
    card.className = 'card';
    card.href = `producto.html?id=${product.id}`;
    card.innerHTML = `
      <div class="card__img">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
      </div>
      <div class="card__body">
        <h2>${product.name}</h2>
        <div class="prices">
          <span class="price">1 unidad: ${ProductsModule.formatMoney(product.price)}</span>
          <span class="price price--deal">2 o más unidades: ${ProductsModule.formatMoney(product.price2)}</span>
        </div>
        <div class="code-container">
          <span class="code">Código: ${product.id}</span>
          <button class="copy-btn" onclick="event.preventDefault(); ProductsModule.copyToClipboard('${product.id}')">
            📋 Copiar
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

async function renderProductPage(id) {
  const { products } = await initialize();
  const product = products.find(p => p.id === id);
  if (!product) {
    window.location.href = 'index.html';
    return;
  }

  document.title = `${product.name} | Catálogo Halloween`;
  document.getElementById('pname').textContent = product.name;
  document.getElementById('p1').textContent = ProductsModule.formatMoney(product.price);
  document.getElementById('p2').textContent = ProductsModule.formatMoney(product.price2);
  document.getElementById('pid').textContent = product.id;

  const whatsappBtn = document.getElementById('whatsapp-buy');
  whatsappBtn.href = ProductsModule.createWhatsAppLink(product);

  const galleryContainer = document.getElementById('gallery');
  galleryContainer.innerHTML = '';
  galleryContainer.appendChild(UIModule.createGallery(product));
  
  // Configurar la navegación de la galería
  UIModule.setupGalleryNavigation(product);
}

// Event Listeners
document.addEventListener('click', e => {
  if (e.target.matches('.lightbox__close') || e.target.id === 'lightbox') {
    UIModule.closeLightbox();
  }
});

// Exportar funciones necesarias
window.renderIndex = renderIndex;
window.renderProductPage = renderProductPage;
window.ProductsModule = ProductsModule;