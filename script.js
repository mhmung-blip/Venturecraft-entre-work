// Game State
let gameState = {
    money: 100.00,
    incomePerSecond: 0.00,
    isDrawing: false,
    lastX: 0,
    lastY: 0
};

// Fixed Shop Items - Scaled strictly so price correlates perfectly to revenue
const shopUpgrades = [
    { id: 'tier1', name: 'Basic Dropshipping Store', cost: 50, revenueMultiplier: 1.5 },
    { id: 'tier2', name: 'Social Media Ad Campaign', cost: 150, revenueMultiplier: 5.0 },
    { id: 'tier3', name: 'Premium Supplier Contract', cost: 500, revenueMultiplier: 18.0 },
    { id: 'tier4', name: 'Automated Fulfillment Bot', cost: 1500, revenueMultiplier: 60.0 }
];

// Elements
const moneyDisplay = document.getElementById('money-display');
const incomeDisplay = document.getElementById('income-display');
const shopContainer = document.getElementById('shop-container');
const canvas = document.getElementById('design-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Initialize Game
function initGame() {
    updateUI();
    renderShop();
    if (canvas) initCanvas();
    
    // Game Loop (Updates money every second smoothly)
    setInterval(() => {
        gameState.money += gameState.incomePerSecond;
        updateUI();
    }, 1000);
}

// Update UI Text safely avoiding float decimal glitches
function updateUI() {
    if (moneyDisplay) moneyDisplay.innerText = `$${gameState.money.toFixed(2)}`;
    if (incomeDisplay) incomeDisplay.innerText = `Income: +$${gameState.incomePerSecond.toFixed(2)}/s`;
}

// Render Shop Upgrades without overlapping prices or mismatched revenue values
function renderShop() {
    if (!shopContainer) return;
    shopContainer.innerHTML = '';
    
    shopUpgrades.forEach(item => {
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>Cost: $${item.cost}</p>
            <p>Generates: +$${item.revenueMultiplier}/s</p>
            <button onclick="buyUpgrade('${item.id}')" id="btn-${item.id}">Invest</button>
        `;
        shopContainer.appendChild(card);
    });
}

// Purchase Upgrade Logic
window.buyUpgrade = function(itemId) {
    const item = shopUpgrades.find(u => u.id === itemId);
    if (!item) return;

    if (gameState.money >= item.cost) {
        gameState.money -= item.cost;
        gameState.incomePerSecond += item.revenueMultiplier;
        updateUI();
        alert(`Successfully bought ${item.name}!`);
    } else {
        alert("Not enough cash to make this investment!");
    }
};

// Glitch-Free Canvas Drawing Logic
function initCanvas() {
    if (!ctx) return;
    
    // Set explicit internal resolutions matching display dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        // Client variables accurately tracked against current CSS scale
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        gameState.isDrawing = true;
        const coords = getCoords(e);
        gameState.lastX = coords.x;
        gameState.lastY = coords.y;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!gameState.isDrawing) return;
        const coords = getCoords(e);
        
        ctx.beginPath();
        ctx.moveTo(gameState.lastX, gameState.lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        
        gameState.lastX = coords.x;
        gameState.lastY = coords.y;
    });

    canvas.addEventListener('mouseup', () => gameState.isDrawing = false);
    canvas.addEventListener('mouseleave', () => gameState.isDrawing = false);
}

// Fire application launch
document.addEventListener('DOMContentLoaded', initGame);
