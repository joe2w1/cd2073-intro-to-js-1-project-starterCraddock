// =====================
// DOM ELEMENT SELECTORS
// =====================
const productListEl = document.querySelector('.products');
const cartListEl = document.querySelector('.cart');
const cartTotalEl = document.querySelector('.cart-total');
const payButtonEl = document.querySelector('.pay');
const cashReceivedInputEl = document.querySelector('.received');
const paymentSummaryEl = document.querySelector('.pay-summary');
const emptyCartBtnContainer = document.querySelector('.empty-btn');
const currencySelectorContainer = document.querySelector('.currency-selector');
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
/**
 * Renders the list of available products.
 */
function drawProducts() {
  if (!productListEl) return;
  productListEl.innerHTML = products.map(product => {
    const price = formatCurrency(product.price);
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

/**
 * Renders the items currently in the shopping cart.
 */
function drawCart() {
  if (!cartListEl) return;
  if (cart.length === 0) {
    cartListEl.innerHTML = 'Cart Empty';
    return;
  }
  cartListEl.innerHTML = cart.map(product => {
    const itemTotal = formatCurrency(product.price * product.quantity);
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

/**
 * Renders the final checkout total.
 */
function drawCheckout() {
  if (!cartTotalEl) return;
  const cartSum = formatCurrency(cartTotal());
  cartTotalEl.innerHTML = `<p>Cart Total: ${cartSum}</p>`;
}

/**
 * A single function to update all parts of the UI.
 */
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
    addProductToCart(productId);
    updateUI();
  }
}

function handleCartClick(event) {
  const cartItem = event.target.closest('.cart-item');
  if (!cartItem) return;

  const productId = parseInt(cartItem.dataset.productId, 10);
  const targetClass = event.target.classList;

  if (targetClass.contains('remove')) removeProductFromCart(productId);
  else if (targetClass.contains('qup')) increaseQuantity(productId);
  else if (targetClass.contains('qdown')) decreaseQuantity(productId);

  updateUI();
}

function handleCashPayment(event) {
  event.preventDefault();
  const amountPaid = parseFloat(cashReceivedInputEl.value) || 0;
  const total = remainingBalance !== null ? remainingBalance : cartTotal();
  let summaryHTML = '';

  if (total === 0) {
    summaryHTML = `<p>Cart is empty. Nothing to pay.</p>`;
  } else {
    const change = amountPaid - total;
    if (change >= 0) {
      summaryHTML = `
        <p>Total: ${formatCurrency(total)}</p>
        <p>Cash Received: ${formatCurrency(amountPaid)}</p>
        <p>Change Returned: ${formatCurrency(change)}</p>
        <hr><p><strong>Thank you!</strong></p>`;
      emptyCart();
      remainingBalance = null;
    } else {
      remainingBalance = -change; // Remaining balance is the positive amount due
      summaryHTML = `
        <p>Total: ${formatCurrency(total)}</p>
        <p>Cash Received: ${formatCurrency(amountPaid)}</p>
        <p><strong>Remaining Balance: ${formatCurrency(remainingBalance)}</strong></p>
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

  // Simple validation
  const numberValid = /^\d{16}$/.test(numberEl.value.replace(/\s+/g, ''));
  const expValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expEl.value);
  const cvvValid = /^\d{3,4}$/.test(cvvEl.value);

  errorDiv.style.color = 'red'; // Default to error color
  if (!numberValid) {
    errorDiv.textContent = 'Invalid card number. Must be 16 digits.';
    return;
  }
  if (!expValid) {
    errorDiv.textContent = 'Invalid expiration date. Must be in MM/YY format.';
    return;
  }
  if (!cvvValid) {
    errorDiv.textContent = 'Invalid CVV. Must be 3 or 4 digits.';
    return;
  }

  // Success
  errorDiv.style.color = 'green';
  errorDiv.textContent = 'Payment successful! Thank you!';
  emptyCart();
  updateUI();
  setTimeout(() => { // Clear form and message after a delay
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

  // Basic validation
  if (!name || isNaN(price) || !image || isNaN(productId)) {
    alert('Please fill out all fields correctly.');
    return;
  }
  if (products.some(p => p.productId === productId)) {
    alert('Product ID already exists.');
    return;
  }

  products.push({ name, price, quantity: 0, productId, image });

  // Save updated products to array
  saveProductsToStorage();

  updateUI();
  addProductForm.reset();
}

function handleClearReceipt(event) {
  paymentSummaryEl.innerHTML = '';
  remainingBalance = null;
  event.target.style.display = 'none'; // Hide the button itself
}

// =====================
// INITIALIZATION
// =====================
function initializeStore() {
  // Setup Event Listeners
  if (productListEl) productListEl.addEventListener('click', handleProductClick);
  if (cartListEl) cartListEl.addEventListener('click', handleCartClick);
  if (payButtonEl) payButtonEl.addEventListener('click', handleCashPayment);
  if (ccForm) ccForm.addEventListener('submit', handleCardPayment);
  if (addProductForm) addProductForm.addEventListener('submit', handleAddProduct);
  if (clearReceiptBtn) clearReceiptBtn.addEventListener('click', handleClearReceipt);
  
  // The 'Empty Cart' button and currency selector are now assumed to be in the HTML.
  // We just need to add the event listeners.
  const emptyBtn = document.querySelector('.empty-cart-btn');
  if (emptyBtn) {
    emptyBtn.addEventListener('click', () => {
      emptyCart();
      updateUI();
    });
  }

  const currencySelect = document.querySelector('.currency-select');
  if (currencySelect) {
    currencySelect.addEventListener('change', (event) => {
      switchCurrency(event.target.value);
      updateUI();
    });
  }

  // Initial UI Draw
  updateUI();
}

// Run the initialization function when the DOM is ready.
document.addEventListener('DOMContentLoaded', initializeStore);