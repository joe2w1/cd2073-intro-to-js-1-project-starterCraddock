const shoppingCart = {
  // --- DATA ---
  products: [
    { name: "Cherry", price: 2.99, quantity: 0, productId: 1, image: "../images/cherry.jpg" },
    { name: "Orange", price: 1.99, quantity: 0, productId: 2, image: "../images/orange.jpg" },
    { name: "Strawberry", price: 3.49, quantity: 0, productId: 3, image: "../images/strawberry.jpg" }
  ],
  cart: [],
  currentCurrency: 'USD',
  currencyRates: {
    USD: 1,
    EUR: 0.92,
    YEN: 155.5,
  },
  currencySymbols: {
    USD: '$',
    EUR: '€',
    YEN: '¥'
  },

  // --- CORE CART METHODS ---
  addProductToCart(productId) {
    const product = this.products.find(p => p.productId === productId);
    if (!product) return;

    product.quantity++;
    if (!this.cart.some(p => p.productId === productId)) {
      this.cart.push(product);
    }
  },

  increaseQuantity(productId) {
    this.addProductToCart(productId);
  },

  decreaseQuantity(productId) {
    const product = this.products.find(p => p.productId === productId);
    if (product && product.quantity > 0) {
      product.quantity--;
      if (product.quantity === 0) {
        const index = this.cart.findIndex(p => p.productId === productId);
        if (index > -1) {
          this.cart.splice(index, 1);
        }
      }
    }
  },

  removeProductFromCart(productId) {
    const product = this.products.find(p => p.productId === productId);
    if (product) {
      product.quantity = 0;
      const index = this.cart.findIndex(p => p.productId === productId);
      if (index > -1) {
        this.cart.splice(index, 1);
      }
    }
  },

  emptyCart() {
    this.cart.forEach(product => {
      const originalProduct = this.products.find(p => p.productId === product.productId);
      if (originalProduct) {
        originalProduct.quantity = 0;
      }
    });
    this.cart.length = 0;
  },

  cartTotal() {
    // Return the raw total to match the test's expectation, including floating-point errors.
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  pay(amount) {
    return amount - this.cartTotal();
  },

  // --- UI HELPER & CURRENCY METHODS ---
  switchCurrency(newCurrency) {
    if (this.currencyRates[newCurrency]) {
      this.currentCurrency = newCurrency;
    }
  },
  
  getConvertedPrice(price) {
    const validPrice = (typeof price === 'number' && !isNaN(price)) ? price : 0;
    return validPrice * this.currencyRates[this.currentCurrency];
  },

  formatCurrency(amount) {
    const convertedAmount = this.getConvertedPrice(amount);
    const options = { style: 'currency', currency: this.currentCurrency };

    if (this.currentCurrency === 'YEN') {
      options.currencyDisplay = 'narrowSymbol';
      return new Intl.NumberFormat('ja-JP', options).format(Math.round(convertedAmount));
    }
    return new Intl.NumberFormat('en-US', options).format(convertedAmount);
  },
  
  get currencySymbol() {
    return this.currencySymbols[this.currentCurrency];
  }
};

// Export for tests and make it available to the browser's front.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = shoppingCart;
}
if (typeof window !== 'undefined') {
  window.shoppingCart = shoppingCart;
}