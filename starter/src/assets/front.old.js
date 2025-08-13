// Draws product list
function drawProducts() {
    let productList = document.querySelector('.products');
    let productItems = '';
    products.forEach((element) => {
        const price = getProductPrice(element).toFixed(2);
        productItems += `
            <div data-productId='${element.productId}'>
                <img src='${element.image}'>
                <h3>${element.name}</h3>
                <p>price: ${currencySymbol}${price}</p>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        `;
    });
    // use innerHTML so that products only drawn once
    productList.innerHTML = productItems;
}

// Draws cart
function drawCart() {
    let cartList = document.querySelector('.cart');
    // clear cart before drawing
    let cartItems = '';
    cart.forEach((element) => {
        const price = getProductPrice(element).toFixed(2);
        const itemTotal = (getProductPrice(element) * element.quantity).toFixed(2);

        cartItems += `
            <div data-productId='${element.productId}'>
                <h3>${element.name}</h3>
                <p>price: ${currencySymbol}${price}</p>
                <p>quantity: ${element.quantity}</p>
                <p>total: ${currencySymbol}${itemTotal}</p>
                <button class="qup">+</button>
                <button class="qdown">-</button>
                <button class="remove">remove</button>
            </div>
        `;
    });
    // use innerHTML so that cart products only drawn once
    cart.length
        ? (cartList.innerHTML = cartItems)
        : (cartList.innerHTML = 'Cart Empty');
}

// Draws checkout
function drawCheckout() {
    let checkout = document.querySelector('.cart-total');
    checkout.innerHTML = '';

    // run cartTotal() from script.js
    let cartSum = formatCartTotal();
    let div = document.createElement('div');
    div.innerHTML = `<p>Cart Total: ${cartSum}`;
    checkout.append(div);
}

// Initialize store with products, cart, and checkout
drawProducts();
drawCart();
drawCheckout();

document.querySelector('.products').addEventListener('click', (e) => {
    let productId = e.target.parentNode.getAttribute('data-productId');
    productId *= 1;
    addProductToCart(productId);
    drawCart();
    drawCheckout();
});

// Event delegation used to support dynamically added cart items
document.querySelector('.cart').addEventListener('click', (e) => {
    // Helper nested higher order function to use below
    // Must be nested to have access to the event target
    // Takes in a cart function as an agrument
    function runCartFunction(fn) {
        let productId = e.target.parentNode.getAttribute('data-productId');
        productId *= 1;
        for (let i = cart.length - 1; i > -1; i--) {
            if (cart[i].productId === productId) {
                let productId = cart[i].productId;
                fn(productId);
            }
        }
        // force cart and checkout redraw after cart function completes
        drawCart();
        drawCheckout();
    }

    // check the target's class and run function based on class
    if (e.target.classList.contains('remove')) {
        // run removeProductFromCart() from script.js
        runCartFunction(removeProductFromCart);
    } else if (e.target.classList.contains('qup')) {
        // run increaseQuantity() from script.js
        runCartFunction(increaseQuantity);
    } else if (e.target.classList.contains('qdown')) {
        // run decreaseQuantity() from script.js
        runCartFunction(decreaseQuantity);
    }
});

// Update: Enhanced pay button logic
let remainingBalance = null;

const payButton = document.querySelector('.pay');
payButton.addEventListener('click', (e) => {
    e.preventDefault();
    let amountInput = document.querySelector('.received');
    let amount = parseFloat(amountInput.value);
    let paymentSummary = document.querySelector('.pay-summary');
    let div = document.createElement('div');
    let total = remainingBalance !== null ? remainingBalance : cartTotal();
    let cashReturn = amount - total;

    if (total === 0) {
        emptyCart();
        drawCart();
        drawCheckout();
        div.innerHTML = `<p>Cart is empty. Shopping cart cleared.</p>`;
        remainingBalance = null;
    } else if (cashReturn >= 0) {
        div.innerHTML = `
            <p>Cash Received: ${currencySymbol}${amount}</p>
            <p>Cash Returned: ${currencySymbol}${cashReturn}</p>
            <p>Thank you!</p>
        `;
        emptyCart();
        drawCart();
        drawCheckout();
        remainingBalance = null;
    } else {
        remainingBalance = total - amount;
        div.innerHTML = `
            <p>Cash Received: ${currencySymbol}${amount}</p>
            <p>Remaining Balance: ${currencySymbol}${remainingBalance}</p>
            <p>Please pay additional amount.</p>
            <hr/>
        `;
        drawCheckout();
    }
    paymentSummary.append(div);
    amountInput.value = '';
    document.querySelector('.clear-receipt-btn').style.display = 'block';
});

// Update: Enhanced credit card payment logic
const ccForm = document.getElementById('credit-card-form');
if (ccForm) {
  ccForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Remove spaces and dashes from card number
    let number = document.getElementById('cc-number').value;
    number = number.replace(/\s+/g, '').replace(/-/g, '');
    const exp = document.getElementById('cc-exp').value.trim();
    const cvv = document.getElementById('cc-cvv').value.trim();
    const errorDiv = document.getElementById('cc-error');
    errorDiv.textContent = '';

    // Check for empty input
    if (!number) {
      errorDiv.textContent = 'Card number is required.';
      return;
    }
    if (!exp) {
      errorDiv.textContent = 'Expiration date is required.';
      return;
    }
    if (!cvv) {
      errorDiv.textContent = 'CVV is required.';
      return;
    }

    // Simple validation
    const numberValid = /^\d{16}$/.test(number);
    const expValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
    const cvvValid = /^\d{3}$/.test(cvv);

    if (!numberValid) {
      errorDiv.style.color = 'red';
      errorDiv.textContent = 'Invalid card number. Must be 16 digits.';
      return;
    }
    if (!expValid) {
      errorDiv.style.color = 'red';
      errorDiv.textContent = 'Invalid expiration date. Format MM/YY.';
      return;
    }
    if (!cvvValid) {
      errorDiv.style.color = 'red';
      errorDiv.textContent = 'Invalid CVV. Must be 3 digits.';
      return;
    }

    // Only clear cart and show success if all validations pass
    errorDiv.style.color = 'green';
    errorDiv.textContent = 'Payment successful! Thank you!';
    emptyCart();
    drawCart();
    drawCheckout();
    ccForm.reset();
  });
}

// Standout suggestions
/* Begin remove all items from cart */
function dropCart(){
    let shoppingCart = document.querySelector('.empty-btn');
    let div = document.createElement("button");
    div.classList.add("empty");
    div.innerHTML =`Empty Cart`;
    shoppingCart.append(div);
}
dropCart();

document.querySelector('.empty-btn').addEventListener('click', (e) => {
    if (e.target.classList.contains('empty')){
        emptyCart();
        drawCart();
        drawCheckout();
    }
})
/* End all items from cart */

/* Begin currency converter */
function currencyBuilder(){
    let currencyPicker = document.querySelector('.currency-selector');
    let select = document.createElement("select");
    select.classList.add("currency-select");
    select.innerHTML = `<option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="YEN">YEN</option>`;
    currencyPicker.append(select);
}
currencyBuilder();

document.querySelector('.currency-select').addEventListener('change', function handleChange(event) {
    switchCurrency(event.target.value);
    drawProducts();
    drawCart();
    drawCheckout();
});
/* End currency converter */

// Add product form handler
const addProductForm = document.getElementById('add-product-form');
if (addProductForm) {
  addProductForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value;
    const productId = parseInt(document.getElementById('product-id').value, 10);

    products.push({
      name,
      price,
      quantity: 0,
      productId,
      image
    });

    drawProducts();
    drawCart();
    drawCheckout();
    addProductForm.reset();
  });
}

/* End standout suggestions */

// Clear Receipt Button
document.querySelector('.clear-receipt-btn').addEventListener('click', () => {
    // Find the receipt container and clear its content
    const paymentSummary = document.querySelector('.pay-summary');
    paymentSummary.innerHTML = '';

    // Reset the remaining balance to prevent calculation errors on the next payment
    remainingBalance = null;
    e.target.style.display = 'none';
});

