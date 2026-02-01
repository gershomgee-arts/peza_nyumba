document.addEventListener('DOMContentLoaded', () => {

    const cartBtn = document.getElementById('cart-btn');
    const modal = document.getElementById('cart-modal');
    const closeBtn = document.getElementById('close-cart');
    const cartContainer = document.getElementById('cart-items-container');
    const totalDisplay = document.getElementById('cart-total-display');
    const checkoutBtn = document.getElementById('checkout-btn');
    const productGrid = document.querySelector('.grid-4') || document.body;
    const requestForm = document.getElementById('custom-request-form');

    // Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => {
                    b.classList.remove('btn-secondary');
                    b.classList.add('btn-outline');
                });
                btn.classList.remove('btn-outline');
                btn.classList.add('btn-secondary');

                const filter = btn.dataset.filter;
                productCards.forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.5s ease';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Initialize Cart
    let cart = JSON.parse(localStorage.getItem('peza_cart')) || [];
    updateCartIcon();

    // 1. Add to Cart (Delegation)
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-add');
            if (btn) {
                const card = btn.closest('.product-card');
                const title = card.querySelector('h4').innerText;
                const priceText = card.querySelector('.product-price').innerText;
                const price = parseFloat(priceText.replace('K', '').replace(',', ''));

                addItemToCart({ title, price, priceText });

                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                btn.style.backgroundColor = '#166534';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.backgroundColor = '';
                }, 1000);
            }
        });
    }

    // 2. Custom Request Logic
    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const itemInput = document.getElementById('custom-item');
            const qtyInput = document.getElementById('custom-qty');

            const item = itemInput.value.trim();
            const qty = qtyInput.value;

            if (item && qty) {
                addItemToCart({
                    title: `Request: ${item} (x${qty})`,
                    price: 0,
                    priceText: 'TBD'
                });

                itemInput.value = '';
                qtyInput.value = '';

                const btn = requestForm.querySelector('button');
                const originalText = btn.innerText;
                btn.innerText = 'Recorded!';
                btn.classList.replace('btn-primary', 'btn-secondary');
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.replace('btn-secondary', 'btn-primary');
                }, 2000);
            }
        });
    }

    // 3. Cart Utilities
    function addItemToCart(item) {
        cart.push(item);
        saveCart();
    }

    function removeItem(index) {
        cart.splice(index, 1);
        saveCart();
        renderCartItems();
    }

    function saveCart() {
        localStorage.setItem('peza_cart', JSON.stringify(cart));
        updateCartIcon();
    }

    function updateCartIcon() {
        if (cartBtn) {
            cartBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Cart (${cart.length})`;
        }
    }

    // 4. Modal Logic
    if (cartBtn && modal) {
        cartBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            renderCartItems();
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // 5. Render Cart
    function renderCartItems() {
        if (!cartContainer) return;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p style="text-align: center; color: grey;">Your cart is empty.</p>';
            if (totalDisplay) totalDisplay.innerText = 'K0.00';
            if (checkoutBtn) {
                checkoutBtn.innerText = 'Proceed to Delivery Details';
                checkoutBtn.disabled = true;
            }
            return;
        }

        let html = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f3f3f3;">
                    <div>
                        <p style="font-weight: 500;">${item.title}</p>
                        <small style="color: grey;">${item.priceText}</small>
                    </div>
                    <button class="remove-btn" data-index="${index}" style="background: none; color: #ef4444; font-size: 1rem; padding: 0.5rem; cursor: pointer;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        });

        cartContainer.innerHTML = html;
        if (totalDisplay) totalDisplay.innerText = `K${total.toFixed(2)}`;

        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.innerText = 'Proceed to Delivery Details';
        }

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.closest('.remove-btn').dataset.index);
                removeItem(idx);
            });
        });
    }

    // 6. Redirect to Checkout Page
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // Check for authentication
            if (window.PezaAuth && !window.PezaAuth.isAuthenticated()) {
                alert("Please sign in to place an order.");
                window.location.href = 'login.html?redirect=shop.html';
                return;
            }

            // Save payment preference if needed
            const paymentMode = document.querySelector('input[name="payment-mode"]:checked')?.value;
            if (paymentMode) {
                localStorage.setItem('peza_payment_mode', paymentMode);
            }
            window.location.href = 'checkout.html';
        });
    }
});
