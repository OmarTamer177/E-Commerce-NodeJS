// Cart count placeholder
let cartItems = 0;
document.getElementById("cart-count").textContent = cartItems;

// Hero section slider
let currentHero = 0;
const heroes = document.querySelectorAll('.hero');

function rotateHero() {
  // Hide current hero
  heroes[currentHero].style.opacity = 0;
  heroes[currentHero].style.zIndex = 0;
  
  // Calculate next hero
  currentHero = (currentHero + 1) % heroes.length;
  
  // Show next hero
  heroes[currentHero].style.opacity = 1;
  heroes[currentHero].style.zIndex = 1;
}

// Rotate every 4 seconds
setInterval(rotateHero, 4000);

// FontAwesome is loaded via CDN in HTML head