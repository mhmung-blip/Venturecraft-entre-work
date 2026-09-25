// --- CENTRAL DATA SYSTEM ---
let state = {
    cash: 1000,
    dropshipping: { assets: [] },
    local: { style: 'food', stock: 10, footTraffic: 12 },
    farm: { wheatSeeds: 5, tomatoSeeds: 3, rawWheat: 0, rawTomato: 0, preparedBread: 0, preparedPasta: 0 },
    upgrades: { copywriting: 0, pixel: 0, lights: 0, hydroponics: 0 }
};

// Grid configuration initialization matrix
let farmPlots = Array(6).fill(null).map(() => ({ condition: 'empty', type: '', progress: 0 }));

// Load local profile settings seamlessly if present
if (localStorage.getItem('venturecraft_save')) {
    try {
        const loadedState = JSON.parse(localStorage.getItem('venturecraft_save'));
        if (loadedState && typeof loadedState.cash === 'number') {
            state = { ...state, ...loadedState };
        }
    } catch(e) { console.error("Profile structural parsing exception; resetting cache."); }
}

// --- ENGINE VIEW ROUTING ---
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    saveProfile();
    refreshUI();
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
}

// Fixed function layout
function resetGame() {
    if(confirm("Wipe all tracking metrics and start completely clean?")) {
        localStorage.clear();
        location.reload();
    }
}

function startMode(mode) {
    switchScreen(`${mode}-screen`);
    if(mode === 'farm') renderFields();
}

function saveProfile() {
    localStorage.setItem('venturecraft_save', JSON.stringify(state));
}

function refreshUI() {
    // Sync all global text displays matching query selectors
    document.querySelectorAll('.global-cash-display').forEach(el => el.innerText = state.cash);
    
    // Mode UI Updates
    document.getElementById('drop-count').innerText = state.dropshipping.assets.length;
    document.getElementById('local-type-display').innerText = state.local.style === 'food' ? '🌮 Gourmet Food Truck' : '⚡ Custom Electronics';
    document.getElementById('local-inv').innerText = state.local.stock;
    document.getElementById('local-traffic-display').innerText = state.local.footTraffic;

    document.getElementById('farm-seeds-w').innerText = state.farm.wheatSeeds;
    document.getElementById('farm-seeds-t').innerText = state.farm.tomatoSeeds;
    document.getElementById('inv-wheat').innerText = state.farm.rawWheat;
    document.getElementById('inv-tomato').innerText = state.farm.rawTomato;
    document.getElementById('inv-bread').innerText = state.farm.preparedBread;
    document.getElementById('inv-pasta').innerText = state.farm.preparedPasta;

    // Upgrades Pricing Framework Displays
    document.getElementById('up-copy-lvl').innerText = state.upgrades.copywriting;
    document.getElementById('up-copy-cost').innerText = (state.upgrades.copywriting + 1) * 200;
    document.getElementById('up-pixel-lvl').innerText = state.upgrades.pixel;
    document.getElementById('up-pixel-cost').innerText = (state.upgrades.pixel + 1) * 350;
    document.getElementById('up-lights-lvl').innerText = state.upgrades.lights;
    document.getElementById('up-lights-cost').innerText = (state.upgrades.lights + 1) * 250;
    document.getElementById('up-hydro-lvl').innerText = state.upgrades.hydroponics;
    document.getElementById('up-hydro-cost').innerText = (state.upgrades.hydroponics + 1) * 300;
}

// --- INTERACTIVE DRAWING FRAMEWORK ---
const board = document.getElementById('productCanvas');
let drawEngine = board ? board.getContext('2d') : null;
let painting = false;
let currentPenColor = '#000000';

if (board && drawEngine) {
    board.addEventListener('mousedown', () => painting = true);
    board.addEventListener('mouseup', () => { painting = false; drawEngine.beginPath(); });
    board.addEventListener('mousemove', processStroke);
}

function setCanvasColor(hex) {
    currentPenColor = hex;
}

function processStroke(e) {
    if (!painting || !drawEngine) return;
    drawEngine.lineWidth = 4;
    drawEngine.lineCap = 'round';
    drawEngine.strokeStyle = currentPenColor;
    
    const dimensions = board.getBoundingClientRect();
    drawEngine.lineTo(e.clientX - dimensions.left, e.clientY - dimensions.top);
    drawEngine.stroke();
    drawEngine.beginPath();
    drawEngine.moveTo(e.clientX - dimensions.left, e.clientY - dimensions.top);
}

function clearCanvas() {
    if(drawEngine) drawEngine.clearRect(0, 0, board.width, board.height);
}

// --- DROPSHIPPING CONSUMER PSYCHOLOGY ENGINE ---
function saveProduct() {
    const titleBox = document.getElementById('drop-name');
    const costBox = document.getElementById('drop-price');
    const descBox = document.getElementById('drop-desc');
    
    if(!titleBox.value || !costBox.value || !descBox.value) {
        return alert("Error: Title, Price, and Ad Copy Pitch Description must be entered!");
    }

    const price = parseFloat(costBox.value);
    const textPitch = descBox.value.toLowerCase();

    // 🧠 Evaluation Formulation
    let pitchScore = 15; // Baseline value
    if (textPitch.length > 50) pitchScore += 25;
    if (textPitch.length > 120) pitchScore += 20;
    
    // Strategic copy parameter evaluations
    if (textPitch.includes("premium") || textPitch.includes("luxury")) pitchScore += 15;
    if (textPitch.includes("durable") || textPitch.includes("high quality")) pitchScore += 15;
    if (textPitch.includes("organic") || textPitch.includes("eco")) pitchScore += 15;

    // Apply corporate upgrades modification bonuses
    pitchScore += (state.upgrades.copywriting * 15);

    // Dynamic Consumer Threshold Calculation
    let targetCommodityValue = 35; 
    let costSensitivyPenalty = (state.upgrades.pixel * 10);
    let conversionProbability = pitchScore - (price / (2 + (costSensitivyPenalty / 10)));

    if(conversionProbability < 5) conversionProbability = 0; // The item fails value verification criteria
    if(price > 180) conversionProbability = 0; // Absolute ceiling cost ceiling rejection

    state.dropshipping.assets.push({
        title: titleBox.value,
        cost: price,
        conversionChance: Math.min(conversionProbability, 95)
    });

    const stream = document.getElementById('drop-feed');
    stream.innerHTML = `<div style="color:#2196f3;">[SYS] SKU Campaign Active: "${titleBox.value}" launched. Computed conversion rating: ${Math.round(conversionProbability)}%</div>` + stream.innerHTML;
    
    titleBox.value = '';
    costBox.value = '';
    descBox.value = '';
    clearCanvas();
    saveProfile();
    refreshUI();
}

// Dropshipping Automated Loop Logic Engine
setInterval(() => {
    if(state.dropshipping.assets.length > 0 && document.getElementById('dropshipping-screen').classList.contains('active')) {
        const item = state.dropshipping.assets[Math.floor(Math.random() * state.dropshipping.assets.length)];
        const roller = Math.random() * 100;
        const stream = document.getElementById('drop-feed');

        if(roller < item.conversionChance) {
            const wholesaleCost = Math.round(item.cost * 0.4);
            const netProfit = Math.round(item.cost - wholesaleCost);
            state.cash += netProfit;
            stream.innerHTML = `<div style="color:#4caf50;">✔ Conversion! Guest purchased 1x "${item.title}". Net: +$${netProfit}</div>` + stream.innerHTML;
        } else {
            stream.innerHTML = `<div style="color:#888;">&bull; Shopper abandoned cart for "${item.title}". Reason: Price too high or poor copy value intuition.</div>` + stream.innerHTML;
        }
        
        // Truncate ticker feed lists to maximize efficiency
        if(stream.children.length > 10) stream.removeChild(stream.lastChild);
        refreshUI();
    }
}, 3800);

// --- LOCAL RETAIL MANAGEMENT WITH DEPRECIATION ---
function changeNiche() {
    state.local.style = document.getElementById('local-niche-select').value;
    saveProfile();
    refreshUI();
}

function buyInventory() {
    if(state.cash >= 100) {
        state.cash -= 100;
        state.local.stock += 10;
        saveProfile();
        refreshUI();
    } else { alert("Insufficient corporate reserves for restocking orders."); }
}

function runMarketing() {
    if(state.cash >= 150) {
        state.cash -= 150;
        state.local.footTraffic += 10;
        saveProfile();
        refreshUI();
    } else { alert("Insufficient corporate capital balance for promotional expansion."); }
}

function simulateLocalSales() {
    if(state.local.footTraffic <= 0) {
        return alert("Foot traffic pools completely exhausted! You must deploy localized advertising to attract shoppers.");
    }
    if(state.local.stock <= 0) {
        document.getElementById('local-log').innerHTML = `<div style="color:#f44336;">⚠ Store failure: Customers left disappointed due to bare shelving units!</div>` + document.getElementById('local-log').innerHTML;
        return alert("Store shelves completely empty! Restock your wholesale stock holdings.");
    }

    const priceTarget = state.local.style === 'food' ? 25 : 75;
    
    // Wave calculations using upgrade logic parameters
    let maxBaseWave = 3 + state.upgrades.lights;
    let maximumProcessableSales = Math.min(state.local.stock, state.local.footTraffic, Math.floor(Math.random() * maxBaseWave + 1));
    
    if(maximumProcessableSales <= 0) maximumProcessableSales = 1;

    const aggregatePayout = maximumProcessableSales * priceTarget;
    state.cash += aggregatePayout;
    state.local.stock -= maximumProcessableSales;
    state.local.footTraffic -= maximumProcessableSales;

    document.getElementById('local-log').innerHTML = `<div style="color:#ff9800;">🏪 Store registers active. Processed ${maximumProcessableSales} buyers. Yielded: +$${aggregatePayout}</div>` + document.getElementById('local-log').innerHTML;
    saveProfile();
    refreshUI();
}

// --- AGRICULTURE SUPPLY GRID LOOP SYSTEM ---
function buySeeds(type) {
    if(type === 'wheat' && state.cash >= 25) {
        state.cash -= 25; state.farm.wheatSeeds += 5;
    } else if(type === 'tomato' && state.cash >= 35) {
        state.cash -= 35; state.farm.tomatoSeeds += 5;
    } else { return alert("Inadequate operational cash liquidity metrics!"); }
    saveProfile(); refreshUI();
}

function renderFields() {
    const container = document.getElementById('farm-grid');
    if(!container) return;
    container.innerHTML = '';
    
    farmPlots.forEach((plot, index) => {
        const element = document.createElement('div');
        element.className = `plot-card ${plot.condition}`;
        
        if(plot.condition === 'empty') {
            element.innerHTML = `
                <p style="margin:2px 0; font-size:0.85rem;">Fallow Acre</p>
                <div style="display:flex; flex-direction:column; gap:4px; margin-top:5px;">
                    <button class="btn" style="min-width:auto; padding:3px 8px; font-size:0.75rem; margin:0;" onclick="sowCrop(${index}, 'wheat')">🌾 Wheat</button>
                    <button class="btn" style="min-width:auto; padding:3px 8px; font-size:0.75rem; margin:0; background:#cc1d1d;" onclick="sowCrop(${index}, 'tomato')">🍅 Tomato</button>
                </div>`;
        } else if(plot.condition === 'growing') {
            element.innerHTML = `<p>🌱 ${plot.type === 'wheat' ? 'Wheat' : 'Tomato'}</p><span style="font-size:0.8rem; color:#2196f3;">Germinating...</span>`;
        } else if(plot.condition === 'ready') {
            element.innerHTML = `
                <p>✨ Matured ${plot.type === 'wheat' ? 'Wheat' : 'Tomato'}</p>
                <button class="btn" style="min-width:auto; padding:4px 10px; font-size:0.75rem; background:#ff9800; margin:5px 0 0 0;" onclick="reapCrop(${index})">✂ Harvest</button>`;
        }
        container.appendChild(element);
    });
}

function sowCrop(index, type) {
    if(type === 'wheat' && state.farm.wheatSeeds > 0) {
        state.farm.wheatSeeds--;
        farmPlots[index] = { condition: 'growing', type: 'wheat' };
    } else if(type === 'tomato' && state.farm.tomatoSeeds > 0) {
        state.farm.tomatoSeeds--;
        farmPlots[index] = { condition: 'growing', type: 'tomato' };
    } else { return alert("Silo seed supplies completely dry! Purchase more packages."); }

    renderFields();
    refreshUI();

    // Growth processing mechanics utilizing custom structural modification equations
    let baseTime = 6000; // 6 second base standard velocity
    let appliedVelocityReductions = state.upgrades.hydroponics * 1500; 
    let functionalGrowthTimer = Math.max(2000, baseTime - appliedVelocityReductions);

    setTimeout(() => {
        if(farmPlots[index] && farmPlots[index].condition === 'growing') {
            farmPlots[index].condition = 'ready';
            renderFields();
        }
    }, functionalGrowthTimer);
}

function reapCrop(index) {
    const harvestedType = farmPlots[index].type;
    if(harvestedType === 'wheat') state.farm.rawWheat++;
    else if(harvestedType === 'tomato') state.farm.rawTomato++;

    farmPlots[index] = { condition: 'empty', type: '', progress: 0 };
    renderFields();
    saveProfile();
    refreshUI();
}

function bakeBread() {
    if(state.farm.rawWheat >= 2) {
        state.farm.rawWheat -= 2;
        state.farm.preparedBread += 1;
        saveProfile(); refreshUI();
    } else { alert("Insufficient supplies: Milling loops require a minimum of 2 raw wheat items."); }
}

function cookPasta() {
    if(state.farm.rawWheat >= 1 && state.farm.rawTomato >= 2) {
        state.farm.rawWheat -= 1;
        state.farm.rawTomato -= 2;
        state.farm.preparedPasta += 1;
        saveProfile(); refreshUI();
    } else { alert("Insufficient ingredients: Manufacturing demands 1 wheat and 2 tomatoes."); }
}

function sellFarmGoods() {
    let salesYield = 0;
    let counts = { bread: state.farm.preparedBread, pasta: state.farm.preparedPasta };
    
    salesYield += counts.bread * 40;
    salesYield += counts.pasta * 95;

    if(salesYield <= 0) return alert("Your finished facility delivery bays are currently bare!");

    state.cash += salesYield;
    state.farm.preparedBread = 0;
    state.farm.preparedPasta = 0;

    alert(`Disbursed farm shipments successfully to localized suppliers! Realized Revenue: +$${salesYield}`);
    saveProfile();
    refreshUI();
}

// --- CENTRAL CONSOLIDATION UPGRADES ENGINE ---
function buyUpgrade(category) {
    let upgradeCost = 0;
    if(category === 'copywriting') {
        upgradeCost = (state.upgrades.copywriting + 1) * 200;
        if(state.cash >= upgradeCost) { state.cash -= upgradeCost; state.upgrades.copywriting++; }
        else { return alert("Insufficient capitalization assets."); }
    } else if(category === 'pixel') {
        upgradeCost = (state.upgrades.pixel + 1) * 350;
        if(state.cash >= upgradeCost) { state.cash -= upgradeCost; state.upgrades.pixel++; }
        else { return alert("Insufficient capitalization assets."); }
    } else if(category === 'lights') {
        upgradeCost = (state.upgrades.lights + 1) * 250;
        if(state.cash >= upgradeCost) { state.cash -= upgradeCost; state.upgrades.lights++; }
        else { return alert("Insufficient capitalization assets."); }
    } else if(category === 'hydroponics') {
        upgradeCost = (state.upgrades.hydroponics + 1) * 300;
        if(state.cash >= upgradeCost) { state.cash -= upgradeCost; state.upgrades.hydroponics++; }
        else { return alert("Insufficient capitalization assets."); }
    }
    saveProfile();
    refreshUI();
}