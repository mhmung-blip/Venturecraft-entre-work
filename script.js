let state = {
    cash: 1000.00,
    dropshipping: { assets: [] },
    local: { style: 'food', stock: 10, footTraffic: 12 },
    farm: { wheatSeeds: 5, tomatoSeeds: 3, rawWheat: 0, rawTomato: 0, preparedBread: 0, preparedPasta: 0 },
    upgrades: { copywriting: 0, pixel: 0, lights: 0, hydroponics: 0 },
    stocks: {
        '67coin': { held: 0, priceHistory:, currentPrice: 10, baseVolatility: 0.15 },
        'Bitcoin': { held: 0, priceHistory:, currentPrice: 100, baseVolatility: 0.08 },
        'Moscoin': { held: 0, priceHistory:, currentPrice: 5, baseVolatility: 0.25 },
        'Gold': { held: 0, priceHistory:, currentPrice: 50, baseVolatility: 0.03 },
        'One Piece': { held: 0, priceHistory:, currentPrice: 1000, baseVolatility: 0.80 }
    }
};

let farmPlots = Array(6).fill(null).map(() => ({ condition: 'empty', type: '', progress: 0 }));

if (localStorage.getItem('venturecraft_save')) {
    try {
        const loadedState = JSON.parse(localStorage.getItem('venturecraft_save'));
        if (loadedState && typeof loadedState.cash === 'number') {
            state = { ...state, ...loadedState };
        }
    } catch(e) { console.error("Save error."); }
}

document.addEventListener('DOMContentLoaded', () => {
    refreshUI();
    initStockMarketHTML();
    initStockMarketLoop();
});

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    saveProfile();
    refreshUI();
    if (id === 'stock-screen') updateStockMarketVisuals();
}

function toggleTheme() { document.body.classList.toggle('light-theme'); }
function saveProfile() { localStorage.setItem('venturecraft_save', JSON.stringify(state)); }
function resetGame() { if(confirm("Wipe completely?")) { localStorage.clear(); location.reload(); } }
function startMode(mode) { switchScreen(`${mode}-screen`); if(mode === 'farm') renderFields(); }

function refreshUI() {
    document.querySelectorAll('.global-cash-display').forEach(el => el.innerText = state.cash.toFixed(2));
    if (document.getElementById('drop-count')) document.getElementById('drop-count').innerText = state.dropshipping.assets.length;
    if (document.getElementById('local-type-display')) document.getElementById('local-type-display').innerText = state.local.style === 'food' ? '🌮 Gourmet Food Truck' : '⚡ Custom Electronics';
    if (document.getElementById('local-inv')) document.getElementById('local-inv').innerText = state.local.stock;
    if (document.getElementById('local-traffic-display')) document.getElementById('local-traffic-display').innerText = state.local.footTraffic + (state.upgrades.lights * 3);
    if (document.getElementById('farm-seeds-w')) document.getElementById('farm-seeds-w').innerText = state.farm.wheatSeeds;
    if (document.getElementById('farm-seeds-t')) document.getElementById('farm-seeds-t').innerText = state.farm.tomatoSeeds;
    if (document.getElementById('inv-wheat')) document.getElementById('inv-wheat').innerText = state.farm.rawWheat;
    if (document.getElementById('inv-tomato')) document.getElementById('inv-tomato').innerText = state.farm.rawTomato;

    document.getElementById('up-copy-lvl').innerText = state.upgrades.copywriting;
    document.getElementById('up-copy-cost').innerText = state.upgrades.copywriting >= 10 ? 'MAX' : (state.upgrades.copywriting + 1) * 200;
    document.getElementById('up-pixel-lvl').innerText = state.upgrades.pixel;
    document.getElementById('up-pixel-cost').innerText = state.upgrades.pixel >= 10 ? 'MAX' : (state.upgrades.pixel + 1) * 350;
    document.getElementById('up-lights-lvl').innerText = state.upgrades.lights;
    document.getElementById('up-lights-cost').innerText = state.upgrades.lights >= 10 ? 'MAX' : (state.upgrades.lights + 1) * 250;
    document.getElementById('up-hydro-lvl').innerText = state.upgrades.hydroponics;
    document.getElementById('up-hydro-cost').innerText = state.upgrades.hydroponics >= 10 ? 'MAX' : (state.upgrades.hydroponics + 1) * 300;
}

function buyUpgrade(type) {
    let currentLvl = state.upgrades[type];
    if (currentLvl >= 10) return alert("Max Level 10 reached!");
    let cost = type === 'copywriting' ? (currentLvl + 1) * 200 : type === 'pixel' ? (currentLvl + 1) * 350 : type === 'lights' ? (currentLvl + 1) * 250 : (currentLvl + 1) * 300;
    if (state.cash >= cost) {
        state.cash = parseFloat((state.cash - cost).toFixed(2));
        state.upgrades[type]++;
        saveProfile(); refreshUI();
    } else { alert("Not enough money!"); }
}

function buySeeds(type) {
    if (type === 'wheat' && state.cash >= 10) { state.cash = parseFloat((state.cash - 10).toFixed(2)); state.farm.wheatSeeds += 5; }
    else if (type === 'tomato' && state.cash >= 25) { state.cash = parseFloat((state.cash - 25).toFixed(2)); state.farm.tomatoSeeds += 3; }
    else { return alert("Not enough cash for seeds!"); }
    saveProfile(); refreshUI();
}
function initStockMarketLoop() {
    setInterval(() => {
        let alerts = [];
        for (let name in state.stocks) {
            let asset = state.stocks[name]; 
            let change = (Math.random() - 0.48) * 2 * asset.baseVolatility;
            if (name === 'One Piece') { 
                if (Math.random() < 0.01) change = 8.0; 
                else change = (Math.random() - 0.65) * asset.baseVolatility; 
            }
            asset.currentPrice = Math.max(0.50, asset.currentPrice * (1 + change)); 
            asset.priceHistory.push(asset.currentPrice);
            if (asset.priceHistory.length > 15) asset.priceHistory.shift();
            if (change > 0.15 && asset.held > 0) alerts.push(`🔥 "${name}" is WANTED! Sell now!`);
        }
        let displayAlert = document.getElementById('market-notification');
        if (displayAlert) {
            if(alerts.length > 0 && document.getElementById('stock-screen').classList.contains('active')) {
                displayAlert.innerText = alerts.join(" | "); displayAlert.style.display = 'block';
            } else { displayAlert.style.display = 'none'; }
        }
        if (document.getElementById('stock-screen').classList.contains('active')) updateStockMarketVisuals();
    }, 6000);
}

function updateStockMarketVisuals() {
    for (let name in state.stocks) {
        let asset = state.stocks[name], id = name.replace(' ', '-'), hist = asset.priceHistory;
        let trend = hist.length > 1 ? hist[hist.length - 1] >= hist[hist.length - 2] : true, color = trend ? '#10b981' : '#ef4444';
        if (document.getElementById(`stock-card-${id}`)) document.getElementById(`stock-card-${id}`).style.borderColor = color;
        if (document.getElementById(`stock-name-${id}`)) document.getElementById(`stock-name-${id}`).style.color = color;
        if (document.getElementById(`stock-held-${id}`)) document.getElementById(`stock-held-${id}`).innerText = `Owned: ${asset.held.toFixed(2)}`;
        if (document.getElementById(`stock-price-${id}`)) { document.getElementById(`stock-price-${id}`).innerText = `$${asset.currentPrice.toFixed(2)}`; document.getElementById(`stock-price-${id}`).style.color = color; }
        if (document.getElementById(`stock-trend-${id}`)) { document.getElementById(`stock-trend-${id}`).innerText = trend ? '📈 WANTED' : '📉 UNWANTED'; document.getElementById(`stock-trend-${id}`).style.color = color; }
        if (document.getElementById(`stock-polyline-${id}`)) {
            let mn = Math.min(...hist), mx = Math.max(...hist), r = mx - mn === 0 ? 1 : mx - mn;
            let pts = hist.map((v, i) => `${(i / (hist.length - 1)) * 100},${40 - (((v - mn) / r) * 32 + 4)}`).join(' ');
            document.getElementById(`stock-polyline-${id}`).setAttribute('points', pts); document.getElementById(`stock-polyline-${id}`).setAttribute('stroke', color);
        }
    }
}

window.tradeAsset = function(name, action) {
    let asset = state.stocks[name], id = name.replace(' ', '-');
    if (action === 'buy') {
        let val = parseFloat(document.getElementById(`amt-buy-${id}`).value);
        if (isNaN(val) || val <= 0 || state.cash < val) return alert("Invalid entry or funds!");
        state.cash = parseFloat((state.cash - val).toFixed(2)); asset.held += (val / asset.currentPrice);
    } else {
        let units = parseFloat(document.getElementById(`amt-sell-${id}`).value);
        if (isNaN(units) || units <= 0 || asset.held < units) return alert("Invalid units!");
        state.cash = parseFloat((state.cash + (units * asset.currentPrice)).toFixed(2)); asset.held -= units;
    }
    document.getElementById(`amt-buy-${id}`).value = ''; document.getElementById(`amt-sell-${id}`).value = '';
    saveProfile(); refreshUI(); updateStockMarketVisuals();
};
