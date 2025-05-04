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

// Rotate every 5 seconds
setInterval(rotateHero, 5000);

// Manual navigation
document.getElementById('men-link').addEventListener('click', (e) => {
  e.preventDefault();
  heroes[0].style.opacity = 1;
  heroes[0].style.zIndex = 1;
  heroes[1].style.opacity = 0;
  heroes[1].style.zIndex = 0;
  currentHero = 0;
});

document.getElementById('women-link').addEventListener('click', (e) => {
  e.preventDefault();
  heroes[1].style.opacity = 1;
  heroes[1].style.zIndex = 1;
  heroes[0].style.opacity = 0;
  heroes[0].style.zIndex = 0;
  currentHero = 1;
});

// FontAwesome is loaded via CDN in HTML head