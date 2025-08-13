// =====================
// DATA & STATE
// =====================
/**
 * Saves the current products array to localStorage.
 */
function saveProductsToStorage() {
  localStorage.setItem('products', JSON.stringify(products));
}

/**
 * Loads products from localStorage or returns a default list.
 * @returns {Array} The array of products.
 */
function loadProductsFromStorage() {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    return JSON.parse(savedProducts);
  }
  // Return the default list if nothing is saved
  return [
    { name: "Cherry", price: 2.99, quantity: 0, productId: 1, image: "../images/cherry.jpg" },
    { name: "Orange", price: 1.99, quantity: 0, productId: 2, image: "../images/orange.jpg" },
    { name: "Strawberry", price: 3.49, quantity: 0, productId: 3, image: "../images/strawberry.jpg" }
  ];
}

// Initialize products by loading from storage
let products = loadProductsFromStorage();

let cart = [];
let currentCurrency = 'USD';

const currencyRates = {
  USD: 1,
  EUR: 0.92,
  YEN: 155.5,
};

const currencySymbols = {
  USD: '$',
  EUR: '€',
  YEN: '¥'
};

// =====================
// HELPER FUNCTIONS
// =====================
/**
 * Finds a product in the products array by its ID.
 * @param {number} productId The ID of the product.
 * @returns {object|undefined} The product object or undefined if not found.
 */
const findProductById = (productId) => products.find(p => p.productId === productId);

/**
 * Finds a product in the cart array by its ID.
 * @param {number} productId The ID of the product.
 * @returns {object|undefined} The product object or undefined if not found.
 */
const findProductInCart = (productId) => cart.find(p => p.productId === productId);

// =====================
// CART LOGIC
// =====================
/**
 * Increases a product's quantity and adds it to the cart if not already present.
 * @param {number} productId The ID of the product to add/increase.
 */
function increaseQuantity(productId) {
  const product = findProductById(productId);
  if (!product) {
    console.error(`Product with ID ${productId} not found.`);
    return;
  }

  // Ensure quantity is a number
  if (typeof product.quantity !== 'number' || isNaN(product.quantity)) {
    product.quantity = 0;
  }

  product.quantity++;

  // Add to cart if it's not there already
  if (!findProductInCart(productId)) {
    cart.push(product);
  }
}

/**
 * Alias for increaseQuantity, for semantic clarity when adding a new item.
 * @param {number} productId The ID of the product to add.
 */
const addProductToCart = increaseQuantity;

/**
 * Decreases a product's quantity. Removes it from cart if quantity becomes 0.
 * @param {number} productId The ID of the product to decrease.
 */
function decreaseQuantity(productId) {
  const product = findProductInCart(productId);
  if (product && product.quantity > 0) {
    product.quantity--;
    if (product.quantity === 0) {
      removeProductFromCart(productId);
    }
  }
}

/**
 * Removes a product entirely from the cart and resets its quantity.
 * @param {number} productId The ID of the product to remove.
 */
function removeProductFromCart(productId) {
  const product = findProductById(productId);
  if (product) {
    product.quantity = 0;
  }
  cart = cart.filter(p => p.productId !== productId);
}

/**
 * Calculates the total cost of all items in the cart in USD.
 * @returns {number} The total cost.
 */
function cartTotal() {
  return cart.reduce((sum, product) => {
    // Robustly handle cases where price or quantity might not be valid numbers
    const price = (typeof product.price === 'number' && !isNaN(product.price)) ? product.price : 0;
    const quantity = (typeof product.quantity === 'number' && !isNaN(product.quantity)) ? product.quantity : 0;
    return sum + (price * quantity);
  }, 0);
}

/**
 * Empties the cart and resets all product quantities.
 */
function emptyCart() {
  cart.forEach(product => {
    if (findProductById(product.productId)) {
      findProductById(product.productId).quantity = 0;
    }
  });
  cart = [];
}

/**
 * Calculates the difference between payment and cart total.
 * @param {number} amountPaid The amount paid by the customer.
 * @returns {number} The change to be returned (positive) or balance due (negative).
 */
function calculateChange(amountPaid) {
  return amountPaid - cartTotal();
}

// =====================
// CURRENCY LOGIC
// =====================
/**
 * Switches the current currency and returns the new symbol.
 * @param {string} newCurrency The new currency code (e.g., 'EUR').
 */
function switchCurrency(newCurrency) {
  if (currencyRates[newCurrency]) {
    currentCurrency = newCurrency;
  }
}

/**
 * Converts a price from USD to the current currency.
 * @param {number} price The price in USD.
 * @returns {number} The converted price.
 */
function getConvertedPrice(price) {
  const validPrice = (typeof price === 'number' && !isNaN(price)) ? price : 0;
  return validPrice * currencyRates[currentCurrency];
}

/**
 * Formats a numerical amount into a string based on the current currency.
 * @param {number} amount The amount to format.
 * @returns {string} The formatted currency string.
 */
function formatCurrency(amount) {
  const convertedAmount = getConvertedPrice(amount);
  const options = { style: 'currency', currency: currentCurrency };

  // Use Intl.NumberFormat for robust formatting
  if (currentCurrency === 'YEN') {
    options.currencyDisplay = 'narrowSymbol';
    return new Intl.NumberFormat('ja-JP', options).format(Math.round(convertedAmount));
  }
  return new Intl.NumberFormat('en-US', options).format(convertedAmount);
}

// Expose functions and variables to the global scope for front.js
// This pattern is for simple projects without a build step/bundler.
if (typeof window !== 'undefined') {
  window.products = products;
  window.cart = cart;
  window.addProductToCart = addProductToCart;
  window.increaseQuantity = increaseQuantity;
  window.decreaseQuantity = decreaseQuantity;
  window.removeProductFromCart = removeProductFromCart;
  window.emptyCart = emptyCart;
  window.calculateChange = calculateChange;
  window.switchCurrency = switchCurrency;
  window.formatCurrency = formatCurrency;
  window.cartTotal = cartTotal;
  Object.defineProperty(window, 'currencySymbol', {
    get: () => currencySymbols[currentCurrency]
  });
}