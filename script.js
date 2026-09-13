/* ============================================================
   NOSTRA — script.js
   Mobile nav, product search/filter, and form handling.
   ============================================================ */

/* ---------------------------------------------------------
   Shared: storage + cart helpers
   --------------------------------------------------------- */
const CART_ITEMS_KEY = 'nostra-cart-items';
const CART_COUNT_KEY = 'nostra-cart-count';

function getCartItems(){
  try {
    const saved = JSON.parse(localStorage.getItem(CART_ITEMS_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveCartItems(items){
  try {
    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
  } catch (error) {
    // ignore storage issues in restricted browsers
  }
}

function getCartCount(){
  return getCartItems().reduce((sum, item) => sum + Number(item.qty || 1), 0);
}

function updateBagCount(){
  const bagCountEls = document.querySelectorAll('.icon-btn[aria-label="Bag"] span');
  const count = getCartCount();
  bagCountEls.forEach(el => {
    el.textContent = String(count);
  });

  try {
    localStorage.setItem(CART_COUNT_KEY, String(count));
  } catch (error) {
    // ignore storage issues in restricted browsers
  }
}

function addCartItem(product){
  const cart = getCartItems();
  const existing = cart.find(item => item.id === product.id);

  if(existing){
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      image: product.image,
      qty: 1
    });
  }

  saveCartItems(cart);
  updateBagCount();
}

/* ---------------------------------------------------------
   Shared: mobile nav toggle (all pages)
   --------------------------------------------------------- */
(function initNav(){
  const toggle = document.getElementById('navToggle');
  const panel = document.getElementById('mobilePanel');
  if(!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
})();

(function initHeaderSearch(){
  const trigger = document.querySelector('.icon-btn[aria-label="Search"]');
  if(!trigger) return;

  trigger.addEventListener('click', () => {
    const searchInput = document.getElementById('searchInput');

    if(searchInput){
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    window.location.href = 'collections.html#searchInput';
  });
})();

/* ---------------------------------------------------------
   Shared: newsletter sign-up (home page)
   --------------------------------------------------------- */
(function initNewsletter(){
  const form = document.getElementById('newsletterForm');
  const note = document.getElementById('newsletterNote');
  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value.trim();
    if(!isValidEmail(email)){
      note.textContent = 'Enter a valid email address to sign up.';
      return;
    }
    note.textContent = `Thanks — we'll send drops to ${email}.`;
    form.reset();
  });
})();

/* ---------------------------------------------------------
   Shared: contact form (contact page)
   --------------------------------------------------------- */
(function initContactForm(){
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if(!name || !email || !message){
      status.textContent = 'Please fill in your name, email and message.';
      status.className = 'form-status error';
      return;
    }
    if(!isValidEmail(email)){
      status.textContent = 'That email address doesn\'t look right — check it and try again.';
      status.className = 'form-status error';
      return;
    }

    status.textContent = `Thanks, ${name.split(' ')[0]} — your message is on its way to us. We'll reply within two working days.`;
    status.className = 'form-status success';
    form.reset();
  });
})();

function isValidEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* ---------------------------------------------------------
   Collections page: product data, search, filter, sort
   --------------------------------------------------------- */
(function initCollections(){
  const grid = document.getElementById('productGrid');
  if(!grid) return; // not on the collections page

  const PRODUCTS = [
    { id: 1,  name: 'The Fieldcoat',        category: 'Outerwear',   price: 18500, was: null,  swatch: 'sw-1', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 2,  name: 'Waxed Canvas Parka',   category: 'Outerwear',   price: 21900, was: null,  swatch: 'sw-4', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 3,  name: 'Selvedge Chore Jacket',category: 'Outerwear',   price: 14200, was: 16800, swatch: 'sw-7', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 4,  name: 'Alpaca Crewneck',      category: 'Knitwear',    price: 9800,  was: null,  swatch: 'sw-2', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 5,  name: 'Merino Roll Neck',     category: 'Knitwear',    price: 7600,  was: null,  swatch: 'sw-6', image: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 6,  name: 'Cable Knit Cardigan',  category: 'Knitwear',    price: 10500, was: 12500, swatch: 'sw-3', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85', inStock: false },
    { id: 7,  name: 'Wool Wide-Leg Trouser',category: 'Trousers',    price: 8200,  was: null,  swatch: 'sw-5', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 8,  name: 'Raw Denim Straight',   category: 'Trousers',    price: 6900,  was: null,  swatch: 'sw-8', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 9,  name: 'Canvas Utility Pant',  category: 'Trousers',    price: 5400,  was: 6200, swatch: 'sw-1', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 10, name: 'Leather Card Wallet',  category: 'Accessories', price: 3200,  was: null,  swatch: 'sw-5', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 11, name: 'Wool Scarf, brick',    category: 'Accessories', price: 2800,  was: null,  swatch: 'sw-7', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 12, name: 'Canvas Tote',          category: 'Accessories', price: 1900,  was: 2400, swatch: 'sw-2', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 13, name: 'Waxed Boot, ash',      category: 'Footwear',    price: 15600, was: null,  swatch: 'sw-4', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85', inStock: true  },
    { id: 14, name: 'Suede Chukka',         category: 'Footwear',    price: 11400, was: null,  swatch: 'sw-6', image: 'https://images.unsplash.com/photo-1529810313688-44ea1c2d81d3?auto=format&fit=crop&w=900&q=85', inStock: false },
    { id: 15, name: 'Shearling Slipper',    category: 'Footwear',    price: 4600,  was: 5400, swatch: 'sw-3', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85', inStock: true  },
  ];

  const searchInput   = document.getElementById('searchInput');
  const sortSelect    = document.getElementById('sortSelect');
  const priceRange    = document.getElementById('priceRange');
  const priceLabel    = document.getElementById('priceLabel');
  const onSaleOnly    = document.getElementById('onSaleOnly');
  const inStockOnly   = document.getElementById('inStockOnly');
  const categoryBoxes = Array.from(document.querySelectorAll('input[name="category"]'));
  const resultsCount  = document.getElementById('resultsCount');
  const clearBtn      = document.getElementById('clearFilters');
  const filterToggle  = document.getElementById('filterToggle');
  const filterPanel   = document.getElementById('filterPanel');
  updateBagCount();

  // Fill in per-category counts next to each checkbox label.
  categoryBoxes.forEach(box => {
    const count = PRODUCTS.filter(p => p.category === box.value).length;
    const countEl = box.closest('.filter-option').querySelector('.count');
    if(countEl) countEl.textContent = count;
  });

  function formatPrice(n){
    return '₹' + n.toLocaleString('en-IN');
  }

  function getActiveFilters(){
    const query = searchInput.value.trim().toLowerCase();
    const selectedCategories = categoryBoxes.filter(b => b.checked).map(b => b.value);
    const maxPrice = Number(priceRange.value);
    return {
      query,
      selectedCategories,
      maxPrice,
      onSale: onSaleOnly.checked,
      inStock: inStockOnly.checked,
      sort: sortSelect.value,
    };
  }

  function applyFilters(){
    const { query, selectedCategories, maxPrice, onSale, inStock, sort } = getActiveFilters();

    let results = PRODUCTS.filter(p => {
      const matchesQuery = query === '' ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchesPrice = p.price <= maxPrice;
      const matchesSale = !onSale || p.was !== null;
      const matchesStock = !inStock || p.inStock;
      return matchesQuery && matchesCategory && matchesPrice && matchesSale && matchesStock;
    });

    switch(sort){
      case 'price-asc':  results.sort((a, b) => a.price - b.price); break;
      case 'price-desc': results.sort((a, b) => b.price - a.price); break;
      case 'name-asc':   results.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break; // 'featured' = original order
    }

    renderProducts(results);
  }

  function renderProducts(list){
    resultsCount.textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;

    if(list.length === 0){
      grid.innerHTML = `
        <div class="no-results">
          <strong>No pieces match those filters</strong>
          <p>Try a different search term, or clear your filters to see the full range.</p>
        </div>`;
      return;
    }

    grid.innerHTML = list.map(p => `
      <article class="card">
        <div class="card-media">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <span class="card-tag sale">Sale</span>
        </div>
        <h3>${p.name}</h3>
        <p class="cat">${p.category}</p>
        <p class="price">
          ${p.was ? `<span class="was">${formatPrice(p.was)}</span>` : ''}${formatPrice(p.price)}
        </p>
        <div class="card-actions">
          <button type="button" class="add-to-cart-btn" data-product-id="${p.id}">Add to cart</button>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.add-to-cart-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const product = PRODUCTS.find(item => item.id === Number(button.dataset.productId));
        if(!product) return;

        addCartItem(product);
        button.textContent = 'Added';
        button.disabled = true;
      });
    });
  }

  function updatePriceLabel(){
    priceLabel.textContent = formatPrice(Number(priceRange.value));
  }

  function clearAllFilters(){
    searchInput.value = '';
    sortSelect.value = 'featured';
    priceRange.value = priceRange.max;
    onSaleOnly.checked = false;
    inStockOnly.checked = false;
    categoryBoxes.forEach(b => b.checked = false);
    updatePriceLabel();
    applyFilters();
  }

  // Wire up events
  searchInput.addEventListener('input', applyFilters);
  sortSelect.addEventListener('change', applyFilters);
  onSaleOnly.addEventListener('change', applyFilters);
  inStockOnly.addEventListener('change', applyFilters);
  categoryBoxes.forEach(b => b.addEventListener('change', applyFilters));
  priceRange.addEventListener('input', () => { updatePriceLabel(); applyFilters(); });
  clearBtn.addEventListener('click', clearAllFilters);

  if(filterToggle){
    filterToggle.addEventListener('click', () => {
      filterPanel.classList.toggle('open');
    });
  }

  // Initial paint
  updatePriceLabel();
  applyFilters();
})();

(function initCartPage(){
  const cartItems = document.getElementById('cartItems');
  if(!cartItems) return;

  const cartEmpty = document.getElementById('cartEmpty');
  const cartCountRow = document.getElementById('cartCountRow');
  const subtotalEl = document.getElementById('summarySubtotal');
  const shippingEl = document.getElementById('summaryShipping');
  const totalEl = document.getElementById('summaryTotal');

  function renderCart(){
    const items = getCartItems();

    if(items.length === 0){
      cartItems.innerHTML = '';
      if(cartEmpty) cartEmpty.style.display = 'block';
      if(cartCountRow) cartCountRow.textContent = '0 items';
      if(subtotalEl) subtotalEl.textContent = '₹0';
      if(shippingEl) shippingEl.textContent = '₹0';
      if(totalEl) totalEl.textContent = '₹0';
      updateBagCount();
      return;
    }

    if(cartEmpty) cartEmpty.style.display = 'none';

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = subtotal > 4000 ? 0 : 350;
    const total = subtotal + shipping;
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

    if(cartCountRow) cartCountRow.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
    if(subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if(shippingEl) shippingEl.textContent = `₹${shipping.toLocaleString('en-IN')}`;
    if(totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;

    cartItems.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-product">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <div>
            <h3>${item.name}</h3>
            <p>${item.category}</p>
          </div>
        </div>
        <div class="cart-meta">
          <div class="qty-box">
            <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
          </div>
          <strong>₹${(item.price * item.qty).toLocaleString('en-IN')}</strong>
          <button type="button" class="remove-item" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `).join('');

    cartItems.querySelectorAll('.qty-btn').forEach(button => {
      button.addEventListener('click', () => {
        const itemId = Number(button.dataset.id);
        const action = button.dataset.action;
        const nextItems = getCartItems();
        const matchIndex = nextItems.findIndex(item => item.id === itemId);
        if(matchIndex === -1) return;

        if(action === 'increase') nextItems[matchIndex].qty += 1;
        else {
          nextItems[matchIndex].qty -= 1;
          if(nextItems[matchIndex].qty <= 0) nextItems.splice(matchIndex, 1);
        }

        saveCartItems(nextItems);
        renderCart();
      });
    });

    cartItems.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', () => {
        const itemId = Number(button.dataset.id);
        const nextItems = getCartItems().filter(item => item.id !== itemId);
        saveCartItems(nextItems);
        renderCart();
      });
    });
  }

  renderCart();
})();