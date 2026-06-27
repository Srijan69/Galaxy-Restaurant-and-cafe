/* ============================================
   GALAXY CAFÉ & RESTAURANT - MAIN JAVASCRIPT
   Real Razorpay Payment | QR Scanner | Admin
   ============================================ */

// ============================================
// MENU DATA - Authentic South Indian Items
// ============================================
const menuItems = [
    { id: 1, name: "Idli Sambar", category: "breakfast", price: 80, rating: 4.8, desc: "Soft steamed rice cakes served with aromatic sambar and coconut chutney", badge: "Popular" },
    { id: 2, name: "Masala Dosa", category: "breakfast", price: 120, rating: 4.9, desc: "Crispy rice crepe filled with spiced potato masala", badge: "Chef's Pick" },
    { id: 3, name: "Medu Vada", category: "breakfast", price: 70, rating: 4.7, desc: "Crispy lentil doughnuts served with sambar and chutney", badge: "" },
    { id: 4, name: "Pongal", category: "breakfast", price: 90, rating: 4.6, desc: "Creamy rice and lentil dish tempered with ghee and spices", badge: "Seasonal" },
    { id: 5, name: "Upma", category: "breakfast", price: 60, rating: 4.5, desc: "Savory semolina dish with vegetables and cashews", badge: "" },
    { id: 6, name: "Hyderabadi Biryani", category: "main", price: 280, rating: 5.0, desc: "Aromatic basmati rice cooked with tender meat and royal spices", badge: "Signature" },
    { id: 7, name: "Chettinad Chicken", category: "main", price: 320, rating: 4.9, desc: "Fiery chicken curry from Chettinad with freshly ground spices", badge: "Spicy" },
    { id: 8, name: "Meen Kuzhambu", category: "main", price: 350, rating: 4.8, desc: "Traditional Tamil fish curry in tamarind gravy", badge: "" },
    { id: 9, name: "Veg Meals", category: "main", price: 180, rating: 4.7, desc: "Complete South Indian meal with rice, sambar, rasam, and sides", badge: "Best Value" },
    { id: 10, name: "Mutton Chukka", category: "main", price: 380, rating: 4.9, desc: "Dry mutton fry with pepper and aromatic spices", badge: "Premium" },
    { id: 11, name: "Payasam", category: "dessert", price: 90, rating: 4.8, desc: "Creamy rice pudding with cardamom and nuts", badge: "Classic" },
    { id: 12, name: "Gulab Jamun", category: "dessert", price: 80, rating: 4.7, desc: "Soft milk dumplings soaked in fragrant sugar syrup", badge: "" },
    { id: 13, name: "Jigarthanda", category: "beverage", price: 120, rating: 4.9, desc: "Madurai's famous cooling drink with milk, almond, and ice cream", badge: "Must Try" },
    { id: 14, name: "Filter Coffee", category: "beverage", price: 50, rating: 4.8, desc: "Authentic South Indian filter coffee with frothy milk", badge: "Popular" },
    { id: 15, name: "Tender Coconut", category: "beverage", price: 70, rating: 4.6, desc: "Fresh tender coconut water, nature's energy drink", badge: "Healthy" },
    { id: 16, name: "Mysore Pak", category: "dessert", price: 100, rating: 4.8, desc: "Rich ghee-based sweet from the royal kitchens of Mysore", badge: "Royal" },
    { id: 17, name: "Prawn Fry", category: "main", price: 400, rating: 4.9, desc: "Crispy fried prawns with coastal spices", badge: "Seafood" },
    { id: 18, name: "Appam with Stew", category: "main", price: 200, rating: 4.7, desc: "Lacy rice pancakes with coconut milk vegetable stew", badge: "Kerala Special" }
];

// ============================================
// STATE MANAGEMENT
// ============================================
let cart = [];
let currentFilter = 'all';
let qrScanner = null;
let adminLoggedIn = false;
let adminUser = null;

// Demo data for admin
const orders = [
    { id: 'ORD001', customer: 'Rahul Sharma', items: 'Hyderabadi Biryani x2', total: 560, status: 'completed', date: '2026-06-20', time: '19:30' },
    { id: 'ORD002', customer: 'Priya Patel', items: 'Masala Dosa x1, Filter Coffee x2', total: 220, status: 'confirmed', date: '2026-06-21', time: '08:15' },
    { id: 'ORD003', customer: 'Arun Kumar', items: 'Veg Meals x4', total: 720, status: 'pending', date: '2026-06-21', time: '12:45' },
    { id: 'ORD004', customer: 'Lakshmi Devi', items: 'Chettinad Chicken x1, Jigarthanda x2', total: 560, status: 'completed', date: '2026-06-19', time: '20:00' },
    { id: 'ORD005', customer: 'Venkatesh Rao', items: 'Mutton Chukka x2, Payasam x2', total: 940, status: 'confirmed', date: '2026-06-21', time: '14:20' }
];

const reservations = [
    { id: 'RES001', name: 'Rajesh Gupta', phone: '9876543210', date: '2026-06-22', time: '19:00', guests: 4, occasion: 'Anniversary', status: 'confirmed' },
    { id: 'RES002', name: 'Sunita Reddy', phone: '9876543211', date: '2026-06-23', time: '12:30', guests: 6, occasion: 'Family', status: 'pending' },
    { id: 'RES003', name: 'Karthik Iyer', phone: '9876543212', date: '2026-06-21', time: '20:00', guests: 2, occasion: 'Birthday', status: 'confirmed' }
];

const staff = [
    { id: 'STF001', name: 'Chef Anand', role: 'Head Chef', status: 'active', lastLogin: '2026-06-21 06:00', lastLogout: '2026-06-20 23:00' },
    { id: 'STF002', name: 'Manager Ravi', role: 'Restaurant Manager', status: 'active', lastLogin: '2026-06-21 08:00', lastLogout: '-' },
    { id: 'STF003', name: 'Waiter Suresh', role: 'Senior Waiter', status: 'offline', lastLogin: '2026-06-20 10:00', lastLogout: '2026-06-20 22:00' },
    { id: 'STF004', name: 'Chef Priya', role: 'Pastry Chef', status: 'active', lastLogin: '2026-06-21 07:00', lastLogout: '-' }
];

const feedbacks = [
    { id: 'FB001', customer: 'Rahul Sharma', rating: 5, text: 'Amazing biryani! Best in Hyderabad!', date: '2026-06-20' },
    { id: 'FB002', customer: 'Priya Patel', rating: 4, text: 'Great dosa, coffee was perfect.', date: '2026-06-21' },
    { id: 'FB003', customer: 'Anonymous', rating: 5, text: 'The ambiance is world class. Loved it!', date: '2026-06-19' }
];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Hide loader
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 2000);

    // Render menu
    renderMenu();

    // Setup event listeners
    setupEventListeners();

    // Setup navbar scroll
    setupNavbar();

    // Setup QR Scanner
    setupQRScanner();

    // Setup menu filters
    setupMenuFilters();

    // Check for payment callback
    checkPaymentCallback();

    // Auto feedback after 2 minutes (simulating after eating)
    setTimeout(() => {
        if (cart.length > 0) {
            showFeedbackModal();
        }
    }, 120000);
});

// ============================================
// NAVBAR
// ============================================
function setupNavbar() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('active');
}

// ============================================
// MENU RENDERING
// ============================================
function renderMenu() {
    const grid = document.getElementById('menuGrid');
    const filtered = currentFilter === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === currentFilter);

    grid.innerHTML = filtered.map(item => `
        <div class="menu-item" data-category="${item.category}">
            <div class="menu-item-image">
                <i class="fas fa-utensils"></i>
                ${item.badge ? `<span class="menu-item-badge">${item.badge}</span>` : ''}
            </div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <span class="menu-item-price">₹${item.price}</span>
                </div>
                <p class="menu-item-desc">${item.desc}</p>
                <div class="menu-item-footer">
                    <div class="menu-item-rating">
                        ${Array(5).fill(0).map((_, i) => 
                            `<i class="fas fa-star${i < Math.floor(item.rating) ? '' : '-half-alt'}"></i>`
                        ).join('')}
                        <span style="margin-left:5px;color:var(--text-muted);font-size:0.8rem">${item.rating}</span>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})" title="Add to cart">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupMenuFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderMenu();
        });
    });
}

// ============================================
// CART FUNCTIONALITY
// ============================================
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const existing = cart.find(c => c.id === itemId);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1 });
    }

    updateCartUI();
    showToast(`${item.name} added to cart!`);
}

function removeFromCart(itemId) {
    cart = cart.filter(c => c.id !== itemId);
    updateCartUI();
    updateOrderBox();
}

function updateQty(itemId, change) {
    const item = cart.find(c => c.id === itemId);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(itemId);
            return;
        }
    }
    updateCartUI();
    updateOrderBox();
}

function updateCartUI() {
    // Update cart count
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelector('.cart-count').textContent = count;

    // Update cart sidebar
    const cartItems = document.getElementById('cartItems');
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <i class="fas fa-utensils"></i>
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} x ${item.qty}</p>
                </div>
                <div class="cart-item-actions">
                    <span class="cart-item-price">₹${item.price * item.qty}</span>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('cartTotal').textContent = '₹' + total;

    // Update order box
    updateOrderBox();
}

function updateOrderBox() {
    const orderItems = document.getElementById('orderItems');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    if (cart.length === 0) {
        orderItems.innerHTML = '<p class="empty-order">Your cart is empty. Add items from the menu.</p>';
    } else {
        orderItems.innerHTML = cart.map(item => `
            <div class="order-item">
                <div class="order-item-info">
                    <h4>${item.name}</h4>
                    <span>₹${item.price} each</span>
                </div>
                <div class="order-item-qty">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span style="color:var(--white);font-weight:600;">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
                <span class="order-item-price">₹${item.price * item.qty}</span>
            </div>
        `).join('');
    }

    document.getElementById('subtotal').textContent = '₹' + subtotal;
    document.getElementById('tax').textContent = '₹' + tax;
    document.getElementById('total').textContent = '₹' + total;
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
}

function scrollToOrder() {
    toggleCart();
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// RAZORPAY PAYMENT INTEGRATION
// --------------------------------------------
// SECURITY — READ BEFORE EDITING:
//   • RAZORPAY_KEY_ID below is the *publishable* Key ID. It is SAFE to expose
//     in frontend code — Razorpay Checkout requires it in the browser.
//   • The Razorpay *Key Secret* must NEVER appear in this file or any frontend
//     code. It belongs only on your server, in an environment variable.
//   • Three things MUST move to a backend for a real, secure system:
//       1. Order creation  -> Razorpay Orders API (uses Key Secret)
//       2. Signature verify -> HMAC-SHA256 of "order_id|payment_id" (Key Secret)
//       3. Payment capture/confirmation before fulfilling the order
//   The functions below SIMULATE 1 & 2 on the client so the UI works end-to-end,
//   and each is annotated with the exact backend call that should replace it.
// ============================================

// Publishable Key ID — get it from: Razorpay Dashboard → Settings → API Keys.
const RAZORPAY_KEY_ID = 'rzp_test_T4ZdK9ULPeTEp3';

// Payment flow states give a CLEAR separation between the phases the user sees:
//   initiated  -> we are creating the order
//   pending    -> Razorpay checkout is open / user is paying
//   verifying  -> payment captured, confirming signature
//   verified   -> verified success (ONLY now do we show the success modal)
//   failed     -> payment failed or was dismissed
let paymentState = 'idle';

// Single source of truth for the money math (was duplicated in many places).
function getOrderTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    return { subtotal, tax, total: subtotal + tax };
}

// Renders one consistent status message and keeps the Pay button in step with
// the current phase. Disabled while a payment is in flight; re-enabled otherwise.
function setPaymentStatus(state, message) {
    paymentState = state;
    const colors = {
        initiated: 'var(--gold)',
        pending:   'var(--gold)',
        verifying: 'var(--warning)',
        verified:  'var(--success)',
        failed:    'var(--danger)',
        idle:      'var(--text-muted)'
    };
    const icons = {
        initiated: 'fas fa-spinner fa-spin',
        pending:   'fas fa-circle-notch fa-spin',
        verifying: 'fas fa-shield-alt',
        verified:  'fas fa-check-circle',
        failed:    'fas fa-times-circle',
        idle:      'fas fa-info-circle'
    };
    const statusDiv = document.getElementById('paymentStatus');
    statusDiv.innerHTML = message
        ? `<p style="color:${colors[state]}"><i class="${icons[state]}"></i> ${message}</p>`
        : '';
    // Lock the button only while the payment is actively in progress.
    const inFlight = ['initiated', 'pending', 'verifying'].includes(state);
    document.getElementById('payBtn').disabled = inFlight;
}

// STEP 1 — CREATE ORDER (SIMULATED).
// In production this MUST be a backend call, e.g.:
//   const res = await fetch('/api/create-order', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ amount: amountInPaise, currency: 'INR' })
//   });
//   return await res.json(); // { id: 'order_XXXX', amount, currency }
// The server uses the Razorpay Orders API with the Key Secret and returns the
// real order_id. Here we fabricate one so the UI flow is complete offline.
function createRazorpayOrder(amountInPaise) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 'order_SIM' + Date.now(),   // simulated server-issued order_id
                amount: amountInPaise,
                currency: 'INR'
            });
        }, 600); // mimic network latency so "Initiated" state is visible
    });
}

// STEP 3 — VERIFY PAYMENT (SIMULATED SIGNATURE CHECK).
// Razorpay's handler gives us razorpay_payment_id, razorpay_order_id and
// razorpay_signature. The signature MUST be verified ON THE SERVER:
//   const expected = crypto
//       .createHmac('sha256', RAZORPAY_KEY_SECRET)            // secret stays server-side
//       .update(order_id + '|' + payment_id)
//       .digest('hex');
//   const valid = expected === razorpay_signature;            // constant-time compare ideally
// Only a server can do this safely because it needs the Key Secret. Here we
// just confirm the expected fields are present and treat that as "verified".
function verifyPayment(response, order, total) {
    setPaymentStatus('verifying', 'Verifying payment...');

    return new Promise((resolve) => {
        setTimeout(() => {
            // SIMULATED check — real verification is the HMAC compare shown above,
            // performed on your backend at e.g. POST /api/verify-payment.
            const looksValid = !!(response && response.razorpay_payment_id);
            resolve(looksValid);
        }, 700);
    });
}

async function initiatePayment() {
    if (cart.length === 0) {
        showToast('Please add items to your cart first!');
        return;
    }
    // Avoid double-submits while a payment is already in flight.
    if (['initiated', 'pending', 'verifying'].includes(paymentState)) return;

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    if (paymentMethod === 'cod') {
        processCOD();
        return;
    }

    if (typeof Razorpay === 'undefined') {
        setPaymentStatus('failed', 'Payment library failed to load. Check your internet connection.');
        return;
    }

    const { total } = getOrderTotals();

    // PHASE: INITIATED — creating the order on the (simulated) server.
    setPaymentStatus('initiated', 'Creating secure order...');
    try {
        const order = await createRazorpayOrder(total * 100); // Razorpay uses paise
        openRazorpayCheckout(order, total);
    } catch (err) {
        setPaymentStatus('failed', 'Could not start payment. Please try again.');
    }
}

function openRazorpayCheckout(order, total) {
    // Amount is in paise (smallest currency unit).
    const options = {
        key: RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: 'INR',
        name: 'Galaxy Cafe & Restaurant',
        description: 'Order ' + order.id,
        order_id: order.id, // server-issued in production; simulated here
        handler: function (response) {
            // Fires ONLY after the user actually completes payment.
            // PHASE: PENDING -> VERIFYING -> VERIFIED.
            setPaymentStatus('pending', 'Payment received, confirming...');
            verifyPayment(response, order, total).then((valid) => {
                if (valid) {
                    finalizeOrder({
                        id: order.id,
                        customer: 'Walk-in Customer',
                        items: cart.map(i => i.name + ' x' + i.qty).join(', '),
                        total: total,
                        status: 'confirmed',
                        date: new Date().toISOString().split('T')[0],
                        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        paymentId: response.razorpay_payment_id,
                        paymentMethod: 'Razorpay'
                    });
                } else {
                    // Verification failed — do NOT show success, do NOT clear cart.
                    setPaymentStatus('failed', 'We could not verify your payment. If money was deducted, it will be auto-refunded.');
                }
            });
        },
        prefill: { name: '', email: '', contact: '' },
        notes: { orderId: order.id },
        theme: { color: '#C9A962' },
        modal: {
            ondismiss: function () {
                // User closed the popup without finishing.
                setPaymentStatus('failed', 'Payment not completed. If you already paid, it will reflect shortly — do not pay again.');
            }
        }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
        const reason = (response && response.error && response.error.description) ? response.error.description : 'Payment failed';
        setPaymentStatus('failed', reason + '. Please try again.');
    });

    // PHASE: PENDING — checkout is open and waiting on the user.
    setPaymentStatus('pending', 'Waiting for payment...');
    rzp.open();
}

// Single place that records a VERIFIED order, clears the cart, and shows the
// success modal. Called by both Razorpay (after verification) and COD.
function finalizeOrder(orderRecord) {
    orders.unshift(orderRecord);

    sendAdminNotification(
        'New Order',
        `Order ${orderRecord.id} - ₹${orderRecord.total} (${orderRecord.paymentMethod})`
    );

    // Clear the cart only after the order is safely recorded.
    cart = [];
    updateCartUI();

    setPaymentStatus('verified', 'Payment verified successfully!');
    showToast('Order confirmed!');

    // Show the success modal ONLY now (verified / placed).
    document.getElementById('successOrderId').textContent = orderRecord.id;
    document.getElementById('paymentSuccessModal').classList.add('active');

    // Reset to idle so the next order starts clean.
    paymentState = 'idle';

    // Invite feedback shortly after.
    setTimeout(() => showFeedbackModal(), 3000);
}

// Cash on Delivery — no online payment, so the order is "pending" until paid
// at delivery. Single definition (the old duplicate has been removed).
function processCOD() {
    if (cart.length === 0) {
        showToast('Please add items to your cart first!');
        return;
    }

    const { total } = getOrderTotals();
    finalizeOrder({
        id: 'GAL' + Date.now(),
        customer: 'Walk-in Customer',
        items: cart.map(i => i.name + ' x' + i.qty).join(', '),
        total: total,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        paymentMethod: 'COD'
    });
    showToast('Order placed! Pay cash on delivery.');
}

function addHandiToCart(id, price, name) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            qty: 1,
            category: 'handi',
            image: 'fas fa-users'
        });
    }
    updateCartUI();
    showToast(name + ' added to cart!');
    toggleCart();
}

function closePaymentSuccess() {
    document.getElementById('paymentSuccessModal').classList.remove('active');
}

function checkPaymentCallback() {
    // Check URL params for Razorpay callback
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('razorpay_payment_id');
    const orderId = urlParams.get('order_id');

    if (paymentId && orderId) {
        showToast('Payment completed! Welcome back to Galaxy Café.');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function sendAdminNotification(title, message) {
    // In production, this would send to backend/websocket
    console.log('[ADMIN NOTIFICATION]', title, message);
    // Store in localStorage for demo
    const notifications = JSON.parse(localStorage.getItem('gc_notifications') || '[]');
    notifications.push({
        title,
        message,
        time: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('gc_notifications', JSON.stringify(notifications));
}

// ============================================
// QR SCANNER
// ============================================
function setupQRScanner() {
    const qrReader = document.getElementById('qr-reader');
    if (!qrReader) return;

    // Check if html5-qrcode is available
    if (typeof Html5Qrcode !== 'undefined') {
        try {
            qrScanner = new Html5Qrcode('qr-reader');

            Html5Qrcode.getCameras().then(cameras => {
                if (cameras && cameras.length) {
                    const cameraId = cameras[0].id;
                    qrScanner.start(
                        cameraId,
                        { fps: 10, qrbox: { width: 200, height: 200 } },
                        (decodedText) => {
                            handleQRScan(decodedText);
                        },
                        (errorMessage) => {
                            // QR scan error - ignore continuous errors
                        }
                    ).catch(err => {
                        console.log('QR Scanner error:', err);
                        showQRPlaceholder();
                    });
                } else {
                    showQRPlaceholder();
                }
            }).catch(err => {
                console.log('Camera access error:', err);
                showQRPlaceholder();
            });
        } catch (e) {
            showQRPlaceholder();
        }
    } else {
        showQRPlaceholder();
    }
}

function showQRPlaceholder() {
    const qrReader = document.getElementById('qr-reader');
    qrReader.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
            <i class="fas fa-qrcode" style="font-size:3rem;color:var(--gold);opacity:0.5;margin-bottom:15px;"></i>
            <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:15px;">Camera access required for QR scanning</p>
            <button onclick="simulateQRScan()" style="padding:10px 20px;background:var(--gold);color:var(--black);border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                <i class="fas fa-camera"></i> Simulate Scan
            </button>
        </div>
    `;
}

function simulateQRScan() {
    handleQRScan('TABLE-05');
}

function handleQRScan(data) {
    showToast(`QR Scanned: ${data}. Table assigned!`);
    // In production, this would fetch table-specific menu/deals
}

// ============================================
// FEEDBACK SYSTEM
// ============================================
function showFeedbackModal() {
    document.getElementById('feedbackModal').classList.add('active');
}

function closeFeedback() {
    document.getElementById('feedbackModal').classList.remove('active');
}

function setupEventListeners() {
    // Feedback form
    document.getElementById('feedbackForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const rating = document.querySelector('input[name="rating"]:checked');
        const text = document.getElementById('feedbackText').value;

        if (!rating) {
            showToast('Please select a rating!');
            return;
        }

        const feedback = {
            id: 'FB' + Date.now(),
            customer: 'Guest',
            rating: parseInt(rating.value),
            text: text || 'No comments',
            date: new Date().toISOString().split('T')[0]
        };
        feedbacks.unshift(feedback);

        closeFeedback();
        showToast('Thank you for your feedback!');

        // Reset form
        document.querySelector('input[name="rating"]:checked').checked = false;
        document.getElementById('feedbackText').value = '';
    });

    // Reservation form
    document.getElementById('reservationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const resData = {
            id: 'RES' + Date.now(),
            name: document.getElementById('resName').value,
            phone: document.getElementById('resPhone').value,
            date: document.getElementById('resDate').value,
            time: document.getElementById('resTime').value,
            guests: document.getElementById('resGuests').value,
            occasion: document.getElementById('resOccasion').value || 'Regular',
            status: 'pending'
        };
        reservations.unshift(resData);
        sendAdminNotification('New Reservation', `${resData.name} - ${resData.guests} guests on ${resData.date}`);
        showToast('Reservation request submitted! We will confirm shortly.');
        this.reset();
    });

    // Admin login
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUser').value;
        const password = document.getElementById('adminPass').value;

        if ((username === 'admin' && password === 'admin123') || 
            (username === 'manager' && password === 'manager123') ||
            (username === 'chef' && password === 'chef123')) {
            adminLoggedIn = true;
            adminUser = username;
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'flex';
            document.getElementById('adminName').textContent = username.charAt(0).toUpperCase() + username.slice(1);
            showAdminTab('orders');
            showToast('Welcome back, ' + username + '!');

            // Log login
            logStaffActivity(username, 'login');
        } else {
            showToast('Invalid credentials!');
        }
    });

    // Newsletter
    document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('Subscribed to newsletter!');
        this.reset();
    });
}

// ============================================
// ADMIN PANEL
// ============================================
function showAdminTab(tab) {
    const content = document.getElementById('adminContent');
    const title = document.getElementById('adminTitle');

    document.querySelectorAll('.admin-nav-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.admin-nav-item').classList.add('active');

    switch(tab) {
        case 'orders':
            title.textContent = 'Orders Management';
            renderOrders(content);
            break;
        case 'reservations':
            title.textContent = 'Reservations';
            renderReservations(content);
            break;
        case 'menu-edit':
            title.textContent = 'Edit Menu';
            renderMenuEdit(content);
            break;
        case 'staff':
            title.textContent = 'Staff Management';
            renderStaff(content);
            break;
        case 'analytics':
            title.textContent = 'Analytics Dashboard';
            renderAnalytics(content);
            break;
        case 'feedback':
            title.textContent = 'Customer Feedback';
            renderFeedback(content);
            break;
    }
}

function renderOrders(container) {
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-shopping-bag"></i></div>
                <div class="stat-card-value">${orders.length}</div>
                <div class="stat-card-label">Total Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-rupee-sign"></i></div>
                <div class="stat-card-value">₹${orders.reduce((s, o) => s + o.total, 0)}</div>
                <div class="stat-card-label">Revenue</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-card-value">${orders.filter(o => o.status === 'pending').length}</div>
                <div class="stat-card-label">Pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-card-value">${orders.filter(o => o.status === 'completed').length}</div>
                <div class="stat-card-label">Completed</div>
            </div>
        </div>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date/Time</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td style="color:var(--gold);font-weight:600;">${order.id}</td>
                        <td>${order.customer}</td>
                        <td>${order.items}</td>
                        <td style="color:var(--gold);font-weight:600;">₹${order.total}</td>
                        <td>${order.date}<br><small>${order.time}</small></td>
                        <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                        <td>
                            <button onclick="updateOrderStatus('${order.id}')" style="background:var(--gold);color:var(--black);border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;">
                                Update
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderReservations(container) {
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-calendar-check"></i></div>
                <div class="stat-card-value">${reservations.length}</div>
                <div class="stat-card-label">Total Reservations</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-users"></i></div>
                <div class="stat-card-value">${reservations.reduce((s, r) => s + parseInt(r.guests), 0)}</div>
                <div class="stat-card-label">Total Guests</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-card-value">${reservations.filter(r => r.status === 'pending').length}</div>
                <div class="stat-card-label">Pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-glass-cheers"></i></div>
                <div class="stat-card-value">${reservations.filter(r => r.occasion !== 'Regular').length}</div>
                <div class="stat-card-label">Special Events</div>
            </div>
        </div>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Date/Time</th>
                    <th>Guests</th>
                    <th>Occasion</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${reservations.map(res => `
                    <tr>
                        <td style="color:var(--gold);">${res.id}</td>
                        <td>${res.name}</td>
                        <td>${res.phone}</td>
                        <td>${res.date}<br><small>${res.time}</small></td>
                        <td>${res.guests}</td>
                        <td>${res.occasion}</td>
                        <td><span class="status-badge status-${res.status}">${res.status}</span></td>
                        <td>
                            <button onclick="updateResStatus('${res.id}')" style="background:var(--gold);color:var(--black);border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;">
                                Update
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderMenuEdit(container) {
    container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="color:var(--white);">Menu Items</h3>
            <button onclick="addNewItem()" style="background:var(--gold);color:var(--black);border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;">
                <i class="fas fa-plus"></i> Add Item
            </button>
        </div>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${menuItems.map(item => `
                    <tr>
                        <td>${item.id}</td>
                        <td style="color:var(--white);font-weight:600;">${item.name}</td>
                        <td><span class="status-badge status-confirmed">${item.category}</span></td>
                        <td style="color:var(--gold);font-weight:600;">₹${item.price}</td>
                        <td>${item.rating} <i class="fas fa-star" style="color:var(--gold);font-size:0.7rem;"></i></td>
                        <td>
                            <button onclick="editItem(${item.id})" style="background:var(--success);color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-right:5px;font-size:0.8rem;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteItem(${item.id})" style="background:var(--danger);color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:0.8rem;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderStaff(container) {
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-users"></i></div>
                <div class="stat-card-value">${staff.length}</div>
                <div class="stat-card-label">Total Staff</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-user-check"></i></div>
                <div class="stat-card-value">${staff.filter(s => s.status === 'active').length}</div>
                <div class="stat-card-label">Active Now</div>
            </div>
        </div>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Last Logout</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${staff.map(s => `
                    <tr>
                        <td style="color:var(--gold);">${s.id}</td>
                        <td style="color:var(--white);font-weight:600;">${s.name}</td>
                        <td>${s.role}</td>
                        <td><span class="status-badge status-${s.status === 'active' ? 'confirmed' : 'cancelled'}">${s.status}</span></td>
                        <td>${s.lastLogin}</td>
                        <td>${s.lastLogout}</td>
                        <td>
                            <button onclick="toggleStaffStatus('${s.id}')" style="background:var(--gold);color:var(--black);border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;">
                                Toggle
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderAnalytics(container) {
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const avgOrder = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-card-value">₹${totalRevenue}</div>
                <div class="stat-card-label">Total Revenue</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-receipt"></i></div>
                <div class="stat-card-value">${orders.length}</div>
                <div class="stat-card-label">Total Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-calculator"></i></div>
                <div class="stat-card-value">₹${avgOrder}</div>
                <div class="stat-card-label">Avg Order Value</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-smile"></i></div>
                <div class="stat-card-value">${feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : '0'}</div>
                <div class="stat-card-label">Avg Rating</div>
            </div>
        </div>
        <div style="background:var(--black-light);padding:30px;border-radius:16px;margin-top:20px;border:1px solid var(--black-lighter);">
            <h3 style="color:var(--white);margin-bottom:20px;">Popular Items</h3>
            <div style="display:flex;flex-direction:column;gap:15px;">
                ${menuItems.sort((a, b) => b.rating - a.rating).slice(0, 5).map((item, i) => `
                    <div style="display:flex;align-items:center;gap:15px;">
                        <span style="color:var(--gold);font-weight:700;width:25px;">${i + 1}</span>
                        <div style="flex:1;">
                            <div style="color:var(--white);font-weight:600;">${item.name}</div>
                            <div style="color:var(--text-muted);font-size:0.8rem;">${item.category}</div>
                        </div>
                        <div style="color:var(--gold);font-weight:700;">★ ${item.rating}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderFeedback(container) {
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-comments"></i></div>
                <div class="stat-card-value">${feedbacks.length}</div>
                <div class="stat-card-label">Total Reviews</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-star"></i></div>
                <div class="stat-card-value">${feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : '0'}</div>
                <div class="stat-card-label">Average Rating</div>
            </div>
        </div>
        <div style="margin-top:20px;display:flex;flex-direction:column;gap:15px;">
            ${feedbacks.map(fb => `
                <div style="background:var(--black-light);padding:20px;border-radius:12px;border:1px solid var(--black-lighter);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <span style="color:var(--white);font-weight:600;">${fb.customer}</span>
                        <span style="color:var(--text-muted);font-size:0.8rem;">${fb.date}</span>
                    </div>
                    <div style="color:var(--gold);margin-bottom:10px;">
                        ${Array(5).fill(0).map((_, i) => `<i class="fas fa-star${i < fb.rating ? '' : ' text-muted'}"></i>`).join('')}
                    </div>
                    <p style="color:var(--text-muted);font-size:0.9rem;">${fb.text}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Admin Actions
function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        const currentIndex = statuses.indexOf(order.status);
        order.status = statuses[(currentIndex + 1) % statuses.length];
        showToast(`Order ${orderId} status updated to ${order.status}`);
        renderOrders(document.getElementById('adminContent'));
    }
}

function updateResStatus(resId) {
    const res = reservations.find(r => r.id === resId);
    if (res) {
        const statuses = ['pending', 'confirmed', 'cancelled'];
        const currentIndex = statuses.indexOf(res.status);
        res.status = statuses[(currentIndex + 1) % statuses.length];
        showToast(`Reservation ${resId} updated to ${res.status}`);
        renderReservations(document.getElementById('adminContent'));
    }
}

function toggleStaffStatus(staffId) {
    const s = staff.find(s => s.id === staffId);
    if (s) {
        s.status = s.status === 'active' ? 'offline' : 'active';
        if (s.status === 'active') {
            s.lastLogin = new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            logStaffActivity(s.name, 'login');
        } else {
            s.lastLogout = new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            logStaffActivity(s.name, 'logout');
        }
        showToast(`${s.name} is now ${s.status}`);
        renderStaff(document.getElementById('adminContent'));
    }
}

function editItem(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
        const newPrice = prompt('Enter new price for ' + item.name + ':', item.price);
        if (newPrice && !isNaN(newPrice)) {
            item.price = parseInt(newPrice);
            showToast(`${item.name} price updated to ₹${item.price}`);
            renderMenuEdit(document.getElementById('adminContent'));
            renderMenu();
        }
    }
}

function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        const index = menuItems.findIndex(i => i.id === itemId);
        if (index > -1) {
            menuItems.splice(index, 1);
            showToast('Item deleted successfully');
            renderMenuEdit(document.getElementById('adminContent'));
            renderMenu();
        }
    }
}

function addNewItem() {
    const name = prompt('Enter item name:');
    if (!name) return;
    const price = prompt('Enter price:');
    if (!price || isNaN(price)) return;
    const category = prompt('Enter category (breakfast/main/dessert/beverage):', 'main');

    const newItem = {
        id: Math.max(...menuItems.map(i => i.id)) + 1,
        name,
        category: category || 'main',
        price: parseInt(price),
        rating: 4.5,
        desc: 'New menu item',
        badge: 'New'
    };
    menuItems.push(newItem);
    showToast(`${name} added to menu!`);
    renderMenuEdit(document.getElementById('adminContent'));
    renderMenu();
}

function logStaffActivity(name, action) {
    const logs = JSON.parse(localStorage.getItem('gc_staff_logs') || '[]');
    logs.push({
        name,
        action,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('gc_staff_logs', JSON.stringify(logs));
}

function adminLogout() {
    if (adminUser) {
        logStaffActivity(adminUser, 'logout');
    }
    adminLoggedIn = false;
    adminUser = null;
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminLoginForm').reset();
    showToast('Logged out successfully');
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ============================================
// 3D TILT EFFECT (Simple implementation)
// ============================================
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        } else {
            card.style.transform = '';
        }
    });
});

// --- Smooth scrolling for all anchor links ---
// Smooth scrolling for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
            }
        }
    });
});

