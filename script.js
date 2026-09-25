// --- CENTRAL MEMORY SYSTEM ---
let state = {
    cash: 1000,
    dropshipping: { assets: [] },
    local: { style: 'food', stock: 12, traction: 1.0 },
    farm: { seedCount: 5, grain: 0, loaves: 0, fields: Array(6).fill(null).map(() => ({condition: 'empty'})) }
};

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
    document.getElementById('drop-money').innerText = state.cash;
    document.getElementById('drop-count').innerText = state.dropshipping.assets.length;
    
    document.getElementById('local-money').innerText = state.cash;
    document.getElementById('local-type-display').innerText = state.local.style === 'food' ? '🌮 Food Truck' : '⚡ Gadget Store';
    document.getElementById('local-inv').innerText = state.local.stock;
    document.getElementById('local-marketing').innerText = state.local.traction.toFixed(1) + "x";

    document.getElementById('farm-money').innerText = state.cash;
    document.getElementById('farm-seeds').innerText = state.seedCount;
    document.getElementById('inv-wheat').innerText = state.grain;
    document.getElementById('inv-bread').innerText = state.loaves;
}

// --- INTERACTIVE DRAWING FRAMEWORK ---
const board = document.getElementById('productCanvas');
const drawEngine = board.getContext('2d');
let painting = false;

board.addEventListener('mousedown', () => painting = true);
board.addEventListener('mouseup', () => { painting = false; drawEngine.beginPath(); });
board.addEventListener('mousemove', processStroke);

function processStroke(e) {
    if (!painting) return;
    drawEngine.lineWidth = 4;
    drawEngine.lineCap = 'round';
    drawEngine.strokeStyle = document.body.classList.contains('light-theme') ? '#222' : '#4caf50';
    
    const dimensions = board.getBoundingClientRect();
    drawEngine.lineTo(e.clientX - dimensions.left, e.clientY - dimensions.top);
    drawEngine.stroke();
    drawEngine.beginPath();
    drawEngine.moveTo(e.clientX - dimensions.left, e.clientY - dimensions.top);
}

function clearCanvas() {
    drawEngine.clearRect(0, 0, board.width, board.height);
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
        const marginPayout = Math.round(targetedAsset.cost * 0.45);
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
    
    const targetUnitCost = state.local.style === 'food' ? 22 : 65;
    const volumeEquation = Math.min(state.local.stock, Math.floor(Math.random() * 3 + 1) * state.local.traction);
    const verifiedUnitsSold = Math.floor(volumeEquation) || 1;
    
    const grossReturn = verifiedUnitsSold * targetUnitCost;
    state.cash += grossReturn;
    state.local.stock -= verifiedUnitsSold;
    
    document.getElementById('local-log').innerHTML = `<div style="color:#ff9800;">🏪 Cash register rung. Checked out ${verifiedUnitsSold} customers. Revenue: +$${grossReturn}</div>` + document.getElementById('local-log').innerHTML;
    refreshUI();
}

// --- CORE MODULE 3: SUPPLY CHAIN FARM FIELD SYSTEM ---
function buySeeds() {
    if(state.cash >= 25) {
        state.cash -= 25;
        state.seedCount += 5;
        refreshUI();
    } else { alert("Inadequate investment assets for grain materials."); }
}

function renderFields() {
    const container = document.getElementById('farm-grid');
    container.innerHTML = '';
    state.farm.fields.forEach((field, index) => {
        const element = document.createElement('div');
        element.className = `plot-card ${field.condition}`;
        
        if(field.condition === 'empty') {
            element.innerHTML = `<p>Fallow Soil</p><button class="btn" style="min-width:auto; padding:5px 12px; font-size:0.8rem;" onclick="sowSeed(${index})">🌱 Plant</button>`;
        } else if(field.condition === 'growing') {
            element.innerHTML = `<p>🌾 Germinating...</p><span style="font-size:0.8rem; color:#888;">Sprouting Cycle</span>`;
        } else if(field.condition === 'ready') {
            element.innerHTML = `<p>🌾 Golden Wheat</p><button class="btn" style="min-width:auto; padding:5px 12px; font-size:0.8rem; background:#ff9800;" onclick="reapField(${index})">✂️ Harvest</button>`;
        }
        container.appendChild(element);
    });
}

function sowSeed(index) {
    if(state.seedCount > 0) {
        state.seedCount--;
        state.farm.fields[index] = { condition: 'growing' };
        renderFields();
        refreshUI();

        setTimeout(() => {
            if(state.farm.fields[index].condition === 'growing') {
                state.farm.fields[index] = { condition: 'ready' };
                renderFields();
            }
        }, 4000);
    } else { alert("Zero grain materials remaining in storage silos!"); }
}

function reapField(index) {
    state.farm.fields[index] = { condition: 'empty' };
    state.grain += 1;
    renderFields();
    refreshUI();
}

function bakeBread() {
    if(state.grain >= 2) {
        state.grain -= 2;
        state.loaves += 1;
        refreshUI();
    } else { alert("Milling operations demand at least 2 unprocessed grain units."); }
}

function sellBread() {
    if(state.loaves > 0) {
        state.loaves--;
        state.cash += 45;
        refreshUI();
    } else { alert("Bakery product racks empty!"); }
}