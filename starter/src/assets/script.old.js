// =====================
// PRODUCT DATA
// =====================
let products = [
  {
    name: "Cherry",
    price: 2.99,
    quantity: 0,
    productId: 1,
    image: "../images/cherry.jpg"
  },
  {
    name: "Orange",
    price: 1.99,
    quantity: 0,
    productId: 2,
    image: "../images/orange.jpg"
  },
  {
    name: "Strawberry",
    price: 3.49,
    quantity: 0,
    productId: 3,
    image: "../images/strawberry.jpg"
  }
];
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

function switchCurrency(newCurrency) {
  if (currencyRates[newCurrency]) {
    currentCurrency = newCurrency;
  }
}

function formatCurrency(amount) {
  const converted = Math.round(Number(amount) * currencyRates[currentCurrency] * 100) / 100;
  let formatted = converted;
  if (currentCurrency === 'USD') {
    formatted = converted.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  } else if (currentCurrency === 'EUR') {
    formatted = converted.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  } else if (currentCurrency === 'YEN') {
    formatted = converted.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  }
  return formatted;
}

function addProductToCart(productId) {
  const product = products.find(p => p.productId === productId);
  if (!product) return;
  if (typeof product.quantity !== 'number' || isNaN(product.quantity)) {
    product.quantity = 0;
  }
  product.quantity++;
  if (!cart.find(p => p.productId === productId)) {
    cart.push(product);
  }
}

function increaseQuantity(productId) {
  const product = products.find(p => p.productId === productId);
  if (product) {
    if (typeof product.quantity !== 'number' || isNaN(product.quantity)) {
      product.quantity = 0;
    }
    product.quantity++;
    if (!cart.find(p => p.productId === productId)) {
      cart.push(product);
    }
  }
}

function decreaseQuantity(productId) {
  const product = products.find(p => p.productId === productId);
  if (product && product.quantity > 0) {
    product.quantity--;
    if (product.quantity === 0) {
      const index = cart.findIndex(p => p.productId === productId);
      if (index !== -1) {
        cart.splice(index, 1);
      }
    }
  }
}

function removeProductFromCart(productId) {
  const product = products.find(p => p.productId === productId);
  if (product) {
    product.quantity = 0;
    const index = cart.findIndex(p => p.productId === productId);
    if (index !== -1) {
      cart.splice(index, 1);
    }
  }
}

function cartTotal() {
  return cart.reduce((sum, product) => {
    const price = (typeof product.price === 'number' && !isNaN(product.price)) ? product.price : 0;
    const quantity = (typeof product.quantity === 'number' && !isNaN(product.quantity)) ? product.quantity : 0;
    return sum + price * quantity;
  }, 0);
}

function emptyCart() {
  cart.forEach(product => {
    product.quantity = 0;
  });
  cart = [];
}

function pay(amount) {
  const total = cartTotal();
  return amount - total;
}

function formatPayResult(amount) {
  // Format the result of pay (cash returned or balance due)
  return formatCurrency(amount);
}

// =====================
// CURRENCY LOGIC
// =====================
// 

function formatCartTotal() {
  // Ensure the total is rounded the same as cartTotal
  const total = Number(cartTotal());
  return formatCurrency(total);
}

function getProductPrice(product) {
  const price = (typeof product.price === 'number' && !isNaN(product.price)) ? product.price : 0;
  const converted = Math.round(price * currencyRates[currentCurrency] * 100) / 100;
  return converted;
}

// Expose functions and variables to the global scope (browser only)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'currencySymbol', {
    get: function() { return currencySymbols[currentCurrency]; }
  });
  window.getProductPrice = getProductPrice;
}

module.exports = {
  products,
  cart,
  addProductToCart,
  increaseQuantity,
  decreaseQuantity,
  removeProductFromCart,
  cartTotal,
  pay,
  formatPayResult,
  emptyCart,
  formatCurrency,
  formatCartTotal,
  get currencySymbol() { return currencySymbols[currentCurrency]; },
  getProductPrice,
};
