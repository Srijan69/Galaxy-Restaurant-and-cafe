// ============================================
// GALAXY CAFE - MAIN APPLICATION SCRIPT
// --------------------------------------------
// Extracted from inline <script> in index.html on 2026-07-01
// so a strict Content-Security-Policy can enforce script-src 'self'
// without needing 'unsafe-inline'. Behavior identical to the previous
// inline blocks — do not add features here; edit the module files.
// ============================================

/* ============================================
   GALAXY CAFÉ & RESTAURANT - MAIN JAVASCRIPT
   Handi Booking | Reservations | Admin
   ============================================ */

// ============================================
// SECURITY: HTML-escape any value before it is interpolated into an
// innerHTML template. User-controlled fields (reservation/feedback/inbox
// text) would otherwise execute as markup in the admin's browser (stored XSS).
// ============================================
function esc(value) {
    return String(value === null || value === undefined ? '' : value)
        .replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
}

// ============================================
// MENU DATA - Authentic South Indian Items
// ============================================
const DISH = "Galaxy%20Cafe%20Dishes/";
const DISH2 = "Galaxy%20Cafe%20Dishes/Galaxy%20Cafe%20And%20Resturent_/";
const menuItems = [
    // ---------- SOUPS ----------
    { id: 1, name: "Veg Hot & Sour Soup", category: "soup", price: 119, rating: 4.6, veg: true, desc: "Spicy and tangy soup loaded with crunchy vegetables", badge: "", image: "" },
    { id: 2, name: "Veg Corn Soup", category: "soup", price: 119, rating: 4.5, veg: true, desc: "Creamy sweet corn soup with finely chopped veggies", badge: "", image: "" },
    { id: 3, name: "Veg Clear Soup", category: "soup", price: 119, rating: 4.4, veg: true, desc: "Light, clear broth with garden-fresh vegetables", badge: "", image: "" },
    { id: 4, name: "Lemon Coriander Soup", category: "soup", price: 119, rating: 4.6, veg: true, desc: "Refreshing soup with zesty lemon and fresh coriander", badge: "", image: "" },
    { id: 5, name: "Veg Manchow Soup", category: "soup", price: 119, rating: 4.7, veg: true, desc: "Indo-Chinese favourite topped with crispy fried noodles", badge: "Popular", image: "" },
    { id: 6, name: "Mint Ginger Soup", category: "soup", price: 119, rating: 4.5, veg: true, desc: "Soothing soup with fresh mint and a ginger kick", badge: "", image: "" },
    { id: 7, name: "Chicken Corn Soup", category: "soup", price: 159, rating: 4.7, veg: false, desc: "Velvety sweet corn soup with shredded chicken", badge: "", image: "" },
    { id: 8, name: "Chicken Hot & Sour Soup", category: "soup", price: 159, rating: 4.7, veg: false, desc: "Bold hot and sour broth with tender chicken", badge: "", image: "" },
    { id: 9, name: "Chicken Clear Soup", category: "soup", price: 159, rating: 4.5, veg: false, desc: "Clear, aromatic chicken broth, light and warming", badge: "", image: "" },
    { id: 10, name: "Chicken Manchow Soup", category: "soup", price: 159, rating: 4.6, veg: false, desc: "Spicy chicken Manchow soup with crispy noodles", badge: "", image: "" },

    // ---------- VEG STARTERS ----------
    { id: 11, name: "Veg Manchuria", category: "veg-starter", price: 249, rating: 4.7, veg: true, desc: "Fried veg dumplings tossed in tangy Manchurian sauce", badge: "Popular", image: DISH2 + "Veg%20Manchurian_.jpg" },
    { id: 12, name: "Panner 65 / Manchuria", category: "veg-starter", price: 259, rating: 4.8, veg: true, desc: "Crispy cottage cheese in spicy 65 or Manchurian style", badge: "Bestseller", image: DISH + "23.png" },
    { id: 13, name: "Veg Spring Rolls", category: "veg-starter", price: 259, rating: 4.6, veg: true, desc: "Golden rolls stuffed with seasoned vegetables", badge: "", image: "" },
    { id: 14, name: "Gobi 65 / Manchuria", category: "veg-starter", price: 249, rating: 4.6, veg: true, desc: "Cauliflower florets in fiery 65 or Manchurian glaze", badge: "", image: "" },
    { id: 15, name: "Panner Majestic", category: "veg-starter", price: 269, rating: 4.7, veg: true, desc: "Royal paneer starter with a rich, spicy coating", badge: "", image: "" },
    { id: 16, name: "Panner Chilly", category: "veg-starter", price: 269, rating: 4.7, veg: true, desc: "Paneer cubes tossed with peppers in chilli sauce", badge: "", image: DISH2 + "Chilli%20Paneer.jpg" },
    { id: 17, name: "Mushroom 65", category: "veg-starter", price: 259, rating: 4.5, veg: true, desc: "Spicy deep-fried mushrooms, South-Indian style", badge: "", image: "" },
    { id: 18, name: "Mushroom Chilly", category: "veg-starter", price: 259, rating: 4.5, veg: true, desc: "Mushrooms wok-tossed with onions and chilli sauce", badge: "", image: "" },
    { id: 19, name: "Baby Corn 65 / Manchuri", category: "veg-starter", price: 259, rating: 4.5, veg: true, desc: "Crunchy baby corn in spicy 65 or Manchurian sauce", badge: "", image: "" },

    // ---------- NON VEG STARTERS ----------
    { id: 20, name: "Chilli Chicken", category: "nonveg-starter", price: 309, rating: 4.9, veg: false, desc: "Classic Indo-Chinese chicken tossed in chilli sauce", badge: "Bestseller", image: DISH + "5.png" },
    { id: 21, name: "Chicken 65 / Manchuria", category: "nonveg-starter", price: 309, rating: 4.9, veg: false, desc: "Iconic spicy fried chicken, 65 or Manchurian style", badge: "Popular", image: DISH + "2.png" },
    { id: 22, name: "Pepper Chicken", category: "nonveg-starter", price: 339, rating: 4.7, veg: false, desc: "Chicken dry-fried with crushed black pepper", badge: "Spicy", image: "" },
    { id: 23, name: "Chicken Majestic", category: "nonveg-starter", price: 339, rating: 4.8, veg: false, desc: "Hyderabadi-style boneless chicken with curry leaves", badge: "", image: "" },
    { id: 24, name: "Chicken 555", category: "nonveg-starter", price: 339, rating: 4.7, veg: false, desc: "House-special spicy chicken starter", badge: "", image: "" },
    { id: 25, name: "Chicken Drumsticks", category: "nonveg-starter", price: 339, rating: 4.7, veg: false, desc: "Juicy marinated drumsticks, crisp and flavourful", badge: "", image: "" },
    { id: 26, name: "Apollo Chicken", category: "nonveg-starter", price: 339, rating: 4.7, veg: false, desc: "Tangy, spicy boneless chicken Apollo style", badge: "", image: "" },
    { id: 27, name: "Ginger Chicken", category: "nonveg-starter", price: 309, rating: 4.6, veg: false, desc: "Chicken wok-tossed with fresh ginger and spices", badge: "", image: "" },
    { id: 28, name: "Cream Of Fried Chicken", category: "nonveg-starter", price: 359, rating: 4.7, veg: false, desc: "Crispy fried chicken in a creamy spiced glaze", badge: "", image: "" },
    { id: 29, name: "Chicken Lollipop", category: "nonveg-starter", price: 359, rating: 4.8, veg: false, desc: "Frenched chicken wings in a fiery marinade", badge: "Popular", image: "" },
    { id: 30, name: "Apollo Fish", category: "nonveg-starter", price: 389, rating: 4.7, veg: false, desc: "Tangy spiced fish fillets, Apollo style", badge: "", image: "" },
    { id: 31, name: "Fish 555", category: "nonveg-starter", price: 389, rating: 4.6, veg: false, desc: "House-special spicy fish starter", badge: "", image: "" },
    { id: 32, name: "Chilli Fish / Prawns", category: "nonveg-starter", price: 389, rating: 4.7, veg: false, desc: "Fish or prawns tossed in chilli sauce with peppers", badge: "", image: "" },
    { id: 33, name: "Fish 65 / Manchuria", category: "nonveg-starter", price: 389, rating: 4.6, veg: false, desc: "Crispy fish in spicy 65 or Manchurian sauce", badge: "", image: "" },
    { id: 34, name: "Schezwan Fish / Prawns", category: "nonveg-starter", price: 389, rating: 4.7, veg: false, desc: "Fiery Schezwan-tossed fish or prawns", badge: "Spicy", image: "" },
    { id: 35, name: "Loose Prawns", category: "nonveg-starter", price: 389, rating: 4.7, veg: false, desc: "Spiced shallow-fried prawns, coastal style", badge: "", image: "" },

    // ---------- VEG TANDOORI ----------
    { id: 36, name: "Panner Tikka", category: "veg-tandoori", price: 309, rating: 4.8, veg: true, desc: "Char-grilled paneer marinated in tandoori spices", badge: "Popular", image: "" },
    { id: 37, name: "Panner Harabara Tikka", category: "veg-tandoori", price: 309, rating: 4.6, veg: true, desc: "Paneer in a green mint-coriander tandoori marinade", badge: "", image: "" },
    { id: 38, name: "Panner Malai Tikka", category: "veg-tandoori", price: 309, rating: 4.7, veg: true, desc: "Creamy, mildly spiced char-grilled paneer", badge: "", image: "" },

    // ---------- NON VEG TANDOORI ----------
    { id: 39, name: "Tandoori Chicken", category: "nonveg-tandoori", price: 429, rating: 4.9, veg: false, desc: "Classic clay-oven chicken (half ₹239 / full ₹429)", badge: "Signature", image: "" },
    { id: 40, name: "Tangdi Kebab", category: "nonveg-tandoori", price: 429, rating: 4.7, veg: false, desc: "Tandoori chicken legs marinated in spices (half ₹239)", badge: "", image: "" },
    { id: 41, name: "Chicken Tikka", category: "nonveg-tandoori", price: 399, rating: 4.8, veg: false, desc: "Boneless chicken char-grilled in tandoori masala", badge: "Popular", image: "" },
    { id: 42, name: "Murg Malai Kebab", category: "nonveg-tandoori", price: 399, rating: 4.7, veg: false, desc: "Creamy, melt-in-mouth grilled chicken kebab", badge: "", image: "" },
    { id: 43, name: "Chicken Hargoli Kebab", category: "nonveg-tandoori", price: 399, rating: 4.6, veg: false, desc: "Richly spiced chargrilled chicken kebab", badge: "", image: "" },
    { id: 44, name: "Chicken Reshmi Kebab", category: "nonveg-tandoori", price: 399, rating: 4.7, veg: false, desc: "Silky-soft chicken kebab in a mild marinade", badge: "", image: "" },
    { id: 45, name: "Grilled Chicken", category: "nonveg-tandoori", price: 429, rating: 4.7, veg: false, desc: "Whole grilled chicken with house spices (half ₹239)", badge: "", image: "" },

    // ---------- TANDOORI SPECIALS ----------
    { id: 46, name: "Arabian Kebab", category: "tandoori-special", price: 399, rating: 4.7, veg: false, desc: "Middle-Eastern style spiced grilled chicken", badge: "", image: "" },
    { id: 47, name: "Chicken Lajawab", category: "tandoori-special", price: 479, rating: 4.8, veg: false, desc: "Signature tandoori chicken delicacy (half ₹249)", badge: "Chef's Special", image: "" },
    { id: 48, name: "Tandoori Mantosh", category: "tandoori-special", price: 479, rating: 4.7, veg: false, desc: "Rich, smoky tandoori specialty (half ₹249)", badge: "", image: "" },
    { id: 49, name: "Badami Tandoori", category: "tandoori-special", price: 479, rating: 4.7, veg: false, desc: "Almond-marinated tandoori chicken (half ₹249)", badge: "", image: "" },

    // ---------- VEG CURRIES ----------
    { id: 50, name: "Dal Fry / Dal Tadka", category: "veg-curry", price: 199, rating: 4.6, veg: true, desc: "Yellow lentils tempered with ghee and spices", badge: "", image: "" },
    { id: 51, name: "Aloo Gobi Masala", category: "veg-curry", price: 249, rating: 4.5, veg: true, desc: "Potato and cauliflower in a spiced onion-tomato gravy", badge: "", image: "" },
    { id: 52, name: "Mixed Veg Curry", category: "veg-curry", price: 249, rating: 4.5, veg: true, desc: "Seasonal vegetables simmered in a rich masala", badge: "", image: "" },
    { id: 53, name: "Kadai Veg", category: "veg-curry", price: 249, rating: 4.6, veg: true, desc: "Vegetables cooked kadai-style with bell peppers", badge: "", image: "" },
    { id: 54, name: "Veg Chat-Pot", category: "veg-curry", price: 249, rating: 4.5, veg: true, desc: "House-special medley of veggies in spicy gravy", badge: "", image: "" },
    { id: 55, name: "Mushroom Masala", category: "veg-curry", price: 289, rating: 4.6, veg: true, desc: "Button mushrooms in a thick onion-tomato masala", badge: "", image: "" },
    { id: 56, name: "Palak Panner", category: "veg-curry", price: 289, rating: 4.7, veg: true, desc: "Cottage cheese in a creamy spinach gravy", badge: "Popular", image: "" },
    { id: 57, name: "Panner Butter Masala", category: "veg-curry", price: 289, rating: 4.8, veg: true, desc: "Paneer in a velvety buttery tomato gravy", badge: "Bestseller", image: "" },
    { id: 58, name: "Kadai Panner", category: "veg-curry", price: 289, rating: 4.7, veg: true, desc: "Paneer with peppers in spicy kadai masala", badge: "", image: "" },
    { id: 59, name: "Panner Chat-Pot", category: "veg-curry", price: 289, rating: 4.6, veg: true, desc: "Special paneer curry in a tangy spiced gravy", badge: "", image: "" },
    { id: 60, name: "Kaju Panner Masala", category: "veg-curry", price: 299, rating: 4.7, veg: true, desc: "Paneer and cashews in a rich creamy masala", badge: "", image: "" },
    { id: 61, name: "Kaju Masala", category: "veg-curry", price: 299, rating: 4.6, veg: true, desc: "Cashews simmered in a luscious spiced gravy", badge: "", image: "" },
    { id: 62, name: "Panner Tikka Masala", category: "veg-curry", price: 279, rating: 4.7, veg: true, desc: "Grilled paneer tikka in a smoky tomato gravy", badge: "", image: "" },

    // ---------- EGG CURRIES ----------
    { id: 63, name: "Egg Masala", category: "egg-curry", price: 199, rating: 4.6, veg: false, desc: "Boiled eggs in a spicy onion-tomato masala", badge: "", image: "" },
    { id: 64, name: "Egg Bhurji", category: "egg-curry", price: 199, rating: 4.6, veg: false, desc: "Spiced scrambled eggs with onions and chillies", badge: "", image: "" },
    { id: 65, name: "Egg Curry", category: "egg-curry", price: 199, rating: 4.5, veg: false, desc: "Homestyle boiled-egg curry in a flavourful gravy", badge: "", image: "" },

    // ---------- NON VEG CURRIES ----------
    { id: 66, name: "Chicken Masala", category: "nonveg-curry", price: 319, rating: 4.8, veg: false, desc: "Classic chicken curry in a rich spiced gravy", badge: "Popular", image: DISH + "29.png" },
    { id: 67, name: "Methi Chicken", category: "nonveg-curry", price: 319, rating: 4.6, veg: false, desc: "Chicken cooked with aromatic fenugreek leaves", badge: "", image: "" },
    { id: 68, name: "Dum Ka Chicken", category: "nonveg-curry", price: 319, rating: 4.7, veg: false, desc: "Slow-cooked Hyderabadi dum-style chicken", badge: "", image: "" },
    { id: 69, name: "Kadai Chicken", category: "nonveg-curry", price: 339, rating: 4.7, veg: false, desc: "Chicken with peppers in a spicy kadai masala", badge: "", image: "" },
    { id: 70, name: "Butter Chicken B/L", category: "nonveg-curry", price: 339, rating: 4.9, veg: false, desc: "Boneless chicken in a buttery tomato gravy", badge: "Bestseller", image: "" },
    { id: 71, name: "Telangana Chicken", category: "nonveg-curry", price: 339, rating: 4.7, veg: false, desc: "Fiery Telangana-style country chicken curry", badge: "Spicy", image: "" },
    { id: 72, name: "Andhra Chicken", category: "nonveg-curry", price: 319, rating: 4.7, veg: false, desc: "Spicy Andhra-style chicken with bold flavours", badge: "Spicy", image: "" },
    { id: 73, name: "Pujabi Chicken", category: "nonveg-curry", price: 359, rating: 4.7, veg: false, desc: "Robust Punjabi-style chicken curry", badge: "", image: "" },
    { id: 74, name: "Chicken Afghani", category: "nonveg-curry", price: 339, rating: 4.7, veg: false, desc: "Mild, creamy Afghani-style chicken", badge: "", image: "" },
    { id: 75, name: "Chicken Moghalai", category: "nonveg-curry", price: 339, rating: 4.7, veg: false, desc: "Royal Mughlai chicken in a rich nutty gravy", badge: "", image: "" },

    // ---------- INDIAN BREADS ----------
    { id: 76, name: "Tandoori Roti", category: "bread", price: 29, rating: 4.5, veg: true, desc: "Whole-wheat flatbread fresh from the tandoor", badge: "", image: "" },
    { id: 77, name: "Butter Roti", category: "bread", price: 39, rating: 4.6, veg: true, desc: "Soft tandoori roti brushed with butter", badge: "", image: "" },
    { id: 78, name: "Rumali Roti", category: "bread", price: 29, rating: 4.5, veg: true, desc: "Paper-thin handkerchief-style soft bread", badge: "", image: "" },
    { id: 79, name: "Plain Naan", category: "bread", price: 35, rating: 4.5, veg: true, desc: "Classic leavened flatbread from the tandoor", badge: "", image: "" },
    { id: 80, name: "Butter Naan", category: "bread", price: 39, rating: 4.7, veg: true, desc: "Soft naan generously brushed with butter", badge: "Popular", image: "" },
    { id: 81, name: "Garlic Naan", category: "bread", price: 49, rating: 4.7, veg: true, desc: "Naan topped with garlic and fresh coriander", badge: "", image: "" },
    { id: 82, name: "Tandoori Paratha", category: "bread", price: 49, rating: 4.5, veg: true, desc: "Flaky layered paratha baked in the tandoor", badge: "", image: "" },
    { id: 83, name: "Pudina Paratha", category: "bread", price: 49, rating: 4.5, veg: true, desc: "Layered paratha flavoured with mint", badge: "", image: "" },
    { id: 84, name: "Aloo Paratha", category: "bread", price: 69, rating: 4.6, veg: true, desc: "Stuffed potato paratha, hearty and spiced", badge: "", image: "" },
    { id: 85, name: "Masala Kulcha", category: "bread", price: 79, rating: 4.6, veg: true, desc: "Soft kulcha stuffed with spiced filling", badge: "", image: "" },
    { id: 86, name: "Panner Kulcha", category: "bread", price: 99, rating: 4.6, veg: true, desc: "Kulcha stuffed with spiced cottage cheese", badge: "", image: "" },

    // ---------- BIRYANI ----------
    { id: 87, name: "Veg Dum Biryani", category: "biryani", price: 309, rating: 4.7, veg: true, desc: "Fragrant basmati dum-cooked with vegetables", badge: "Popular", image: DISH + "25.png" },
    { id: 88, name: "Mushroom Biryani", category: "biryani", price: 339, rating: 4.6, veg: true, desc: "Aromatic biryani layered with spiced mushrooms", badge: "", image: DISH2 + "Mushroom%20Biryani_.jpg" },
    { id: 89, name: "Panner Biryani", category: "biryani", price: 339, rating: 4.6, veg: true, desc: "Basmati rice cooked with paneer and spices", badge: "", image: DISH2 + "Paneer%20Biryani.jpg" },
    { id: 90, name: "Kaju Panner Biryani", category: "biryani", price: 349, rating: 4.7, veg: true, desc: "Rich biryani with cashews and cottage cheese", badge: "", image: DISH + "14.png" },
    { id: 91, name: "Egg Biryani", category: "biryani", price: 299, rating: 4.6, veg: false, desc: "Spiced basmati biryani with boiled eggs", badge: "", image: DISH + "18.png" },

    // ---------- NON VEG BIRYANI ----------
    { id: 92, name: "Chicken Biryani", category: "nonveg-biryani", price: 359, rating: 5.0, veg: false, desc: "Signature dum biryani with tender chicken (single ₹199)", badge: "Signature", image: DISH + "3.png" },
    { id: 93, name: "Chicken 65 Biryani", category: "nonveg-biryani", price: 399, rating: 4.8, veg: false, desc: "Biryani crowned with spicy chicken 65", badge: "Popular", image: DISH + "1.png" },
    { id: 94, name: "Tandoori / Tangdi Biryani", category: "nonveg-biryani", price: 409, rating: 4.7, veg: false, desc: "Biryani topped with smoky tandoori chicken", badge: "", image: "" },
    { id: 95, name: "Mutton Biryani", category: "nonveg-biryani", price: 399, rating: 4.9, veg: false, desc: "Slow-cooked dum biryani with tender mutton (single ₹229)", badge: "Premium", image: "" },
    { id: 96, name: "Mutton Double Gosh", category: "nonveg-biryani", price: 579, rating: 4.8, veg: false, desc: "Loaded biryani with a double portion of mutton", badge: "", image: "" },
    { id: 97, name: "Nalli Gosh Biryani", category: "nonveg-biryani", price: 529, rating: 4.8, veg: false, desc: "Rich biryani with succulent mutton shanks (single ₹279)", badge: "", image: DISH + "16.png" },
    { id: 98, name: "Kheema Biryani", category: "nonveg-biryani", price: 499, rating: 4.7, veg: false, desc: "Biryani layered with spiced minced meat", badge: "", image: DISH + "13.png" },
    { id: 99, name: "Fish Biryani", category: "nonveg-biryani", price: 419, rating: 4.7, veg: false, desc: "Coastal-style biryani with spiced fish", badge: "", image: DISH + "8.png" },
    { id: 100, name: "Prawns Biryani", category: "nonveg-biryani", price: 419, rating: 4.7, veg: false, desc: "Fragrant biryani with juicy spiced prawns", badge: "", image: DISH + "24.png" },
    { id: 101, name: "Loli Pop Biryani", category: "nonveg-biryani", price: 399, rating: 4.6, veg: false, desc: "Biryani served with crispy chicken lollipops", badge: "", image: "" },

    // ---------- CHINESE MAIN COURSE ----------
    { id: 102, name: "Veg Fried Rice / Noodles", category: "chinese", price: 189, rating: 4.6, veg: true, desc: "Wok-tossed rice or noodles with crisp vegetables", badge: "Popular", image: DISH + "26.png" },
    { id: 103, name: "Mushroom Fried Rice / Noodles", category: "chinese", price: 199, rating: 4.6, veg: true, desc: "Rice or noodles tossed with spiced mushrooms", badge: "", image: DISH + "19.png" },
    { id: 104, name: "Corn Fried Rice / Noodles", category: "chinese", price: 199, rating: 4.5, veg: true, desc: "Sweet corn fried rice or noodles, wok-tossed", badge: "", image: DISH + "7.png" },
    { id: 105, name: "Manchuria Fried Rice", category: "chinese", price: 199, rating: 4.6, veg: true, desc: "Fried rice topped with veg Manchurian", badge: "", image: DISH + "10.png" },
    { id: 106, name: "Veg Schezwan Fried Rice", category: "chinese", price: 209, rating: 4.7, veg: true, desc: "Fiery Schezwan-tossed vegetable fried rice", badge: "Spicy", image: DISH + "28.png" },
    { id: 107, name: "Egg Fried Rice / Noodles", category: "chinese", price: 199, rating: 4.6, veg: false, desc: "Rice or noodles wok-tossed with egg", badge: "", image: DISH + "9.png" },
    { id: 108, name: "Chicken Fried Rice / Noodles", category: "chinese", price: 229, rating: 4.8, veg: false, desc: "Rice or noodles tossed with chicken and veggies", badge: "Bestseller", image: DISH + "4.png" },
    { id: 109, name: "Mixed Non Veg Fried Rice / Noodles", category: "chinese", price: 299, rating: 4.7, veg: false, desc: "Loaded with chicken, egg and prawns", badge: "", image: DISH + "6.png" },
    { id: 110, name: "Mixed Veg Fried / Noodles", category: "chinese", price: 229, rating: 4.6, veg: true, desc: "Hearty mix of vegetables in rice or noodles", badge: "", image: DISH + "15.png" },
    { id: 111, name: "Curd Rice", category: "chinese", price: 149, rating: 4.5, veg: true, desc: "Cooling tempered curd rice, comfort in a bowl", badge: "", image: "" },

    // ---------- EXTRAS ----------
    { id: 112, name: "Plain Curd", category: "extras", price: 50, rating: 4.4, veg: true, desc: "A bowl of fresh, thick curd", badge: "", image: "" },
    { id: 113, name: "Onion", category: "extras", price: 20, rating: 4.3, veg: true, desc: "Sliced onions with lemon", badge: "", image: "" },
    { id: 114, name: "Masala Gravy", category: "extras", price: 20, rating: 4.4, veg: true, desc: "Extra serving of spiced masala gravy", badge: "", image: "" },
    { id: 115, name: "Raitha", category: "extras", price: 20, rating: 4.4, veg: true, desc: "Cooling yogurt with onions and spices", badge: "", image: "" }
];

// ============================================
// STATE MANAGEMENT
// ============================================
let currentFilter = 'all';
let adminLoggedIn = false;
let adminUser = null;

// ============================================
// SUPABASE-BACKED STATE
// These caches are filled from Supabase on load and refreshed after each write.
// (Previously: reservations came from localStorage, feedbacks were seed data.)
// ============================================
let reservations = [];
let feedbacks = [];
let orders = [];

// Legacy localStorage fallback kept only so older bookings still appear if
// Supabase is briefly unreachable. New writes go to Supabase.
const GC_RESERVATIONS_KEY = 'gc_reservations';
function loadReservations() {
    try { return JSON.parse(localStorage.getItem(GC_RESERVATIONS_KEY) || '[]'); }
    catch (e) { return []; }
}
function saveReservations() {
    localStorage.setItem(GC_RESERVATIONS_KEY, JSON.stringify(reservations));
}

// ============================================
// SUPABASE DATA HELPERS
// Each returns data normalized to the shape the render functions already expect.
// ============================================
function sbReady() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        console.error('[Supabase] client not available. Check supabase-config.js and the CDN <script> order.');
        return false;
    }
    return true;
}

// Runs once on load: a cheap query that proves URL + key + RLS are working.
async function testSupabaseConnection() {
    if (!sbReady()) { showToast('⚠️ Supabase not configured'); return false; }
    const { error } = await supabaseClient
        .from('reservations').select('id', { count: 'exact', head: true });
    if (error) {
        console.error('[Supabase] connection test failed:', error);
        showToast('⚠️ Supabase error: ' + error.message);
        return false;
    }
    showToast('✅ Connected to Supabase');
    return true;
}

// ---- RESERVATIONS ----
async function fetchReservations() {
    if (!sbReady()) return reservations;
    const { data, error } = await supabaseClient
        .from('reservations').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); showToast('Could not load reservations'); return reservations; }
    reservations = data.map(r => ({
        id: r.id, name: r.name, phone: r.phone, email: r.email,
        date: r.date, time: r.time, guests: r.guests,
        occasion: r.occasion || 'Regular', handiType: r.handi_type,
        address: r.address, status: r.status
    }));
    return reservations;
}

async function createReservation(payload) {
    if (!sbReady()) return null;
    const { data, error } = await supabaseClient
        .from('reservations').insert([{
            name: payload.name, phone: payload.phone, email: payload.email,
            date: payload.date, time: payload.time, guests: payload.guests,
            occasion: payload.occasion, handi_type: payload.handiType,
            address: payload.address, status: 'pending'
        }]).select().single();
    if (error) { console.error(error); showToast('Reservation failed: ' + error.message); return null; }
    return data;
}

async function updateReservationStatusDb(id, status) {
    if (!sbReady()) return null;
    const { error } = await supabaseClient.from('reservations').update({ status }).eq('id', id);
    if (error) { console.error(error); showToast('Update failed: ' + error.message); return null; }
    return true;
}

// ---- FEEDBACKS ----
async function fetchFeedbacks() {
    if (!sbReady()) return feedbacks;
    const { data, error } = await supabaseClient
        .from('feedbacks').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); showToast('Could not load feedback'); return feedbacks; }
    feedbacks = data.map(f => ({
        id: f.id, customer: f.customer, phone: f.phone, rating: f.rating,
        text: f.text, date: (f.created_at || '').split('T')[0]
    }));
    return feedbacks;
}

async function createFeedback(payload) {
    if (!sbReady()) return null;
    const { data, error } = await supabaseClient
        .from('feedbacks').insert([{
            customer: payload.customer, phone: payload.phone,
            rating: payload.rating, text: payload.text
        }]).select().single();
    if (error) { console.error(error); showToast('Could not submit feedback: ' + error.message); return null; }
    return data;
}

// ---- ORDERS (helpers ready for the cart/checkout flow) ----
async function fetchOrders() {
    if (!sbReady()) return orders;
    const { data, error } = await supabaseClient
        .from('orders').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); showToast('Could not load orders'); return orders; }
    orders = data.map(o => ({
        id: o.id, customer: o.customer, items: o.items, total: Number(o.total),
        status: o.status, paymentMethod: o.payment_method, paymentId: o.payment_id,
        date: (o.created_at || '').split('T')[0],
        time: new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }));
    return orders;
}

async function createOrder(payload) {
    if (!sbReady()) return null;
    const { data, error } = await supabaseClient
        .from('orders').insert([{
            customer: payload.customer, items: payload.items, total: payload.total,
            status: payload.status, payment_method: payload.paymentMethod,
            payment_id: payload.paymentId || null
        }]).select().single();
    if (error) { console.error(error); showToast('Could not save order: ' + error.message); return null; }
    return data;
}

async function updateOrderStatusDb(id, status) {
    if (!sbReady()) return null;
    const { error } = await supabaseClient.from('orders').update({ status }).eq('id', id);
    if (error) { console.error(error); showToast('Update failed: ' + error.message); return null; }
    return true;
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Apply any admin-uploaded menu images, then render menu
    applyMenuImageOverrides();
    renderMenu();

    // Setup event listeners
    setupEventListeners();

    // Setup customer auth (login state, forms, header chip)
    setupAuth();

    // Reconcile the Supabase session, wire auth-state changes, and handle
    // password-recovery deep links (#reset-password from the email).
    initSupabaseAuth();

    // Setup navbar scroll
    setupNavbar();

    // Apply any admin price/rating overrides, then render Handi plans (chicken by default)
    applyHandiOverrides();
    initHandi();

    // Setup menu filters
    setupMenuFilters();

    // Open admin panel if the URL points to the admin route
    checkAdminRoute();

    // Verify Supabase connection, then warm the data caches (non-blocking).
    testSupabaseConnection().then(ok => {
        if (ok) {
            Promise.all([fetchReservations(), fetchFeedbacks(), fetchOrders()])
                .catch(err => console.error('Initial Supabase load failed:', err));
        }
    });
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

    const catLabel = {
        soup: 'Soup', 'veg-starter': 'Veg Starter', 'nonveg-starter': 'Non-Veg Starter',
        'veg-tandoori': 'Veg Tandoori', 'nonveg-tandoori': 'Non-Veg Tandoori',
        'tandoori-special': 'Tandoori Special', 'veg-curry': 'Veg Curry',
        'egg-curry': 'Egg Curry', 'nonveg-curry': 'Non-Veg Curry', bread: 'Indian Bread',
        biryani: 'Biryani', 'nonveg-biryani': 'Non-Veg Biryani', chinese: 'Chinese', extras: 'Extras'
    };

    grid.innerHTML = filtered.map(item => `
        <div class="menu-item" data-category="${esc(item.category)}">
            <div class="menu-item-image">
                <span class="img-fallback"><i class="fas fa-utensils"></i></span>
                ${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy"
                     onerror="this.style.display='none'">` : ''}
                ${item.badge ? `<span class="menu-item-badge">${esc(item.badge)}</span>` : ''}
            </div>
            <div class="menu-item-content">
                <div class="menu-item-meta">
                    <span class="diet-dot ${item.veg ? '' : 'non-veg'}" title="${item.veg ? 'Vegetarian' : 'Non-Vegetarian'}"></span>
                    <span class="menu-item-category">${esc(catLabel[item.category] || item.category)}</span>
                </div>
                <div class="menu-item-header">
                    <h3 class="menu-item-title">${esc(item.name)}</h3>
                    <span class="menu-item-price">₹${esc(item.price)}</span>
                </div>
                <p class="menu-item-desc">${esc(item.desc)}</p>
                <div class="menu-item-footer">
                    <div class="menu-item-rating">
                        ${Array(5).fill(0).map((_, i) =>
                            `<i class="fas fa-star${i < Math.floor(item.rating) ? '' : '-half-alt'}"></i>`
                        ).join('')}
                        <span style="margin-left:5px;color:var(--text-muted);font-size:0.8rem">${esc(item.rating)}</span>
                    </div>
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
// CUSTOMER AUTH (Login / Signup / Forgot) — REAL Supabase Auth
// --------------------------------------------
// Authentication is handled by Supabase Auth (signUp / signInWithPassword /
// resetPasswordForEmail / updateUser). Passwords are NEVER stored in the browser.
//
// 'gc_current_user' is only a lightweight UI MIRROR ({ name, phone, email }) so
// the rest of the app (header chip, inbox matching, reservation gate) can read
// the active user synchronously. It is populated/cleared from the live Supabase
// session and reconciled on load + on every auth-state change.
//
// 'gc_phone_email' maps a phone number -> email on THIS device so users who
// signed up here can still log in by phone (Supabase authenticates by email).
// ============================================
const GC_SESSION_KEY = 'gc_current_user';
const GC_PHONE_MAP_KEY = 'gc_phone_email';

// Optional callback to run once the user successfully logs in (e.g. resume payment).
let pendingAfterLogin = null;

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(GC_SESSION_KEY) || 'null'); }
    catch (e) { return null; }
}
function setCurrentUser(user) {
    if (user) localStorage.setItem(GC_SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(GC_SESSION_KEY);
}
function isLoggedIn() {
    return !!getCurrentUser();
}

// Build a clean UI-mirror object from a Supabase auth user.
function uiUserFromSupabase(sbUser) {
    if (!sbUser) return null;
    const meta = sbUser.user_metadata || {};
    return {
        id: sbUser.id,
        email: (sbUser.email || meta.email || '').toLowerCase(),
        name: meta.name || meta.full_name || (sbUser.email ? sbUser.email.split('@')[0] : 'Guest'),
        phone: meta.phone || ''
    };
}

// Remember phone -> email on this device so phone login works for local signups.
function rememberPhoneEmail(phone, email) {
    if (!phone || !email) return;
    try {
        const map = JSON.parse(localStorage.getItem(GC_PHONE_MAP_KEY) || '{}');
        map[phone.trim()] = email.trim().toLowerCase();
        localStorage.setItem(GC_PHONE_MAP_KEY, JSON.stringify(map));
    } catch (e) { /* non-fatal */ }
}
function emailForPhone(phone) {
    try {
        const map = JSON.parse(localStorage.getItem(GC_PHONE_MAP_KEY) || '{}');
        return map[(phone || '').trim()] || '';
    } catch (e) { return ''; }
}
function looksLikeEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// --- Modal open/close + form switching ---
function openAuthModal(form) {
    clearAuthMessages();
    switchAuthForm(form || 'login');
    document.getElementById('authModal').classList.add('active');
}
function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    pendingAfterLogin = null;
}
function switchAuthForm(form) {
    clearAuthMessages();
    const titles = {
        login:  ['Welcome Back', 'Login to continue with your order'],
        signup: ['Create Account', 'Join Galaxy Café for faster checkout'],
        forgot: ['Reset Password', 'We will send you a reset link'],
        reset:  ['Set New Password', 'Enter and confirm your new password']
    };
    document.getElementById('authTitle').textContent = titles[form][0];
    document.getElementById('authSubtitle').textContent = titles[form][1];

    // Tabs are only relevant for login/signup.
    document.getElementById('authTabs').style.display = (form === 'forgot' || form === 'reset') ? 'none' : 'flex';
    document.querySelectorAll('.auth-tab').forEach(t =>
        t.classList.toggle('active', t.dataset.form === form));

    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    const map = { login: 'loginForm', signup: 'signupForm', forgot: 'forgotForm', reset: 'resetForm' };
    document.getElementById(map[form]).classList.add('active');
}

function showAuthError(msg) {
    const box = document.getElementById('authError');
    document.getElementById('authErrorText').textContent = msg;
    box.classList.add('active');
    document.getElementById('authSuccess').classList.remove('active');
}
function showAuthSuccess(msg) {
    const box = document.getElementById('authSuccess');
    document.getElementById('authSuccessText').textContent = msg;
    box.classList.add('active');
    document.getElementById('authError').classList.remove('active');
}
function clearAuthMessages() {
    document.getElementById('authError').classList.remove('active');
    document.getElementById('authSuccess').classList.remove('active');
}

// --- Signup (real Supabase Auth account) ---
async function handleSignup(e) {
    e.preventDefault();
    clearAuthMessages();

    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    if (!name || !phone || !email || !password) {
        return showAuthError('Please fill in all fields.');
    }
    if (!looksLikeEmail(email)) {
        return showAuthError('Please enter a valid email address.');
    }
    if (password.length < 6) {
        return showAuthError('Password must be at least 6 characters.');
    }
    if (password !== confirm) {
        return showAuthError('Passwords do not match.');
    }
    if (!sbReady()) {
        return showAuthError('Service unavailable right now. Please try again later.');
    }

    const btn = document.querySelector('#signupForm button[type="submit"]');
    const btnHTML = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<span>Creating…</span><i class="fas fa-spinner fa-spin"></i>'; }

    console.log('[Auth] Signing up:', email);

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { name: name, phone: phone },
                emailRedirectTo: window.location.origin
            }
        });

        if (error) {
            console.error('[Auth] signUp error:', error.status, error.message);
            if (/already registered|already exists|User already/i.test(error.message || '')) {
                showAuthError('An account with this email already exists. Please log in.');
            } else if ((error.status || 0) === 422) {
                showAuthError('Password is too weak. Use at least 6 characters.');
            } else {
                showAuthError(error.message || 'Could not create account. Please try again.');
            }
            return;
        }

        // Remember phone->email on this device so phone login works later.
        rememberPhoneEmail(phone, email);

        // If email confirmation is ON, Supabase returns no active session yet.
        if (!data.session) {
            console.log('[Auth] Signup needs email confirmation — no session returned.');
            showAuthSuccess('✅ Account created! Check your email (' + email + ') to confirm, then log in.');
            document.getElementById('signupForm').reset();
            setTimeout(function () { switchAuthForm('login'); }, 3000);
            return;
        }

        // Confirmation OFF -> session is live, auto sign the user in.
        console.log('[Auth] Signup complete with active session — auto login.');
        const uiUser = uiUserFromSupabase(data.user) || { name: name, phone: phone, email: email };
        if (!uiUser.phone) uiUser.phone = phone;
        completeLogin(uiUser, 'Account created. Welcome, ' + name.split(' ')[0] + '!');
        document.getElementById('signupForm').reset();
    } catch (err) {
        console.error('[Auth] signUp failed:', err);
        showAuthError('Network error. Please check your connection and try again.');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
    }
}

// --- Login (admin shortcut, then real Supabase Auth by email/phone) ---
async function handleLogin(e) {
    e.preventDefault();
    clearAuthMessages();

    const rawId = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!rawId || !password) {
        return showAuthError('Please enter your credentials.');
    }

    // ADMIN LOGIN via the same header form — an admin email + password signs
    // in through Supabase Auth. Requires user_metadata.role === 'admin', which
    // is set in the Supabase Dashboard. Non-admins fall through to the normal
    // customer login path below.
    if (looksLikeEmail(rawId) && await loginAdminFromHeader(rawId, password)) {
        document.getElementById('loginForm').reset();
        return;
    }

    // Supabase authenticates by EMAIL. Accept an email directly, or resolve a
    // phone number to its email via the on-device map built at signup.
    let email = rawId.toLowerCase();
    if (!looksLikeEmail(email)) {
        const mapped = emailForPhone(rawId);
        if (mapped) {
            email = mapped;
        } else {
            return showAuthError('Please log in with the email address you signed up with.');
        }
    }
    if (!sbReady()) {
        return showAuthError('Service unavailable right now. Please try again later.');
    }

    const btn = document.querySelector('#loginForm button[type="submit"]');
    const btnHTML = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<span>Logging in…</span><i class="fas fa-spinner fa-spin"></i>'; }

    console.log('[Auth] Logging in:', email);

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('[Auth] signIn error:', error.status, error.message);
            if (/email not confirmed/i.test(error.message || '')) {
                showAuthError('Please confirm your email first. Check your inbox for the link.');
            } else if (/invalid login credentials/i.test(error.message || '')) {
                showAuthError('Incorrect email or password. Please try again.');
            } else if ((error.status || 0) === 429) {
                showAuthError('Too many attempts. Please wait a minute and try again.');
            } else {
                showAuthError(error.message || 'Could not log in. Please try again.');
            }
            return;
        }

        const uiUser = uiUserFromSupabase(data.user);
        // Keep the phone map fresh for this device.
        if (uiUser && uiUser.phone) rememberPhoneEmail(uiUser.phone, uiUser.email);
        completeLogin(uiUser, 'Welcome back, ' + (uiUser ? uiUser.name.split(' ')[0] : 'friend') + '!');
        document.getElementById('loginForm').reset();
    } catch (err) {
        console.error('[Auth] signIn failed:', err);
        showAuthError('Network error. Please check your connection and try again.');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
    }
}

// SECURITY: Admin authority lives ENTIRELY on the server. The client only
// caches a session flag for UI toggling; every privileged read/write is gated
// by Supabase RLS policies that check auth.jwt() -> user_metadata -> role.
// Flipping `adminLoggedIn = true` in DevTools opens an empty dashboard because
// PostgREST refuses the requests without an admin JWT.
//
// Provisioning an admin user (one-time, in Supabase Dashboard):
//   1. Auth -> Users -> "Add user" -> create with real email + strong password.
//   2. Open the user, edit "User Metadata" (raw JSON) -> add: { "role": "admin" }
//   3. Save. That email can now log in through the Admin Portal form.
async function isCurrentUserAdmin() {
    if (!sbReady()) return false;
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const role = user && user.user_metadata && user.user_metadata.role;
        return role === 'admin';
    } catch (e) {
        return false;
    }
}

// Kept for header-form compatibility. Delegates to Supabase Auth + admin claim.
// Returns true only on a real, verified admin session.
async function loginAdminFromHeader(emailOrId, password) {
    if (!sbReady() || !looksLikeEmail(emailOrId)) return false;
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: emailOrId.toLowerCase(),
        password: password
    });
    if (error || !data || !data.user) return false;
    const role = data.user.user_metadata && data.user.user_metadata.role;
    if (role !== 'admin') {
        // Not an admin — sign the session back out so no elevated session lingers.
        try { await supabaseClient.auth.signOut(); } catch (_) {}
        return false;
    }
    adminLoggedIn = true;
    adminUser = data.user.email;
    closeAuthModal();
    openAdminPanel();
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    document.getElementById('adminName').textContent = (data.user.email.split('@')[0] || 'admin');
    showAdminTab('reservations');
    showToast('Welcome back, admin!');
    logStaffActivity(data.user.email, 'login');
    return true;
}

// Shared success path for login + signup.
function completeLogin(user, toastMsg) {
    setCurrentUser(user);
    renderAuthState();
    showToast(toastMsg);

    // Pull this user's booking notices from Supabase so the inbox badge is live,
    // then keep polling so notices arrive on this device without a reload.
    refreshInbox();
    startInboxPolling();

    const resume = pendingAfterLogin;
    pendingAfterLogin = null;
    closeAuthModal();

    // Resume any action that required login (e.g. payment).
    if (typeof resume === 'function') setTimeout(resume, 250);
}

// --- Forgot password (real reset via Supabase Auth) ---
async function forgotPassword(e) {
    e.preventDefault();
    clearAuthMessages();

    const emailEl = document.getElementById('forgotEmail');
    const email = (emailEl ? emailEl.value : '').trim().toLowerCase();

    // Validate the email before we make any network call.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showAuthError('Please enter a valid email address.');
    }
    if (!sbReady()) {
        return showAuthError('Service unavailable right now. Please try again later.');
    }

    // Loading state on the submit button.
    const btn = document.getElementById('forgotSubmitBtn');
    const btnHTML = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>Sending…</span><i class="fas fa-spinner fa-spin"></i>';
    }

    const redirectTo = window.location.origin + '/#reset-password';
    console.log('[Auth] Sending password reset for:', email, '-> redirectTo:', redirectTo);

    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo
        });
        if (error) {
            console.error('[Auth] resetPasswordForEmail error:', error.status, error.message);
            const status = error.status || 0;
            if (status === 429) {
                showAuthError('Too many requests. Please wait a minute and try again.');
            } else if (status === 422) {
                showAuthError('Please enter a valid email address.');
            } else {
                showAuthError(error.message || 'Could not send reset link. Please try again.');
            }
            return;
        }
        // Success — never leak whether the account exists.
        console.log('[Auth] Password reset email request accepted by Supabase for:', email);
        showAuthSuccess('✅ Password reset link sent! Check your email (including spam folder).');
        const form = document.getElementById('forgotForm');
        if (form) form.reset();
        // Drop the user back at login after a short beat.
        setTimeout(function () { switchAuthForm('login'); }, 2500);
    } catch (err) {
        console.error('[Auth] resetPasswordForEmail failed:', err);
        showAuthError('Network error. Please check your connection and try again.');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
    }
}

// ============================================
// PASSWORD RESET — landing flow (#reset-password)
// User clicks the link in their email -> Supabase redirects back here with
// recovery tokens in the URL hash -> we show the "set new password" form and
// call supabase.auth.updateUser({ password }) to actually change it.
// ============================================

// Show the reset form (opening the auth modal if it isn't already open).
function showResetForm() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('active');
    switchAuthForm('reset');
}

// Strip Supabase recovery tokens / our #reset-password route from the URL so a
// refresh is clean and the form doesn't reappear.
function clearResetHash() {
    try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (e) {
        window.location.hash = '';
    }
}

// Reconcile the synchronous UI mirror with the live Supabase session and wire a
// single auth-state listener (login restore, logout, password recovery, profile
// updates). Called once on page load.
let recoveryActive = false;   // true while the user is in the reset-password flow
async function initSupabaseAuth() {
    if (!sbReady()) return;

    // If the URL is a recovery deep-link, remember it so the SIGNED_IN that
    // Supabase fires for the recovery session doesn't get treated as a normal login.
    const hash = window.location.hash || '';
    if (hash.indexOf('type=recovery') !== -1 || hash.indexOf('reset-password') !== -1) {
        recoveryActive = true;
    }

    // Single source of truth for auth changes.
    supabaseClient.auth.onAuthStateChange(function (event, session) {
        console.log('[Auth] onAuthStateChange:', event);

        if (event === 'PASSWORD_RECOVERY') {
            recoveryActive = true;
            console.log('[Auth] Recovery session detected — showing reset form.');
            showResetForm();
            return;
        }

        // While resetting a password we don't want to render a "logged in" header.
        if (recoveryActive && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
            return;
        }

        if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            inboxCache = [];
            stopInboxPolling();
            updateInboxBadge();
            renderAuthState();
            return;
        }

        // SIGNED_IN / TOKEN_REFRESHED / USER_UPDATED / INITIAL_SESSION with a user:
        // keep the UI mirror in sync. Idempotent with the interactive completeLogin().
        if (session && session.user) {
            const uiUser = uiUserFromSupabase(session.user);
            if (uiUser && uiUser.phone) rememberPhoneEmail(uiUser.phone, uiUser.email);
            setCurrentUser(uiUser);
            renderAuthState();
            if (isLoggedIn()) { refreshInbox(); startInboxPolling(); }
        }
    });

    // Reconcile on load: trust Supabase over the stale mirror.
    try {
        const { data } = await supabaseClient.auth.getSession();
        const session = data ? data.session : null;
        if (session && session.user && !recoveryActive) {
            setCurrentUser(uiUserFromSupabase(session.user));
            renderAuthState();
            if (isLoggedIn()) { refreshInbox(); startInboxPolling(); }
        } else if (!session && !recoveryActive) {
            // No live session -> clear any leftover mirror so the UI isn't falsely logged in.
            if (isLoggedIn()) {
                setCurrentUser(null);
                stopInboxPolling();
                updateInboxBadge();
                renderAuthState();
            }
        }
    } catch (e) {
        console.error('[Auth] getSession failed:', e);
    }

    // Fallback: if the URL points at the reset route but the event hasn't fired
    // yet, show the form anyway.
    if (recoveryActive) {
        console.log('[Auth] Reset-password route detected in URL hash.');
        showResetForm();
    }
}

// --- Reset password: set a new password using the recovery session ---
async function resetPassword(e) {
    e.preventDefault();
    clearAuthMessages();

    const pwEl = document.getElementById('resetPassword');
    const confirmEl = document.getElementById('resetConfirm');
    const password = pwEl ? pwEl.value : '';
    const confirm = confirmEl ? confirmEl.value : '';

    // Validation: minimum length 8 + the two fields must match.
    if (password.length < 8) {
        return showAuthError('Password must be at least 8 characters.');
    }
    if (password !== confirm) {
        return showAuthError('Passwords do not match.');
    }
    if (!sbReady()) {
        return showAuthError('Service unavailable right now. Please try again later.');
    }

    const btn = document.getElementById('resetSubmitBtn');
    const btnHTML = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>Updating…</span><i class="fas fa-spinner fa-spin"></i>';
    }

    console.log('[Auth] Attempting password update via recovery session…');

    try {
        const { data, error } = await supabaseClient.auth.updateUser({ password: password });
        if (error) {
            console.error('[Auth] updateUser error:', error.status, error.message);
            const status = error.status || 0;
            if (status === 401 || status === 403 || /session|expired|token|jwt/i.test(error.message || '')) {
                showAuthError('Your reset link has expired. Please request a new one.');
            } else if (status === 422) {
                showAuthError('Password is too weak or invalid. Try a stronger one.');
            } else {
                showAuthError(error.message || 'Could not update password. Please try again.');
            }
            return;
        }

        console.log('[Auth] Password updated for:', (data && data.user && data.user.email) || '(unknown)');
        showAuthSuccess('✅ Password updated! You can now log in with your new password.');

        // Recovery flow is over — allow normal login/session handling again.
        recoveryActive = false;

        // Clear recovery tokens from the URL and reset the form.
        clearResetHash();
        const form = document.getElementById('resetForm');
        if (form) form.reset();

        // End the temporary recovery session, then send them to the login view.
        try { await supabaseClient.auth.signOut(); } catch (e2) { /* non-fatal */ }
        setTimeout(function () { switchAuthForm('login'); }, 2500);
    } catch (err) {
        console.error('[Auth] updateUser failed:', err);
        showAuthError('Network error. Please check your connection and try again.');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
    }
}

// --- Logout ---
async function logoutUser() {
    if (sbReady()) {
        try { await supabaseClient.auth.signOut(); }
        catch (e) { console.error('[Auth] signOut failed:', e); }
    }
    setCurrentUser(null);
    inboxCache = [];
    stopInboxPolling();
    updateInboxBadge();
    renderAuthState();
    const chip = document.getElementById('userChip');
    if (chip) chip.classList.remove('open');
    showToast('You have been logged out.');
}

// --- Header user menu dropdown ---
function toggleUserMenu() {
    const chip = document.getElementById('userChip');
    const open = chip.classList.toggle('open');
    chip.querySelector('.user-chip-name').setAttribute('aria-expanded', open ? 'true' : 'false');
}

// Close the dropdown when clicking outside it.
document.addEventListener('click', function (e) {
    const chip = document.getElementById('userChip');
    if (chip && chip.classList.contains('open') && !chip.contains(e.target)) {
        chip.classList.remove('open');
    }
});

// --- Render logged-in vs logged-out header state (persists across refresh) ---
function renderAuthState() {
    const user = getCurrentUser();
    const authBtn = document.getElementById('authBtn');
    const userChip = document.getElementById('userChip');
    const mobileLink = document.getElementById('mobileAuthLink');

    if (user) {
        authBtn.style.display = 'none';
        userChip.style.display = 'block';
        const first = user.name.split(' ')[0];
        document.getElementById('userChipName').textContent = first;
        document.getElementById('userAvatar').textContent = (user.name.trim()[0] || 'U').toUpperCase();
        document.getElementById('userMenuName').textContent = user.name;
        document.getElementById('userMenuEmail').textContent = user.email;
        if (mobileLink) mobileLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout (' + esc(first) + ')';
        if (mobileLink) mobileLink.setAttribute('onclick', 'toggleMobileMenu(); logoutUser()');
    } else {
        authBtn.style.display = 'inline-flex';
        userChip.style.display = 'none';
        userChip.classList.remove('open');
        if (mobileLink) mobileLink.innerHTML = '<i class="fas fa-user"></i> Login / Signup';
        if (mobileLink) mobileLink.setAttribute('onclick', "toggleMobileMenu(); openAuthModal('login')");
    }

    // Inbox button is only meaningful for a logged-in user.
    const inboxBtn = document.getElementById('inboxBtn');
    if (inboxBtn) {
        inboxBtn.style.display = user ? 'inline-flex' : 'none';
        if (user) updateInboxBadge();
    }
}

// Wire up the auth forms (called from DOMContentLoaded).
function setupAuth() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('forgotForm').addEventListener('submit', forgotPassword);
    document.getElementById('resetForm').addEventListener('submit', resetPassword);
    renderAuthState();
    // If a session is already active, load this user's notices from Supabase
    // and keep them live via polling.
    if (isLoggedIn()) { refreshInbox(); startInboxPolling(); } else updateInboxBadge();
}

// ============================================
// INBOX — admin -> customer booking notices
// --------------------------------------------
// When an admin confirms or cancels a Handi booking, updateResStatus() calls
// notifyUser(), which writes the notice to Supabase (table: notices) so it
// reaches the customer on ANY device. The old localStorage-only inbox failed
// because localStorage is per-browser: a notice written on the admin's machine
// never appeared on the customer's. Notices match a customer by email OR phone
// (either is enough — a booking may carry only a phone while the account also
// has an email). localStorage is kept as an offline fallback only.
// FUTURE: also deliver each notice by Email + WhatsApp (see hook in notifyUser).
// ============================================
const GC_INBOX_KEY = 'gc_inbox';

// In-memory merged view (Supabase primary + local fallback) for the logged-in user.
let inboxCache = [];

// Poll Supabase so a notice sent from the admin's device shows up on the
// customer's open device without a manual reload.
let inboxPollTimer = null;
const INBOX_POLL_MS = 20000;

function getInbox() {
    try { return JSON.parse(localStorage.getItem(GC_INBOX_KEY) || '[]'); }
    catch (e) { return []; }
}

function saveInbox(list) {
    localStorage.setItem(GC_INBOX_KEY, JSON.stringify(list));
}

// The key that ties a notice to a person. Normalised so the admin side (which
// reads it off the reservation) and the user side (which reads it off the
// logged-in account) resolve to the same value.
function inboxKeyFor(emailOrPhone) {
    return (emailOrPhone || '').trim().toLowerCase();
}

function currentInboxKey() {
    const user = getCurrentUser();
    if (!user) return '';
    return inboxKeyFor(user.email || user.phone);
}

// ---- Supabase-backed notices (the real cross-device inbox) ----
// Build "email.eq.x,phone.eq.y" so a notice matches the user by EITHER field.
function noticeMatchFilters() {
    const user = getCurrentUser();
    if (!user) return [];
    const email = inboxKeyFor(user.email);
    const phone = (user.phone || '').trim();
    const filters = [];
    if (email) filters.push(`email.eq.${email}`);
    if (phone) filters.push(`phone.eq.${phone}`);
    return filters;
}

async function createNoticeDb(res, title, body) {
    if (!sbReady()) {
        console.warn('[Supabase] Client not ready — cannot create notice');
        return false;
    }

    const noticeData = {
        email: inboxKeyFor(res.email),
        phone: (res.phone || '').trim(),
        title: title,
        body: body,
        read: false
    };

    console.log('[Supabase] Inserting notice:', noticeData);

    const { data, error } = await supabaseClient
        .from('notices').insert([noticeData]).select();

    if (error) {
        console.error('[Supabase] Notice insert failed:', {
            message: error.message, details: error.details, hint: error.hint, code: error.code
        });
        if (error.code === '42P01') {
            console.error('[Supabase] The "notices" table does not exist — run the SQL in NOTIFICATION_SYSTEM_FIX.md (Step 1).');
        } else if (error.code === '42501') {
            console.error('[Supabase] Permission denied — update the notices RLS policy to allow INSERT from the anon key.');
        }
        return false;
    }

    console.log('[Supabase] Notice created successfully:', data);
    return true;
}

// Returns an array on success, or null when Supabase is unavailable/errored so
// the caller can fall back to localStorage.
async function fetchMyNoticesDb() {
    if (!sbReady()) return null;
    const filters = noticeMatchFilters();
    if (!filters.length) return [];
    const { data, error } = await supabaseClient
        .from('notices').select('*').or(filters.join(',')).order('created_at', { ascending: false });
    if (error) { console.error('[notices] fetch failed:', error); return null; }
    return data.map(n => ({ id: 'db-' + n.id, title: n.title, body: n.body, date: n.created_at, read: n.read }));
}

async function markMyNoticesReadDb() {
    if (!sbReady()) return;
    const filters = noticeMatchFilters();
    if (!filters.length) return;
    const { error } = await supabaseClient
        .from('notices').update({ read: true }).or(filters.join(',')).eq('read', false);
    if (error) console.error('[notices] mark read failed:', error);
}

// Called from updateResStatus() when an admin confirms/cancels a booking.
async function notifyUser(res, title, body) {
    console.log('[Notification] Sending notification:', { title, email: res.email, phone: res.phone });

    // Primary delivery: Supabase, so the customer sees it on their own device.
    const dbSuccess = await createNoticeDb(res, title, body);
    if (!dbSuccess) {
        console.warn('[Notification] Supabase insert failed — using localStorage fallback only');
    }

    // Offline / same-browser fallback copy.
    const key = inboxKeyFor(res.email || res.phone);
    if (key) {
        const list = getInbox();
        list.unshift({
            id: Date.now() + Math.floor(Math.random() * 1000),
            userKey: key,
            title: title,
            body: body,
            date: new Date().toISOString(),
            read: false
        });
        saveInbox(list);
    }

    // If the recipient is the user currently logged in on THIS device, update
    // the inbox UI immediately rather than waiting for the next poll.
    const currentUser = getCurrentUser();
    if (currentUser &&
        (currentUser.email === inboxKeyFor(res.email) || currentUser.phone === (res.phone || '').trim())) {
        await refreshInbox();
        showToast(`📬 ${title}`);
    }

    // FUTURE: deliver the same notice through other channels.
    //   sendEmailNotice(res.email, title, body);
    //   sendWhatsAppNotice(res.phone, title, body);

    console.log('[Notification] Notification dispatch complete');
}

// localStorage notices for the logged-in user (fallback source).
function myLocalNotices() {
    const key = currentInboxKey();
    if (!key) return [];
    return getInbox()
        .filter(n => n.userKey === key)
        .map(n => ({ id: n.id, title: n.title, body: n.body, date: n.date, read: n.read }));
}

// Rebuild inboxCache from Supabase (primary) with a localStorage fallback.
async function refreshInbox() {
    if (!isLoggedIn()) { inboxCache = []; updateInboxBadge(); return inboxCache; }
    console.log('[Inbox] Refreshing inbox...');
    const db = await fetchMyNoticesDb();      // array on success, null on failure
    const local = myLocalNotices();
    let notices;
    if (db === null) {
        notices = local;                       // Supabase unavailable -> fallback
    } else if (db.length === 0 && local.length > 0) {
        notices = local;                       // nothing in DB yet -> show local copy
    } else {
        notices = db;                          // Supabase is the source of truth
    }
    inboxCache = notices.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log('[Inbox] Inbox refreshed. Total notices:', inboxCache.length);
    updateInboxBadge();
    const modal = document.getElementById('inboxModal');
    if (modal && modal.classList.contains('active')) renderInbox();
    return inboxCache;
}

// Keep the inbox live for an open, logged-in device (e.g. the customer's phone
// while the admin confirms a booking on a laptop). Refreshes when the tab is
// visible; pauses in the background to save battery/requests.
function startInboxPolling() {
    stopInboxPolling();
    if (!isLoggedIn()) return;
    inboxPollTimer = setInterval(() => {
        if (document.visibilityState === 'visible' && isLoggedIn()) refreshInbox();
    }, INBOX_POLL_MS);
}

function stopInboxPolling() {
    if (inboxPollTimer) { clearInterval(inboxPollTimer); inboxPollTimer = null; }
}

// When the tab comes back to the foreground, refresh immediately so the user
// doesn't wait a full poll interval to see a notice that arrived while away.
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && isLoggedIn()) refreshInbox();
});

function updateInboxBadge() {
    const badge = document.getElementById('inboxBadge');
    if (!badge) return;
    const unread = inboxCache.filter(n => !n.read).length;
    if (unread > 0) {
        badge.textContent = unread > 9 ? '9+' : String(unread);
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function renderInbox() {
    const listEl = document.getElementById('inboxList');
    if (!listEl) return;
    const notices = inboxCache;
    if (notices.length === 0) {
        listEl.innerHTML = '<div class="inbox-empty"><i class="fas fa-inbox"></i><p>No messages yet. Booking updates will appear here.</p></div>';
        return;
    }
    listEl.innerHTML = notices.map(n => {
        const d = new Date(n.date);
        const when = isNaN(d) ? '' : d.toLocaleString();
        return `
            <div class="inbox-item${n.read ? '' : ' unread'}">
                <div class="inbox-item-head">
                    <span class="inbox-item-title">${esc(n.title)}</span>
                    <span class="inbox-item-date">${esc(when)}</span>
                </div>
                <div class="inbox-item-body">${esc(n.body)}</div>
            </div>
        `;
    }).join('');
}

async function openInbox() {
    if (!isLoggedIn()) { openAuthModal('login'); return; }
    const modal = document.getElementById('inboxModal');
    if (modal) modal.classList.add('active');

    const listEl = document.getElementById('inboxList');
    if (listEl) listEl.innerHTML = '<div class="inbox-empty"><i class="fas fa-spinner fa-spin"></i><p>Loading messages…</p></div>';

    await refreshInbox();
    renderInbox();

    // Opening the inbox marks the current user's notices as read (DB + local).
    await markMyNoticesReadDb();
    const key = currentInboxKey();
    if (key) {
        const list = getInbox();
        list.forEach(n => { if (n.userKey === key) n.read = true; });
        saveInbox(list);
    }
    inboxCache.forEach(n => { n.read = true; });
    updateInboxBadge();
}

function closeInbox() {
    const modal = document.getElementById('inboxModal');
    if (modal) modal.classList.remove('active');
}

// ============================================
// HANDI (BULK) ORDERS — Chicken & Mutton menus
// --------------------------------------------
// Browsing only: each plan's CTA scrolls the user to the Reserve section,
// where they book a Handi (no cart, no online payment).
// ============================================
let currentHandiVariant = 'chicken';

const handiPlans = {
    chicken: [
        { key: 'chk30', members: '30 Members', price: 4999, rating: 4.6, badge: 'Popular', items: ['Chicken Biryani (5kg)', 'Chicken Curry (3kg)', 'Paneer Butter Masala (2kg)', 'Dal Tadka (3kg)', 'Mixed Raita (2kg)', '30 Soft Drinks', '30 Gulab Jamuns'] },
        { key: 'chk40', members: '40 Members', price: 6499, rating: 4.8, badge: 'Best Value', featured: true, items: ['Chicken Biryani (7kg)', 'Chicken 65 (3kg)', 'Paneer Tikka (3kg)', 'Dal Tadka (4kg)', 'Mixed Raita (3kg)', '40 Soft Drinks', '40 Gulab Jamuns', '40 Ice Creams'] },
        { key: 'chk50', members: '50 Members', price: 7999, rating: 4.7, badge: '', items: ['Chicken Biryani (9kg)', 'Butter Chicken (5kg)', 'Paneer Tikka (4kg)', 'Dal Tadka (5kg)', 'Mixed Raita (4kg)', '50 Soft Drinks', '50 Gulab Jamuns', '50 Ice Creams', 'Welcome Drink'] },
        { key: 'chk50plus', members: '50+ Members', price: 9999, rating: 4.9, badge: 'Premium', items: ['Chicken Biryani (12kg)', 'Butter Chicken (7kg)', 'Chicken 65 (4kg)', 'Paneer Tikka (5kg)', 'Dal Tadka (6kg)', 'Mixed Raita (5kg)', 'Unlimited Soft Drinks', 'Assorted Desserts', 'Welcome Drink', 'Live Counter'] }
    ],
    mutton: [
        { key: 'mtn30', members: '30 Members', price: 5999, rating: 4.6, badge: 'Popular', items: ['Mutton Biryani (5kg)', 'Mutton Curry (3kg)', 'Paneer Butter Masala (2kg)', 'Dal Tadka (3kg)', 'Mixed Raita (2kg)', '30 Soft Drinks', '30 Gulab Jamuns'] },
        { key: 'mtn40', members: '40 Members', price: 7799, rating: 4.8, badge: 'Best Value', featured: true, items: ['Mutton Biryani (7kg)', 'Mutton Rogan Josh (4kg)', 'Paneer Tikka (3kg)', 'Dal Tadka (4kg)', 'Mixed Raita (3kg)', '40 Soft Drinks', '40 Gulab Jamuns', '40 Ice Creams'] },
        { key: 'mtn50', members: '50 Members', price: 9499, rating: 4.7, badge: '', items: ['Mutton Biryani (9kg)', 'Mutton Rogan Josh (5kg)', 'Mutton Chukka (4kg)', 'Dal Tadka (5kg)', 'Mixed Raita (4kg)', '50 Soft Drinks', '50 Gulab Jamuns', '50 Ice Creams', 'Welcome Drink'] },
        { key: 'mtn50plus', members: '50+ Members', price: 11499, rating: 4.9, badge: 'Premium', items: ['Mutton Biryani (12kg)', 'Mutton Rogan Josh (7kg)', 'Mutton Chukka (5kg)', 'Paneer Tikka (5kg)', 'Dal Tadka (6kg)', 'Mixed Raita (5kg)', 'Unlimited Soft Drinks', 'Assorted Desserts', 'Welcome Drink', 'Live Counter'] }
    ]
};

const GC_HANDI_KEY = 'gc_handi_overrides';

function loadHandiOverrides() {
    try {
        return JSON.parse(localStorage.getItem(GC_HANDI_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function saveHandiOverride(variant, key, price, rating) {
    const overrides = loadHandiOverrides();
    overrides[variant + '|' + key] = { price, rating };
    localStorage.setItem(GC_HANDI_KEY, JSON.stringify(overrides));
}

function applyHandiOverrides() {
    const overrides = loadHandiOverrides();
    Object.keys(handiPlans).forEach(variant => {
        handiPlans[variant].forEach(plan => {
            const ov = overrides[variant + '|' + plan.key];
            if (ov) {
                plan.price = ov.price;
                plan.rating = ov.rating;
            }
        });
    });
}

// ---- Admin-uploaded menu images (persisted in localStorage as data URLs) ----
const GC_MENU_IMG_KEY = 'gc_menu_images';

function loadMenuImageOverrides() {
    try {
        return JSON.parse(localStorage.getItem(GC_MENU_IMG_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function saveMenuImageOverride(itemId, dataUrl) {
    const overrides = loadMenuImageOverrides();
    overrides[itemId] = dataUrl;
    localStorage.setItem(GC_MENU_IMG_KEY, JSON.stringify(overrides));
}

function applyMenuImageOverrides() {
    const overrides = loadMenuImageOverrides();
    menuItems.forEach(item => {
        if (overrides[item.id]) item.image = overrides[item.id];
    });
}

function renderHandiPlans(variant) {
    const container = document.getElementById('handiContainer');
    if (!container) return;
    const plans = handiPlans[variant] || [];

    container.innerHTML = plans.map(plan => `
        <div class="handi-box${plan.featured ? ' featured' : ''}" data-reveal>
            ${plan.badge ? `<div class="handi-badge${plan.badge === 'Best Value' ? ' best' : ''}">${plan.badge}</div>` : ''}
            <div class="handi-header">
                <i class="fas fa-users"></i>
                <h3>${plan.members}</h3>
            </div>
            <div class="handi-rating" style="display:flex;align-items:center;justify-content:center;gap:4px;color:var(--gold);font-weight:600;margin-bottom:6px;">
                <i class="fas fa-star"></i>
                <span>${(plan.rating ?? 0).toFixed(1)}</span>
            </div>
            <div class="handi-price">
                <span class="currency">₹</span>
                <span class="amount">${plan.price.toLocaleString('en-IN')}</span>
            </div>
            <button class="btn-primary btn-full" onclick="bookHandi()">
                <span>Book Your Handi</span>
                <i class="fas fa-calendar-check"></i>
            </button>
        </div>
    `).join('');
}

function switchHandiVariant(variant) {
    currentHandiVariant = variant;
    document.querySelectorAll('.handi-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.variant === variant);
    });
    renderHandiPlans(variant);
}

function initHandi() {
    switchHandiVariant('chicken');
}

// CTA on every Handi plan — sends the user to the Reserve section to book.
function bookHandi() {
    const target = document.getElementById('reservation');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
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
// FEEDBACK SYSTEM
// ============================================
function showFeedbackModal() {
    document.getElementById('feedbackModal').classList.add('active');
}

// Opens the feedback popup from the footer "Give Feedback" button.
function openFeedbackModal() {
    document.getElementById('feedbackModal').classList.add('active');
}

function closeFeedback() {
    document.getElementById('feedbackModal').classList.remove('active');
}

function setupEventListeners() {
    // Feedback form (popup) — captures name, rating and review.
    document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const form = this;
        const name = document.getElementById('feedbackName').value.trim();
        const rating = document.querySelector('input[name="rating"]:checked');
        const text = document.getElementById('feedbackText').value.trim();

        if (!rating) {
            showToast('Please select a rating!');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const original = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = '<span>Submitting...</span> <i class="fas fa-spinner fa-spin"></i>'; }

        const saved = await createFeedback({
            customer: name || 'Guest',
            phone: null,
            rating: parseInt(rating.value),
            text: text || 'No comments'
        });

        if (btn) { btn.disabled = false; btn.innerHTML = original; }

        if (saved) {
            await fetchFeedbacks();
            closeFeedback();
            showToast('Thank you for your feedback!');
            form.reset();
        }
    });

    // Reservation form
    document.getElementById('reservationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const form = this;
        const resData = {
            name: document.getElementById('resName').value,
            phone: document.getElementById('resPhone').value,
            note: document.getElementById('resNote').value,
            email: document.getElementById('resEmail').value,
            date: document.getElementById('resDate').value,
            time: document.getElementById('resTime').value,
            guests: document.getElementById('resGuests').value,
            address: document.getElementById('resAddress').value,
            handiType: document.getElementById('resHandiType').value,
            occasion: document.getElementById('resOccasion').value || 'Regular',
            status: 'pending'
        };

        // Saves the reservation to Supabase and notifies admin. Pulled out so it
        // can run immediately (logged in) or be resumed right after login.
        const submitReservation = async function() {
            const btn = form.querySelector('button[type="submit"]');
            const original = btn ? btn.innerHTML : '';
            if (btn) { btn.disabled = true; btn.innerHTML = '<span>Submitting...</span> <i class="fas fa-spinner fa-spin"></i>'; }

            const saved = await createReservation(resData);

            if (btn) { btn.disabled = false; btn.innerHTML = original; }
            if (!saved) return;

            await fetchReservations();
            sendAdminNotification('New Reservation', `${resData.name} - ${resData.guests} ${resData.handiType} Handi on ${resData.date}`);
            showToast('Reservation request submitted! We will confirm shortly.');
            form.reset();
        };

        // GATE: customer must be logged in before booking a reservation.
        if (!isLoggedIn()) {
            showToast('Please login or sign up to book your reservation.');
            pendingAfterLogin = submitReservation;
            openAuthModal('login');
            return;
        }

        submitReservation();
    });

    // Admin login — Supabase Auth + admin role claim (see loginAdminFromHeader).
    // No plaintext creds live in this file. The client-side `adminLoggedIn`
    // boolean is UI-only; every privileged DB call is enforced by RLS.
    document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const emailField = document.getElementById('adminUser');
        const passField  = document.getElementById('adminPass');
        const submitBtn  = e.target.querySelector('button[type="submit"]');
        const email = (emailField.value || '').trim().toLowerCase();
        const password = passField.value || '';

        if (!email || !password) {
            return showToast('Enter admin email and password.');
        }
        if (!looksLikeEmail(email)) {
            return showToast('Admin login requires an email address.');
        }
        if (submitBtn) submitBtn.disabled = true;
        try {
            const ok = await loginAdminFromHeader(email, password);
            if (!ok) {
                showToast('Invalid credentials or not an admin account.');
                passField.value = '';
            } else {
                emailField.value = '';
                passField.value  = '';
            }
        } finally {
            if (submitBtn) submitBtn.disabled = false;
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
async function showAdminTab(tab, el) {
    const content = document.getElementById('adminContent');
    const title = document.getElementById('adminTitle');

    document.querySelectorAll('.admin-nav-item').forEach(item => item.classList.remove('active'));
    // Prefer the clicked element; fall back to matching the tab so programmatic
    // calls (e.g. showAdminTab('orders')) still highlight the right item.
    const active = el
        ? el.closest('.admin-nav-item')
        : document.querySelector(`.admin-nav-item[data-tab="${tab}"]`);
    if (active) active.classList.add('active');

    const loading = '<p style="text-align:center;color:var(--text-muted);padding:40px;"><i class="fas fa-spinner fa-spin"></i> Loading...</p>';

    switch(tab) {
        case 'reservations':
            title.textContent = 'Reservations';
            content.innerHTML = loading;
            await fetchReservations();
            renderReservations(content);
            break;
        case 'menu-edit':
            title.textContent = 'Edit Menu';
            renderMenuEdit(content);
            break;
        case 'analytics':
            title.textContent = 'Analytics Dashboard';
            content.innerHTML = loading;
            await Promise.all([fetchReservations(), fetchFeedbacks()]);
            renderAnalytics(content);
            break;
        case 'feedback':
            title.textContent = 'Customer Feedback';
            content.innerHTML = loading;
            await fetchFeedbacks();
            renderFeedback(content);
            break;
    }
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
                <div class="stat-card-value">${reservations.reduce((s, r) => s + (parseInt(r.guests) || 0), 0)}</div>
                <div class="stat-card-label">Total Handi (Members)</div>
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
                    <th>Email</th>
                    <th>Date/Time</th>
                    <th>Handi</th>
                    <th>Type</th>
                    <th>Address</th>
                    <th>Occasion</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${reservations.map(res => `
                    <tr>
                        <td style="color:var(--gold);">${esc(res.id)}</td>
                        <td>${esc(res.name)}</td>
                        <td>${esc(res.phone)}</td>
                        <td>${res.email ? esc(res.email) : '<span style="color:var(--text-muted);">—</span>'}</td>
                        <td>${esc(res.date)}<br><small>${esc(res.time)}</small></td>
                        <td>${esc(res.guests)}</td>
                        <td>${res.handiType ? esc(res.handiType) : '<span style="color:var(--text-muted);">—</span>'}</td>
                        <td>${res.address ? esc(res.address) : '<span style="color:var(--text-muted);">—</span>'}</td>
                        <td>${esc(res.occasion)}</td>
                        <td><span class="status-badge status-${esc(res.status)}">${esc(res.status)}</span></td>
                        <td>
                            <button onclick="updateResStatus('${esc(res.id)}')" style="background:var(--gold);color:var(--black);border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;">
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
                    <th>Image</th>
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
                        <td>${esc(item.id)}</td>
                        <td>
                            <div class="admin-menu-thumb">
                                ${item.image
                                    ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                                       <span class="admin-menu-thumb-empty" style="display:none;"><i class="fas fa-utensils"></i></span>`
                                    : `<span class="admin-menu-thumb-empty"><i class="fas fa-utensils"></i></span>`}
                            </div>
                        </td>
                        <td style="color:var(--white);font-weight:600;">${esc(item.name)}</td>
                        <td><span class="status-badge status-confirmed">${esc(item.category)}</span></td>
                        <td style="color:var(--gold);font-weight:600;">₹${esc(item.price)}</td>
                        <td>${esc(item.rating)} <i class="fas fa-star" style="color:var(--gold);font-size:0.7rem;"></i></td>
                        <td>
                            <button onclick="uploadItemImage(${item.id})" style="background:var(--gold);color:var(--black);border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-right:5px;font-size:0.8rem;" title="Upload image">
                                <i class="fas fa-image"></i>
                            </button>
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

        <div style="display:flex;justify-content:space-between;align-items:center;margin:36px 0 20px;">
            <h3 style="color:var(--white);">Handi Items</h3>
            <span style="color:var(--text-muted);font-size:0.85rem;">Edit price &amp; rating — changes show instantly in the Handi section</span>
        </div>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Variant</th>
                    <th>Plan</th>
                    <th>Price (₹)</th>
                    <th>Rating</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${['chicken', 'mutton'].map(variant => handiPlans[variant].map(plan => `
                    <tr>
                        <td><span class="status-badge status-confirmed">${variant === 'chicken' ? 'Chicken' : 'Mutton'}</span></td>
                        <td style="color:var(--white);font-weight:600;">${plan.members}</td>
                        <td>
                            <input type="number" id="handi-price-${variant}-${plan.key}" value="${plan.price}" min="0" step="1"
                                style="width:100px;background:var(--black);color:var(--gold);border:1px solid var(--black-lighter);border-radius:6px;padding:6px 8px;font-weight:600;">
                        </td>
                        <td>
                            <input type="number" id="handi-rating-${variant}-${plan.key}" value="${plan.rating}" min="0" max="5" step="0.1"
                                style="width:80px;background:var(--black);color:var(--white);border:1px solid var(--black-lighter);border-radius:6px;padding:6px 8px;">
                        </td>
                        <td>
                            <button onclick="saveHandiItem('${variant}', '${plan.key}')" style="background:var(--success);color:white;border:none;padding:6px 14px;border-radius:5px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                                <i class="fas fa-save"></i> Save
                            </button>
                        </td>
                    </tr>
                `).join('')).join('')}
            </tbody>
        </table>
    `;
}

function renderAnalytics(container) {
    const totalMembers = reservations.reduce((s, r) => s + (parseInt(r.guests) || 0), 0);
    const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-calendar-check"></i></div>
                <div class="stat-card-value">${reservations.length}</div>
                <div class="stat-card-label">Total Bookings</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-users"></i></div>
                <div class="stat-card-value">${totalMembers}</div>
                <div class="stat-card-label">Total Members</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-card-value">${confirmedCount}</div>
                <div class="stat-card-label">Confirmed</div>
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
                            <div style="color:var(--white);font-weight:600;">${esc(item.name)}</div>
                            <div style="color:var(--text-muted);font-size:0.8rem;">${esc(item.category)}</div>
                        </div>
                        <div style="color:var(--gold);font-weight:700;">★ ${esc(item.rating)}</div>
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
                        <span style="color:var(--white);font-weight:600;">${esc(fb.customer)}</span>
                        <span style="color:var(--text-muted);font-size:0.8rem;">${esc(fb.date)}</span>
                    </div>
                    <div style="margin-bottom:10px;">
                        ${Array(5).fill(0).map((_, i) => `<i class="fas fa-star" style="color:${i < Number(fb.rating) ? 'var(--gold)' : 'var(--black-lighter)'};"></i>`).join('')}
                    </div>
                    <p style="color:var(--text-muted);font-size:0.9rem;">${esc(fb.text)}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Admin Actions
async function updateResStatus(resId) {
    const res = reservations.find(r => r.id === resId);
    if (!res) {
        console.error('[Admin] Reservation not found:', resId);
        return;
    }

    const statuses = ['pending', 'confirmed', 'cancelled'];
    const next = statuses[(statuses.indexOf(res.status) + 1) % statuses.length];

    console.log('[Admin] Updating reservation status:', {
        id: resId, from: res.status, to: next,
        customer: res.name, email: res.email, phone: res.phone
    });

    const ok = await updateReservationStatusDb(resId, next);
    if (!ok) {
        showToast('❌ Failed to update reservation status');
        return;
    }

    res.status = next;
    showToast(`✅ Reservation updated to ${next}`);

    // Notify the customer in their Inbox when the booking is confirmed or
    // cancelled. (Future: also deliver via Email + WhatsApp — see notifyUser.)
    if (next === 'confirmed') {
        console.log('[Admin] Sending confirmation notification...');
        await notifyUser(
            res,
            '✅ Booking Confirmed',
            `Hi ${res.name}, your reservation for ${res.guests} guests on ${res.date} at ${res.time} has been confirmed. We look forward to serving you at Galaxy Cafe!`
        );
    } else if (next === 'cancelled') {
        console.log('[Admin] Sending cancellation notification...');
        await notifyUser(
            res,
            '❌ Booking Cancelled',
            `Hi ${res.name}, we regret to inform you that your reservation for ${res.date} at ${res.time} has been cancelled. We apologize for the inconvenience and will contact you soon to reschedule.`
        );
    }

    await fetchReservations();
    renderReservations(document.getElementById('adminContent'));
    console.log('[Admin] Reservation status update complete');
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

// Admin uploads a custom image for a menu item. The file is read as a base64
// data URL, stored in localStorage, and reflected live on the public menu card.
// ---- Menu image upload with crop + zoom ----
// Picks a file, validates it, then opens the cropper modal so the admin can
// frame the image to the menu card's 4:5 ratio before saving.
function uploadItemImage(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function () {
        const file = input.files && input.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('⚠️ Please choose an image file');
            return;
        }
        // ~5MB source cap — the cropped output is re-compressed much smaller.
        if (file.size > 5 * 1024 * 1024) {
            showToast('⚠️ Image too large. Please use one under 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            openCropper(itemId, e.target.result);
        };
        reader.onerror = function () {
            showToast('❌ Could not read the image. Try another file.');
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// Cropper state. displayScale = coverScale * zoom; offsets are in display px.
const cropper = {
    itemId: null,
    imgEl: null,
    naturalW: 0,
    naturalH: 0,
    stageW: 0,
    stageH: 0,
    coverScale: 1,   // scale at which the image exactly covers the stage
    zoom: 1,         // 1..4 multiplier on top of coverScale
    minZoom: 1,
    maxZoom: 4,
    offsetX: 0,
    offsetY: 0,
    abort: null,     // AbortController; aborting removes every bound listener at once
    probe: null,     // in-flight Image() used to measure the upload; detached on reset
    openId: 0        // increments each open; a stale probe.onload sees the mismatch and bails
};

// Hard force-hide of #cropModal. Uses BOTH the class toggle and an inline
// display:none so the modal can never linger over the main site — even if a
// stale/async code path re-adds `.active`. openCropper() clears the inline
// display before it shows the modal again.
function forceHideCropModal() {
    const modal = document.getElementById('cropModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.style.display = 'none';
}

// Fully resets cropper state and tears down all event listeners. Idempotent —
// safe to call repeatedly (closeCropper, closeAdminPanel, adminLogout, and
// openCropper all use it). Aggressively kills the in-flight image probe so an
// async onload can never re-show the cropper after teardown.
function resetCropperState() {
    if (cropper.abort) {
        cropper.abort.abort();
        cropper.abort = null;
    }
    // Detach any in-flight measurement probe: null its handlers AND bump openId
    // so even a probe that already queued its onload sees a stale id and bails.
    if (cropper.probe) {
        cropper.probe.onload = null;
        cropper.probe.onerror = null;
        cropper.probe.src = '';
        cropper.probe = null;
    }
    cropper.openId++;
    cropper.itemId = null;
    cropper.imgEl = null;
    cropper.naturalW = 0;
    cropper.naturalH = 0;
    cropper.stageW = 0;
    cropper.stageH = 0;
    cropper.coverScale = 1;
    cropper.zoom = 1;
    cropper.offsetX = 0;
    cropper.offsetY = 0;

    const imgEl = document.getElementById('cropperImg');
    if (imgEl) {
        imgEl.removeAttribute('style');
        imgEl.removeAttribute('src');
    }
    const stage = document.getElementById('cropperStage');
    if (stage) stage.classList.remove('dragging');
    const slider = document.getElementById('cropperZoom');
    if (slider) slider.value = 1;

    // Belt-and-suspenders: any reset also force-hides the modal.
    forceHideCropModal();
}

function openCropper(itemId, dataUrl) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById('cropModal');
    const stage = document.getElementById('cropperStage');
    const imgEl = document.getElementById('cropperImg');
    const nameEl = document.getElementById('cropperItemName');
    if (!modal || !stage || !imgEl) {
        showToast('❌ Cropper is unavailable. Please reload the page.');
        return;
    }

    // Clear any leftover state/listeners from a previous open or login session.
    // (resetCropperState force-hides the modal; we un-hide it once the image is
    // measured and ready, below.)
    resetCropperState();

    // Claim this open. A later resetCropperState() bumps openId, so an in-flight
    // probe.onload from a superseded/closed open will detect the mismatch and bail.
    const myOpenId = ++cropper.openId;

    cropper.itemId = itemId;
    cropper.imgEl = imgEl;
    if (nameEl) nameEl.textContent = `Framing image for "${item.name}"`;

    const probe = new Image();
    cropper.probe = probe;
    probe.onload = function () {
        // Stale probe (cropper was reset/closed, or a newer open started)? Bail —
        // never re-show the modal after teardown.
        if (myOpenId !== cropper.openId) return;
        cropper.probe = null;
        cropper.naturalW = probe.naturalWidth;
        cropper.naturalH = probe.naturalHeight;
        if (!cropper.naturalW || !cropper.naturalH) {
            showToast('❌ That image appears to be empty. Try another file.');
            resetCropperState();
            return;
        }

        // Show modal first so the stage has measurable dimensions. Clear the
        // inline display:none left by resetCropperState so `.active` can show it.
        modal.style.display = '';
        modal.classList.add('active');
        const rect = stage.getBoundingClientRect();
        cropper.stageW = rect.width;
        cropper.stageH = rect.height;

        cropper.coverScale = Math.max(
            cropper.stageW / cropper.naturalW,
            cropper.stageH / cropper.naturalH
        );
        cropper.zoom = 1;

        imgEl.src = dataUrl;

        // Center the image within the frame.
        const dispW = cropper.naturalW * cropper.coverScale * cropper.zoom;
        const dispH = cropper.naturalH * cropper.coverScale * cropper.zoom;
        cropper.offsetX = (cropper.stageW - dispW) / 2;
        cropper.offsetY = (cropper.stageH - dispH) / 2;

        renderCropper();
        bindCropperEvents();
    };
    probe.onerror = function () {
        if (myOpenId !== cropper.openId) return;
        showToast('❌ Could not load that image. Try another file.');
        resetCropperState();
    };
    probe.src = dataUrl;
}

function cropperDisplayScale() {
    return cropper.coverScale * cropper.zoom;
}

function clampCropperOffsets() {
    const ds = cropperDisplayScale();
    const dispW = cropper.naturalW * ds;
    const dispH = cropper.naturalH * ds;
    // Image must always cover the stage: offset between (stage - disp) and 0.
    const minX = cropper.stageW - dispW;
    const minY = cropper.stageH - dispH;
    cropper.offsetX = Math.min(0, Math.max(minX, cropper.offsetX));
    cropper.offsetY = Math.min(0, Math.max(minY, cropper.offsetY));
}

function renderCropper() {
    const img = cropper.imgEl;
    if (!img) return;
    const ds = cropperDisplayScale();
    clampCropperOffsets();
    img.style.width = (cropper.naturalW * ds) + 'px';
    img.style.height = (cropper.naturalH * ds) + 'px';
    img.style.left = cropper.offsetX + 'px';
    img.style.top = cropper.offsetY + 'px';
    const slider = document.getElementById('cropperZoom');
    if (slider) slider.value = cropper.zoom;
}

// Zoom around a stage point (defaults to stage center) so framing stays stable.
function setCropperZoom(newZoom, px, py) {
    newZoom = Math.min(cropper.maxZoom, Math.max(cropper.minZoom, newZoom));
    if (px === undefined) px = cropper.stageW / 2;
    if (py === undefined) py = cropper.stageH / 2;

    const oldDisp = cropperDisplayScale();
    // Image-space ratio under the focus point before zoom.
    const ratioX = (px - cropper.offsetX) / (cropper.naturalW * oldDisp);
    const ratioY = (py - cropper.offsetY) / (cropper.naturalH * oldDisp);

    cropper.zoom = newZoom;
    const newDisp = cropperDisplayScale();
    cropper.offsetX = px - ratioX * cropper.naturalW * newDisp;
    cropper.offsetY = py - ratioY * cropper.naturalH * newDisp;
    renderCropper();
}

function cropperZoomStep(dir) {
    setCropperZoom(cropper.zoom + dir * 0.25);
}

function bindCropperEvents() {
    const stage = document.getElementById('cropperStage');
    const slider = document.getElementById('cropperZoom');
    if (!stage) return;

    // Fresh controller each open; resetCropperState() aborts it to remove every
    // listener below in one shot — including the window-level drag handlers.
    cropper.abort = new AbortController();
    const signal = cropper.abort.signal;

    let dragging = false;
    let lastX = 0, lastY = 0;

    function pointFromEvent(e) {
        const t = e.touches ? e.touches[0] : e;
        return { x: t.clientX, y: t.clientY };
    }
    function startDrag(e) {
        dragging = true;
        stage.classList.add('dragging');
        const p = pointFromEvent(e);
        lastX = p.x; lastY = p.y;
    }
    function moveDrag(e) {
        if (!dragging) return;
        const p = pointFromEvent(e);
        cropper.offsetX += p.x - lastX;
        cropper.offsetY += p.y - lastY;
        lastX = p.x; lastY = p.y;
        renderCropper();
        if (e.cancelable) e.preventDefault();
    }
    function endDrag() {
        dragging = false;
        stage.classList.remove('dragging');
    }
    function wheelZoom(e) {
        e.preventDefault();
        const rect = stage.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        setCropperZoom(cropper.zoom - Math.sign(e.deltaY) * 0.12, px, py);
    }

    stage.addEventListener('mousedown', startDrag, { signal });
    window.addEventListener('mousemove', moveDrag, { signal });
    window.addEventListener('mouseup', endDrag, { signal });
    stage.addEventListener('touchstart', startDrag, { passive: true, signal });
    stage.addEventListener('touchmove', moveDrag, { passive: false, signal });
    stage.addEventListener('touchend', endDrag, { signal });
    stage.addEventListener('wheel', wheelZoom, { passive: false, signal });

    if (slider) {
        slider.addEventListener('input', function () {
            setCropperZoom(parseFloat(slider.value));
        }, { signal });
    }
}

function closeCropper() {
    // Force-hide first (class + inline display:none), then tear down all state
    // and listeners. resetCropperState() also force-hides, so the modal can
    // never linger even if a stale async path fired.
    forceHideCropModal();
    resetCropperState();
}

// Draws the visible crop region to a 4:5 canvas, compresses, and persists.
function cropAndSave() {
    const item = menuItems.find(i => i.id === cropper.itemId);
    // Guard against a stale/empty cropper (e.g. after a login/logout cycle).
    if (!item || !cropper.imgEl || !cropper.naturalW || !cropper.stageW) {
        showToast('❌ Nothing to save. Please re-upload the image.');
        closeCropper();
        return;
    }

    const ds = cropperDisplayScale();
    // Map the stage viewport back to natural-pixel source coordinates.
    const sx = (-cropper.offsetX) / ds;
    const sy = (-cropper.offsetY) / ds;
    const sW = cropper.stageW / ds;
    const sH = cropper.stageH / ds;

    const OUT_W = 640, OUT_H = 800; // 4:5, crisp for retina menu cards
    const canvas = document.createElement('canvas');
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f6efe1'; // matches card fallback, fills any transparency
    ctx.fillRect(0, 0, OUT_W, OUT_H);
    ctx.drawImage(cropper.imgEl, sx, sy, sW, sH, 0, 0, OUT_W, OUT_H);

    let dataUrl;
    try {
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    } catch (err) {
        showToast('❌ Could not process the image.');
        return;
    }

    item.image = dataUrl;
    saveMenuImageOverride(item.id, dataUrl);
    showToast(`📷 Image updated for ${item.name}`);
    closeCropper();
    renderMenuEdit(document.getElementById('adminContent'));
    renderMenu();
}

// Save a Handi plan's price + rating from the admin "Handi Items" subsection,
// persist the override, and reflect it live in the public Handi section.
function saveHandiItem(variant, key) {
    const plan = (handiPlans[variant] || []).find(p => p.key === key);
    if (!plan) return;

    const priceEl = document.getElementById(`handi-price-${variant}-${key}`);
    const ratingEl = document.getElementById(`handi-rating-${variant}-${key}`);
    const price = parseInt(priceEl.value, 10);
    const rating = parseFloat(ratingEl.value);

    if (isNaN(price) || price < 0) { showToast('Enter a valid price'); return; }
    if (isNaN(rating) || rating < 0 || rating > 5) { showToast('Rating must be between 0 and 5'); return; }

    plan.price = price;
    plan.rating = rating;
    saveHandiOverride(variant, key, price, rating);
    showToast(`${variant === 'chicken' ? 'Chicken' : 'Mutton'} ${plan.members} Handi updated`);

    renderMenuEdit(document.getElementById('adminContent'));
    renderHandiPlans(currentHandiVariant);
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

async function adminLogout() {
    if (adminUser) {
        logStaffActivity(adminUser, 'logout');
    }
    adminLoggedIn = false;
    adminUser = null;
    // Kill the Supabase session so no admin JWT lingers in localStorage.
    if (sbReady()) {
        try { await supabaseClient.auth.signOut(); } catch (_) {}
    }
    // Tear down the image cropper so its listeners/state never leak across sessions.
    closeCropper();
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminLoginForm').reset();
    closeAdminPanel(); // close the overlay and return to the site
    showToast('Logged out successfully');
}

// ============================================
// ADMIN ROUTING  ( open via /admin-pannel )
// --------------------------------------------
// The admin panel is no longer a visible page section — it is a full-screen
// overlay that opens only when the URL points to the admin route. On a static
// host that can't do real path routing, we also accept #admin-pannel and
// ?admin=1 so the same link works everywhere.
// ============================================
function isAdminRoute() {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    // Accept both spellings: /admin-panel and /admin-pannel (with optional trailing slash)
    if (/\/admin-pann?el\/?$/.test(path)) return true;
    if (hash === '#admin-panel' || hash === '#admin-pannel') return true;
    if (params.get('admin') === '1') return true;
    return false;
}

function openAdminPanel() {
    const overlay = document.getElementById('adminPanelOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Show the right screen depending on whether someone is already logged in.
    document.getElementById('adminLogin').style.display = adminLoggedIn ? 'none' : 'flex';
    document.getElementById('adminDashboard').style.display = adminLoggedIn ? 'flex' : 'none';
}

function closeAdminPanel() {
    // Always tear down the cropper when leaving the admin panel. #cropModal is a
    // top-level sibling of the overlay (position:fixed, z-index:3000), so closing
    // the overlay alone would leave an open cropper floating over the main site.
    // This covers "Back to site", logout, route changes, and popstate.
    closeCropper();

    const overlay = document.getElementById('adminPanelOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    // Strip the admin route from the URL so a refresh returns to the site.
    const cleanPath = window.location.pathname.replace(/\/admin-pann?el\/?$/i, '/');
    history.replaceState(null, '', cleanPath);
}

function checkAdminRoute() {
    if (isAdminRoute()) {
        openAdminPanel();
    } else {
        const overlay = document.getElementById('adminPanelOverlay');
        if (overlay && overlay.classList.contains('active')) closeAdminPanel();
    }
}

window.addEventListener('hashchange', checkAdminRoute);
window.addEventListener('popstate', checkAdminRoute);


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

