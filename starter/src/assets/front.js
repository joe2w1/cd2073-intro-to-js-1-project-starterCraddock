// =====================
// DOM ELEMENT SELECTORS
// =====================
const productListEl = document.querySelector('.products');
const cartListEl = document.querySelector('.cart');
const cartTotalEl = document.querySelector('.cart-total');
const payButtonEl = document.querySelector('.pay');
const cashReceivedInputEl = document.querySelector('.received');
const paymentSummaryEl = document.querySelector('.pay-summary');
const addProductForm = document.getElementById('add-product-form');
const ccForm = document.getElementById('credit-card-form');
const clearReceiptBtn = document.querySelector('.clear-receipt-btn');

// =====================
// STATE
// =====================
let remainingBalance = null;

// =====================
// UI DRAWING FUNCTIONS
// =====================
function drawProducts() {
  if (!productListEl) return;
  productListEl.innerHTML = shoppingCart.products.map(product => {
    const price = shoppingCart.formatCurrency(product.price);
    return `
      <div class="product-item" data-product-id='${product.productId}'>
        <img src='${product.image}' alt='${product.name}'>
        <h3>${product.name}</h3>
        <p>Price: ${price}</p>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    `;
  }).join('');
}

function drawCart() {
  if (!cartListEl) return;
  if (shoppingCart.cart.length === 0) {
    cartListEl.innerHTML = 'Cart Empty';
    return;
  }
  cartListEl.innerHTML = shoppingCart.cart.map(product => {
    const itemTotal = shoppingCart.formatCurrency(product.price * product.quantity);
    return `
      <div class="cart-item" data-product-id='${product.productId}'>
        <h3>${product.name}</h3>
        <p>Quantity: ${product.quantity}</p>
        <p>Total: ${itemTotal}</p>
        <button class="qup" aria-label="Increase quantity of ${product.name}">+</button>
        <button class="qdown" aria-label="Decrease quantity of ${product.name}">-</button>
        <button class="remove" aria-label="Remove ${product.name} from cart">Remove</button>
      </div>
    `;
  }).join('');
}

function drawCheckout() {
  if (!cartTotalEl) return;
  const cartSum = shoppingCart.formatCurrency(shoppingCart.cartTotal());
  cartTotalEl.innerHTML = `<p>Cart Total: ${cartSum}</p>`;
}

function updateUI() {
  drawProducts();
  drawCart();
  drawCheckout();
}

// =====================
// EVENT HANDLERS
// =====================
function handleProductClick(event) {
  const productItem = event.target.closest('.product-item');
  if (event.target.classList.contains('add-to-cart') && productItem) {
    const productId = parseInt(productItem.dataset.productId, 10);
    shoppingCart.addProductToCart(productId);
    updateUI();
  }
}

function handleCartClick(event) {
  const cartItem = event.target.closest('.cart-item');
  if (!cartItem) return;

  const productId = parseInt(cartItem.dataset.productId, 10);
  const targetClass = event.target.classList;

  if (targetClass.contains('remove')) shoppingCart.removeProductFromCart(productId);
  else if (targetClass.contains('qup')) shoppingCart.increaseQuantity(productId);
  else if (targetClass.contains('qdown')) shoppingCart.decreaseQuantity(productId);

  updateUI();
}

function handleCashPayment(event) {
  event.preventDefault();
  const amountPaid = parseFloat(cashReceivedInputEl.value) || 0;
  const total = remainingBalance !== null ? remainingBalance : shoppingCart.cartTotal();
  let summaryHTML = '';

  if (total === 0) {
    summaryHTML = `<p>Cart is empty. Nothing to pay.</p>`;
  } else {
    const change = amountPaid - total;
    if (change >= 0) {
      summaryHTML = `
        <p>Total: ${shoppingCart.formatCurrency(total)}</p>
        <p>Cash Received: ${shoppingCart.formatCurrency(amountPaid)}</p>
        <p>Change Returned: ${shoppingCart.formatCurrency(change)}</p>
        <hr><p><strong>Thank you!</strong></p>`;
      shoppingCart.emptyCart();
      remainingBalance = null;
    } else {
      remainingBalance = -change;
      summaryHTML = `
        <p>Total: ${shoppingCart.formatCurrency(total)}</p>
        <p>Cash Received: ${shoppingCart.formatCurrency(amountPaid)}</p>
        <p><strong>Remaining Balance: ${shoppingCart.formatCurrency(remainingBalance)}</strong></p>
        <hr><p>Please pay the remaining amount.</p>`;
    }
  }

  paymentSummaryEl.innerHTML = summaryHTML;
  cashReceivedInputEl.value = '';
  clearReceiptBtn.style.display = 'block';
  updateUI();
}

function handleCardPayment(event) {
  event.preventDefault();
  const numberEl = document.getElementById('cc-number');
  const expEl = document.getElementById('cc-exp');
  const cvvEl = document.getElementById('cc-cvv');
  const errorDiv = document.getElementById('cc-error');
  
  errorDiv.style.color = 'red';
  if (!/^\d{16}$/.test(numberEl.value.replace(/\s+/g, ''))) {
    errorDiv.textContent = 'Invalid card number. Must be 16 digits.';
    return;
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expEl.value)) {
    errorDiv.textContent = 'Invalid expiration date. Must be in MM/YY format.';
    return;
  }
  if (!/^\d{3,4}$/.test(cvvEl.value)) {
    errorDiv.textContent = 'Invalid CVV. Must be 3 or 4 digits.';
    return;
  }

  errorDiv.style.color = 'green';
  errorDiv.textContent = 'Payment successful! Thank you!';
  shoppingCart.emptyCart();
  updateUI();
  setTimeout(() => {
    ccForm.reset();
    errorDiv.textContent = '';
  }, 3000);
}

function handleAddProduct(event) {
  event.preventDefault();
  const name = document.getElementById('product-name').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const image = document.getElementById('product-image').value;
  const productId = parseInt(document.getElementById('product-id').value, 10);

  if (!name || !image || isNaN(price) || isNaN(productId)) {
    alert('Please fill out all fields correctly.');
    return;
  }
  if (productId < 1) {
    alert('Product ID must be a positive number.');
    return;
  }
  if (shoppingCart.products.some(p => p.productId === productId)) {
    alert('Product ID already exists. Please use a unique ID.');
    return;
  }

  shoppingCart.products.push({ name, price, quantity: 0, productId, image });
  
  updateUI();
  addProductForm.reset();
}

function handleClearReceipt(event) {
  paymentSummaryEl.innerHTML = '';
  remainingBalance = null;
  event.target.style.display = 'none';
}

// =====================
// INITIALIZATION
// =====================
function initializeStore() {
  if (productListEl) productListEl.addEventListener('click', handleProductClick);
  if (cartListEl) cartListEl.addEventListener('click', handleCartClick);
  if (payButtonEl) payButtonEl.addEventListener('click', handleCashPayment);
  if (ccForm) ccForm.addEventListener('submit', handleCardPayment);
  if (addProductForm) addProductForm.addEventListener('submit', handleAddProduct);
  if (clearReceiptBtn) clearReceiptBtn.addEventListener('click', handleClearReceipt);
  
  const emptyBtn = document.querySelector('.empty-cart-btn');
  if (emptyBtn) {
    emptyBtn.addEventListener('click', () => {
      shoppingCart.emptyCart();
      updateUI();
    });
  }

  const currencySelect = document.querySelector('.currency-select');
  if (currencySelect) {
    currencySelect.addEventListener('change', (event) => {
      shoppingCart.switchCurrency(event.target.value);
      updateUI();
    });
  }

  updateUI();
}

document.addEventListener('DOMContentLoaded', initializeStore);