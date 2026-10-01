// --- CENTRAL DATA SYSTEM ---
let state = {
    cash: 1000.00,
    dropshipping: { assets: [] },
    local: { style: 'food', stock: 10, footTraffic: 12 },
    farm: { wheatSeeds: 5, tomatoSeeds: 3, rawWheat: 0, rawTomato: 0, preparedBread: 0, preparedPasta: 0 },
    upgrades: { copywriting: 0, pixel: 0, lights: 0, hydroponics: 0 }
};

let farmPlots = Array(6).fill(null).map(() => ({ condition: 'empty', type: '', progress: 0 }));

if (localStorage.getItem('venturecraft_save')) {
    try {
        const loadedState = JSON.parse(localStorage.getItem('venturecraft_save'));
        if (loadedState && typeof loadedState.cash === 'number') {
            state = { ...state, ...loadedState };
        }
    } catch(e) { console.error("Profile structural parsing exception; resetting cache."); }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    saveProfile();
    refreshUI();
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
}

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
    document.querySelectorAll('.global-cash-display').forEach(el => el.innerText = state.cash.toFixed(2));
    
    document.getElementById('drop-count').innerText = state.dropshipping.assets.length;
    document.getElementById('local-type-display').innerText = state.local.style === 'food' ? '🌮 Gourmet Food Truck' : '⚡ Custom Electronics';
    document.getElementById('local-inv').innerText = state.local.stock;
    document.getElementById('local-traffic-display').innerText = state.local.footTraffic + (state.upgrades.lights * 3);

    document.getElementById('farm-seeds-w').innerText = state.farm.wheatSeeds;
    document.getElementById('farm-seeds-t').innerText = state.farm.tomatoSeeds;
    document.getElementById('inv-wheat').innerText = state.farm.rawWheat;
    document.getElementById('inv-tomato').innerText = state.farm.rawTomato;
    document.getElementById('inv-bread').innerText = state.farm.preparedBread;
    document.getElementById('inv-pasta').innerText = state.farm.preparedPasta;

    document.getElementById('up-copy-lvl').innerText = state.upgrades.copywriting;
    document.getElementById('up-copy-cost').innerText = (state.upgrades.copywriting + 1) * 200;
    document.getElementById('up-pixel-lvl').innerText = state.upgrades.pixel;
    document.getElementById('up-pixel-cost').innerText = (state.upgrades.pixel + 1) * 350;
    document.getElementById('up-lights-lvl').innerText = state.upgrades.lights;
    document.getElementById('up-lights-cost').innerText = (state.upgrades.lights + 1) * 250;
    document.getElementById('up-hydro-lvl').innerText = state.upgrades.hydroponics;
    document.getElementById('up-hydro-cost').innerText = (state.upgrades.hydroponics + 1) * 300;
}

function buyUpgrade(type) {
    let cost = 0;
    if (type === 'copywriting') cost = (state.upgrades.copywriting + 1) * 200;
    if (type === 'pixel') cost = (state.upgrades.pixel + 1) * 350;
    if (type === 'lights') cost = (state.upgrades.lights + 1) * 250;
    if (type === 'hydroponics') cost = (state.upgrades.hydroponics + 1) * 300;

    if (state.cash >= cost) {
        state.cash = parseFloat((state.cash - cost).toFixed(2));
        state.upgrades[type]++;
        saveProfile();
        refreshUI();
    } else {
        alert("Insufficient capital available for this upgrade!");
    }
}

const board = document.getElementById('productCanvas');
let drawEngine = board ? board.getContext('2d') : null;
let painting = false;
let currentPenColor = '#000000';
let lastDrawX = 0, lastDrawY = 0;

if (board && drawEngine) {
    board.width = board.offsetWidth || 340;
    board.height = board.offsetHeight || 180;

    board.addEventListener('mousedown', (e) => { 
        painting = true; 
        const dimensions = board.getBoundingClientRect();
        lastDrawX = (e.clientX - dimensions.left) * (board.width / dimensions.width);
        lastDrawY = (e.clientY - dimensions.top) * (board.height / dimensions.height);
    });
    board.addEventListener('mouseup', () => painting = false);
    board.addEventListener('mouseleave', () => painting = false);
    board.addEventListener('mousemove', processStroke);
}

function setCanvasColor(hex) {
    currentPenColor = hex;
}

function processStroke(e) {
    if (!painting || !drawEngine) return;
    drawEngine.lineWidth = 4;
    drawEngine.lineCap = 'round';
    drawEngine.lineJoin = 'round';
    drawEngine.strokeStyle = currentPenColor;
    
    const dimensions = board.getBoundingClientRect();
    const currentX = (e.clientX - dimensions.left) * (board.width / dimensions.width);
    const currentY = (e.clientY - dimensions.top) * (board.height / dimensions.height);
    
    drawEngine.beginPath();
    drawEngine.moveTo(lastDrawX, lastDrawY);
    drawEngine.lineTo(currentX, currentY);
    drawEngine.stroke();
    
    lastDrawX = currentX;
    lastDrawY = currentY;
}

function clearCanvas() {
    if(drawEngine) drawEngine.clearRect(0, 0, board.width, board.height);
}

function saveProduct() {
    const titleBox = document.getElementById('drop-name');
    const costBox = document.getElementById('drop-price');
    const descBox = document.getElementById('drop-desc');
    
    if(!titleBox.value || !costBox.value || !descBox.value) {
        return alert("Error: Title, Price, and Ad Description must be entered!");
    }

    const price = parseFloat(costBox.value);
    const textPitch = descBox.value.toLowerCase();

    let pitchScore = 25; 
    if (textPitch.length > 25) pitchScore += 20;
    if (textPitch.length > 70) pitchScore += 20;
    
    if (textPitch.includes("premium") || textPitch.includes("luxury")) pitchScore += 15;
    if (textPitch.includes("durable") || textPitch.includes("high quality")) pitchScore += 15;
    if (textPitch.includes("organic") || textPitch.includes("eco")) pitchScore += 15;

    pitchScore += (state.upgrades.copywriting * 15);

    let costSensitivyPenalty = (state.upgrades.pixel * 10);
    let conversionProbability = pitchScore - (price / (3.0 + (costSensitivyPenalty / 10)));

    if(conversionProbability < 6) conversionProbability = 6;
    if(price > 400) conversionProbability = 1;

    state.dropshipping.assets.push({
        title: titleBox.value,
        cost: price,
        conversionChance: Math.min(conversionProbability, 95)
    });

    const stream = document.getElementById('drop-feed');
    stream.innerHTML = `<div style="color:#2196f3;">[SYS] SKU Campaign Active: "${titleBox.value}" launched. Conversion probability rate: ${Math.round(conversionProbability)}%</div>` + stream.innerHTML;
    
    titleBox.value = '';
    costBox.value = '';
    descBox.value = '';
    clearCanvas();
    saveProfile();
    refreshUI();
}

setInterval(() => {
    if(state.dropshipping.assets.length > 0 && document.getElementById('dropshipping-screen').classList.contains('active')) {
        const item = state.dropshipping.assets[Math.floor(Math.random() * state.dropshipping.assets.length)];
        const roller = Math.random() * 100;
        const stream = document.getElementById('drop-feed');

        if(roller < item.conversionChance) {
            const wholesaleCost = parseFloat((item.cost * 0.4).toFixed(2));
            const netProfit = parseFloat((item.cost - wholesaleCost).toFixed(2));
            state.cash = parseFloat((state.cash + netProfit).toFixed(2));
            stream.innerHTML = `<div style="color:#4caf50;">✔ Conversion! Guest bought 1x "${item.title}". Net: +$${netProfit}</div>` + stream.innerHTML;
        } else {
            stream.innerHTML = `<div style="color:#888;">&bull; Shopper abandoned cart for "${item.title}". Reason: Price too high or poor copy score.</div>` + stream.innerHTML;
        }
        if(stream.children.length > 10) stream.removeChild(stream.lastChild);
        refreshUI();
    }
}, 3800);

function changeNiche() {
    state.local.style = document.getElementById('local-niche-select').value;
    saveProfile();
    refreshUI();
}

function buyInventory() {
    if(state.cash >= 100) {
        state.cash = parseFloat((state.cash - 100).toFixed(2));
        state.local.stock += 10;
        saveProfile();
        refreshUI();
    }
}

setInterval(() => {
    if (document.getElementById('local-screen').classList.contains('active') && state.local.stock > 0) {
        const baseTraffic = state.local.footTraffic + (state.upgrades.lights * 3);
        if (Math.random() * 100 < (baseTraffic * 4)) {
            state.local.stock--;
            const itemValue = state.local.style === 'food' ? 25.00 : 75.00;
            state.cash = parseFloat((state.cash + itemValue).toFixed(2));
            
            const logBox = document.getElementById('local-feed');
            if (logBox) {
                logBox.innerHTML = `<div style="color:#4caf50;">✔ Customer made item purchase! Yielded +$${itemValue.toFixed(2)} cash.</div>` + logBox.innerHTML;
                if(logBox.children.length > 10) logBox.removeChild(logBox.lastChild);
            }
            refreshUI();
        }
    }
}, 3000);

function renderFields() {
    const grid = document.getElementById('farmPlotsContainer');
    if (!grid) return;
    grid.innerHTML = '';

    farmPlots.forEach((plot, idx) => {
        const plotCard = document.createElement('div');
        plotCard.className = `plot-card ${plot.condition}`;
        
        if (plot.condition === 'empty') {
            plotCard.innerHTML = `
                <h4>Plot ${idx + 1}</h4>
                <button class="btn" style="min-width:auto; padding:4px 8px; font-size:0.75rem;" onclick="plantCrop(${idx}, 'wheat')">Plant Wheat</button>
                <button class="btn" style="min-width:auto; padding:4px 8px; font-size:0.75rem; background:#ff9800;" onclick="plantCrop(${idx}, 'tomato')">Plant Tomato</button>
            `;
        } else if (plot.condition === 'growing') {
            plotCard.innerHTML = `<h4>Plot ${idx+1}</h4><p style="color:#2196f3; font-size:0.85rem;">Growing (${plot.progress}%)</p>`;
        } else if (plot.condition === 'ready') {
            plotCard.innerHTML = `<h4>Plot ${idx+1}</h4><button class="btn" style="min-width:auto; padding:5px 12px; font-size:0.8rem; background:#ff9800;" onclick="harvestCrop(${idx})">Harvest Crop</button>`;
        }
        grid.appendChild(plotCard);
    });
}

window.plantCrop = function(idx, type) {
    if (type === 'wheat' && state.farm.wheatSeeds > 0) {
        state.farm.wheatSeeds--;
        farmPlots[idx] = { condition: 'growing', type: 'wheat', progress: 0 };
    } else if (type === 'tomato' && state.farm.tomatoSeeds > 0) {
        state.farm.tomatoSeeds--;
        farmPlots[idx] = { condition: 'growing', type: 'tomato', progress: 0 };
    } else {
        return alert("You need to purchase more seeds of this variety first!");
    }
    renderFields();
    refreshUI();

    let speedBonus = 1 + (state.upgrades.hydroponics * 0.25);
    let interval = setInterval(() => {
        if (farmPlots[idx].progress < 100) {
            farmPlots[idx].progress += Math.round(10 * speedBonus);
            if (farmPlots[idx].progress >= 100) {
                farmPlots[idx].progress = 100;
                farmPlots[idx].condition = 'ready';
                clearInterval(interval);
                renderFields();
            }
            renderFields();
        }
    }, 800);
};

window.harvestCrop = function(idx) {
    const crop = farmPlots[idx];
    if (crop.type === 'wheat') state.farm.rawWheat += 2;
    if (crop.type === 'tomato') state.farm.rawTomato += 2;
    
    farmPlots[idx] = { condition: 'empty', type: '', progress: 0 };
    renderFields();
    refreshUI();
};

document.addEventListener('DOMContentLoaded', refreshUI);