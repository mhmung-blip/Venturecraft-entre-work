// --- CENTRAL MEMORY SYSTEM ---
let state = {
    cash: 1000,
    dropshipping: { assets: [] },
    local: { style: 'food', stock: 12, traction: 1.0 },
    farm: { 
        seeds: { wheat: 5, tomato: 2 }, 
        grain: 0, 
        tomatoCount: 0,
        loaves: 0, 
        pasta: 0,
        fields: Array(6).fill(null).map(() => ({condition: 'empty', crop: null, timer: 0})) 
    },
    upgrades: {
        dropTier: 0,
        localTier: 0,
        premiumFertilizer: false
    }
};

// LocalStorage Load Implementation
if(localStorage.getItem('venturecraft_save')) {
    try {
        state = JSON.parse(localStorage.getItem('venturecraft_save'));
    } catch(e) { console.log("Save load error, re-initializing."); }
}

function saveGame() {
    localStorage.setItem('venturecraft_save', JSON.stringify(state));
}

// --- NAVIGATION FRAMEWORK ---
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
}

function resetGame() {
    if(confirm("Wipe all active enterprise pipelines and start clean?")) {
        localStorage.clear();
        location.reload();
    }
}

function startMode(mode) {
    switchScreen(`${mode}-screen`);
    refreshUI();
    if(mode === 'farm') renderFields();
}

function refreshUI() {
    // Dynamic displays synchronisation
    document.querySelectorAll('.global-money-display').forEach(el => el.innerText = state.cash);
    
    // Dropshipping Screen
    document.getElementById('drop-count').innerText = state.dropshipping.assets.length;
    
    // Local Store Screen
    let styleText = '🌮 Food Truck';
    if(state.local.style === 'electronics') styleText = '⚡ Gadget Store';
    if(state.local.style === 'clothing') styleText = '👕 Streetwear';
    document.getElementById('local-type-display').innerText = styleText;
    document.getElementById('local-inv').innerText = state.local.stock;
    document.getElementById('local-marketing').innerText = (state.local.traction + (state.upgrades.localTier * 0.3)).toFixed(1) + "x";

    // Farming Screen
    document.getElementById('farm-seeds-wheat').innerText = state.farm.seeds.wheat;
    document.getElementById('farm-seeds-tomato').innerText = state.farm.seeds.tomato;
    document.getElementById('inv-wheat').innerText = state.farm.grain;
    document.getElementById('inv-tomato').innerText = state.farm.tomatoCount;
    document.getElementById('inv-bread').innerText = state.farm.loaves;
    document.getElementById('inv-pasta').innerText = state.farm.pasta;

    // Upgrade Elements
    document.getElementById('up-drop-tier').innerText = state.upgrades.dropTier;
    document.getElementById('up-local-tier').innerText = state.upgrades.localTier;
    document.getElementById('up-farm-tier').innerText = state.upgrades.premiumFertilizer ? "OWNED (50% Speed Boost)" : "Not Owned";
    
    document.getElementById('btn-up-drop').innerText = `Upgrade ($${300 + (state.upgrades.dropTier * 150)})`;
    document.getElementById('btn-up-local').innerText = `Upgrade ($${400 + (state.upgrades.localTier * 200)})`;
    if(state.upgrades.premiumFertilizer) {
        document.getElementById('btn-up-farm').disabled = true;
        document.getElementById('btn-up-farm').innerText = "Maxed Out";
    }

    saveGame();
}

// --- INTERACTIVE DRAWING FRAMEWORK ---
const board = document.getElementById('productCanvas');
if (board) {
    const drawEngine = board.getContext('2d');
    let painting = false;
    let currentBrushColor = '#4caf50';

    board.addEventListener('mousedown', () => painting = true);
    board.addEventListener('mouseup', () => { painting = false; drawEngine.beginPath(); });
    board.addEventListener('mousemove', processStroke);

    function processStroke(e) {
        if (!painting) return;
        drawEngine.lineWidth = 4;
        drawEngine.lineCap = 'round';
        drawEngine.strokeStyle = currentBrushColor;
        
        const dimensions = board.getBoundingClientRect();
        drawEngine.lineTo(e.clientX - dimensions.left, e.clientY - dimensions.top);
        drawEngine.stroke();
        drawEngine.beginPath();
        drawEngine.moveTo(e.clientX - dimensions.left, e.clientY - dimensions.top);
    }

    function setCanvasColor(color, element) {
        currentBrushColor = color;
        document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
        element.classList.add('active');
    }

    function clearCanvas() {
        drawEngine.clearRect(0, 0, board.width, board.height);
    }
}

// --- GLOBAL SHOP ENGINE ---
function buyUpgrade(type) {
    if(type === 'drop') {
        let cost = 300 + (state.upgrades.dropTier * 150);
        if(state.cash >= cost) {
            state.cash -= cost;
            state.upgrades.dropTier++;
        } else { alert("Insufficient funds!"); }
    }
    if(type === 'local') {
        let cost = 400 + (state.upgrades.localTier * 200);
        if(state.cash >= cost) {
            state.cash -= cost;
            state.upgrades.localTier++;
        } else { alert("Insufficient funds!"); }
    }
    if(type === 'farm') {
        let cost = 600;
        if(state.cash >= cost && !state.upgrades.premiumFertilizer) {
            state.cash -= cost;
            state.upgrades.premiumFertilizer = true;
        } else { alert("Insufficient funds or already maxed out!"); }
    }
    refreshUI();
}

// --- CORE MODULE 1: DROPSHIPPING SALES ENGINE ---
function saveProduct() {
    const titleBox = document.getElementById('drop-name');
    const costBox = document.getElementById('drop-price');
    
    if(!titleBox.value || !costBox.value) return alert("All product spec parameters must be initialized!");
    
    state.dropshipping.assets.push({
        title: titleBox.value,
        cost: parseFloat(costBox.value)
    });

    const stream = document.getElementById('drop-feed');
    stream.innerHTML = `<div style="color:#2196f3;">[SYSTEM] Pipeline activated: ${titleBox.value} @ $${costBox.value}</div>` + stream.innerHTML;
    
    titleBox.value = '';
    costBox.value = '';
    clearCanvas();
    refreshUI();
}

setInterval(() => {
    if(state.dropshipping.assets.length > 0 && document.getElementById('dropshipping-screen').classList.contains('active')) {
        const targetedAsset = state.dropshipping.assets[Math.floor(Math.random() * state.dropshipping.assets.length)];
        // Upgrades affect final margins
        let multiplier = 0.45 + (state.upgrades.dropTier * 0.15);
        const marginPayout = Math.round(targetedAsset.cost * multiplier);
        state.cash += marginPayout;
        
        const stream = document.getElementById('drop-feed');
        stream.innerHTML = `<div style="color:#4caf50;">✔ Incoming Order! Processed 1x ${targetedAsset.title}. Net payout: +$${marginPayout}</div>` + stream.innerHTML;
        refreshUI();
    }
}, 3500);

// --- CORE MODULE 2: LOCAL COMMERCE RETAIL INTERFACE ---
function changeNiche() {
    state.local.style = document.getElementById('local-niche-select').value;
    refreshUI();
}

function buyInventory() {
    if(state.cash >= 100) {
        state.cash -= 100;
        state.local.stock += 10;
        refreshUI();
    } else { alert("Insufficient funds to fulfill inventory purchases."); }
}

function runMarketing() {
    if(state.cash >= 150) {
        state.cash -= 150;
        state.local.traction += 0.4;
        refreshUI();
    } else { alert("Insufficient promotional expansion capital."); }
}

function simulateLocalSales() {
    if(state.local.stock <= 0) return alert("Store shelves exhausted! Place wholesale restock orders.");
    
    let targetUnitCost = 25; // Food truck
    if(state.local.style === 'electronics') targetUnitCost = 75;
    if(state.local.style === 'clothing') targetUnitCost = 45;

    let baseTraction = state.local.traction + (state.upgrades.localTier * 0.3);
    const volumeEquation = Math.min(state.local.stock, Math.floor(Math.random() * 3 + 1) * baseTraction);
    const verifiedUnitsSold = Math.floor(volumeEquation) || 1;
    
    const grossReturn = verifiedUnitsSold * targetUnitCost;
    state.cash += grossReturn;
    state.local.stock -= verifiedUnitsSold;
    
    document.getElementById('local-log').innerHTML = `<div style="color:#ff9800;">🏪 Cash register rung. Checked out ${verifiedUnitsSold} customers. Revenue: +$${grossReturn}</div>` + document.getElementById('local-log').innerHTML;
    refreshUI();
}

// --- CORE MODULE 3: SUPPLY CHAIN FARM FIELD SYSTEM ---
function buySeeds(crop) {
    if(crop === 'wheat' && state.cash >= 25) {
        state.cash -= 25;
        state.farm.seeds.wheat += 5;
    } else if(crop === 'tomato' && state.cash >= 40) {
        state.cash -= 40;
        state.farm.seeds.tomato += 5;
    } else { return alert("Inadequate cash investment assets."); }
    refreshUI();
}

function renderFields() {
    const container = document.getElementById('farm-grid');
    if(!container) return;
    container.innerHTML = '';
    state.farm.fields.forEach((field, index) => {
        const element = document.createElement('div');
        element.className = `plot-card ${field.condition}`;
        
        if(field.condition === 'empty') {
            element.innerHTML = `
                <p style="margin:2px 0;">Fallow Soil</p>
                <button class="btn" style="min-width:auto; padding:4px 8px; font-size:0.75rem; margin:2px;" onclick="sowSeed(${index}, 'wheat')">🌾 Wheat</button>
                <button class="btn" style="min-width:auto; padding:4px 8px; font-size:0.75rem; margin:2px; background:#e91e63;" onclick="sowSeed(${index}, 'tomato')">🍅 Tomato</button>
            `;
        } else if(field.condition === 'growing') {
            element.innerHTML = `<p>${field.crop === 'wheat' ? '🌾' : '🍅'} Growing...</p><span style="font-size:0.8rem; color:#888;">Sprouting Cycle</span>`;
        } else if(field.condition === 'ready') {
            element.innerHTML = `<p>Ripe ${field.crop === 'wheat' ? 'Wheat' : 'Tomato'}!</p><button class="btn" style="min-width:auto; padding:5px 12px; font-size:0.8rem; background:#ff9800;" onclick="reapField(${index})">✂️ Harvest</button>`;
        }
        container.appendChild(element);
    });
}

function sowSeed(index, crop) {
    if(state.farm.seeds[crop] > 0) {
        state.farm.seeds[crop]--;
        state.farm.fields[index] = { condition: 'growing', crop: crop };
        renderFields();
        refreshUI();

        let growthTime = state.upgrades.premiumFertilizer ? 2000 : 4000;
        setTimeout(() => {
            if(state.farm.fields[index] && state.farm.fields[index].condition === 'growing') {
                state.farm.fields[index].condition = 'ready';
                renderFields();
            }
        }, growthTime);
    } else { alert("Zero grain materials remaining in storage silos!"); }
}

function reapField(index) {
    let cropHarvested = state.farm.fields[index].crop;
    if(cropHarvested === 'wheat') state.farm.grain++;
    if(cropHarvested === 'tomato') state.farm.tomatoCount++;
    
    state.farm.fields[index] = { condition: 'empty', crop: null };
    renderFields();
    refreshUI();
}

function craftFood(dish) {
    if(dish === 'bread' && state.farm.grain >= 2) {
        state.farm.grain -= 2;
        state.farm.loaves++;
    } else if(dish === 'pasta' && state.farm.grain >= 1 && state.farm.tomatoCount >= 2) {
        state.farm.grain -= 1;
        state.farm.tomatoCount -= 2;
        state.farm.pasta++;
    } else { alert("Inadequate raw manufacturing materials!"); }
    refreshUI();
}

function sellFood(dish) {
    if(dish === 'bread' && state.farm.loaves > 0) {
        state.farm.loaves--;
        state.cash += 50;
    } else if(dish === 'pasta' && state.farm.pasta > 0) {
        state.farm.pasta--;
        state.cash += 120;
    } else { alert("No prepared items inside kitchen storage racks!"); }
    refreshUI();
}
