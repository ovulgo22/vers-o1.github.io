// --- FUNÇÃO DE FORMATAÇÃO DE NÚMEROS ---
function formatNumber(num) {
    if (num < 1000) return num.toFixed(0);
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
    const i = Math.floor(Math.log10(num) / 3);
    const value = (num / Math.pow(1000, i));
    return value.toFixed(2) + suffixes[i];
}

// --- ESTADO INICIAL DO JOGO ---
function getInitialGameState() {
    return {
        resources: {
            cobre: 0,
            ferro: 0,
        },
        // Controla se um recurso foi desbloqueado
        unlocked: {
            ferro: false
        },
        upgrades: {
            cobre: {
                click: { level: 1, cost: 10, baseCost: 10, costMultiplier: 1.5, power: 1 },
                idle: { level: 0, cost: 50, baseCost: 50, costMultiplier: 1.8, production: 0, baseProduction: 1 }
            },
            ferro: {
                click: { level: 1, cost: 25, baseCost: 25, costMultiplier: 1.6, power: 1 },
                idle: { level: 0, cost: 100, baseCost: 100, costMultiplier: 2.0, production: 0, baseProduction: 1 }
            }
        }
    };
}

let gameState = getInitialGameState();


// --- ELEMENTOS DO HTML (DOM) ---
const dom = {
    cobre: {
        count: document.getElementById('cobre-count'),
        perSecond: document.getElementById('cobre-per-second'),
        mineBtn: document.getElementById('mine-cobre-btn'),
        click: {
            level: document.getElementById('cobre-click-level'),
            cost: document.getElementById('cobre-click-cost'),
            btn: document.getElementById('buy-cobre-click-upgrade')
        },
        idle: {
            level: document.getElementById('cobre-idle-level'),
            cost: document.getElementById('cobre-idle-cost'),
            btn: document.getElementById('buy-cobre-idle-upgrade')
        }
    },
    ferro: {
        count: document.getElementById('ferro-count'),
        perSecond: document.getElementById('ferro-per-second'),
        mineBtn: document.getElementById('mine-ferro-btn'),
        container: document.getElementById('resource-section-ferro'),
        click: {
            level: document.getElementById('ferro-click-level'),
            cost: document.getElementById('ferro-click-cost'),
            btn: document.getElementById('buy-ferro-click-upgrade')
        },
        idle: {
            level: document.getElementById('ferro-idle-level'),
            cost: document.getElementById('ferro-idle-cost'),
            btn: document.getElementById('buy-ferro-idle-upgrade')
        }
    },
    saveBtn: document.getElementById('save-btn')
};


// --- FUNÇÕES DE LÓGICA DO JOGO ---

function mineResource(resourceName) {
    // Desbloqueia o Ferro se tiver cobre suficiente
    if (resourceName === 'ferro' && !gameState.unlocked.ferro && gameState.resources.cobre >= 100) {
        gameState.resources.cobre -= 100;
        gameState.unlocked.ferro = true;
        console.log("Ferro desbloqueado!");
    }
    
    if (resourceName === 'ferro' && !gameState.unlocked.ferro) return;

    const clickPower = gameState.upgrades[resourceName].click.power;
    gameState.resources[resourceName] += clickPower;
    updateDisplay();
}

function buyUpgrade(resourceName, upgradeType) {
    const upgrade = gameState.upgrades[resourceName][upgradeType];
    const resourceAmount = gameState.resources[resourceName];

    if (resourceAmount >= upgrade.cost) {
        gameState.resources[resourceName] -= upgrade.cost;
        upgrade.level++;

        if (upgradeType === 'click') {
            upgrade.power++;
            upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level - 1));
        } else if (upgradeType === 'idle') {
            upgrade.production += upgrade.baseProduction;
            upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
        }
        updateDisplay();
    }
}

// --- ATUALIZAÇÃO DA TELA ---

function updateDisplay() {
    // Atualiza Cobre
    dom.cobre.count.textContent = formatNumber(gameState.resources.cobre);
    dom.cobre.perSecond.textContent = formatNumber(gameState.upgrades.cobre.idle.production);
    dom.cobre.click.level.textContent = gameState.upgrades.cobre.click.level;
    dom.cobre.click.cost.textContent = formatNumber(gameState.upgrades.cobre.click.cost);
    dom.cobre.idle.level.textContent = gameState.upgrades.cobre.idle.level;
    dom.cobre.idle.cost.textContent = formatNumber(gameState.upgrades.cobre.idle.cost);

    // Atualiza Ferro (se desbloqueado)
    if (gameState.unlocked.ferro) {
        dom.ferro.container.style.display = 'block'; // Mostra a seção de ferro
        dom.ferro.mineBtn.textContent = 'Minerar Ferro';
        dom.ferro.count.textContent = formatNumber(gameState.resources.ferro);
        dom.ferro.perSecond.textContent = formatNumber(gameState.upgrades.ferro.idle.production);
        dom.ferro.click.level.textContent = gameState.upgrades.ferro.click.level;
        dom.ferro.click.cost.textContent = formatNumber(gameState.upgrades.ferro.click.cost) + ' Ferro';
        dom.ferro.idle.level.textContent = gameState.upgrades.ferro.idle.level;
        dom.ferro.idle.cost.textContent = formatNumber(gameState.upgrades.ferro.idle.cost) + ' Ferro';
    } else {
        dom.ferro.container.style.display = 'none'; // Esconde a seção de ferro
    }


    // Lógica para habilitar/desabilitar botões
    dom.cobre.click.btn.disabled = gameState.resources.cobre < gameState.upgrades.cobre.click.cost;
    dom.cobre.idle.btn.disabled = gameState.resources.cobre < gameState.upgrades.cobre.idle.cost;
    
    if (gameState.unlocked.ferro) {
        dom.ferro.mineBtn.disabled = false;
        dom.ferro.click.btn.disabled = gameState.resources.ferro < gameState.upgrades.ferro.click.cost;
        dom.ferro.idle.btn.disabled = gameState.resources.ferro < gameState.upgrades.ferro.idle.cost;
    } else {
        dom.ferro.mineBtn.disabled = gameState.resources.cobre < 100;
    }
}


// --- LOOP PRINCIPAL E SAVE/LOAD ---

function gameLoop() {
    gameState.resources.cobre += gameState.upgrades.cobre.idle.production;
    if (gameState.unlocked.ferro) {
        gameState.resources.ferro += gameState.upgrades.ferro.idle.production;
    }
    updateDisplay();
}

function saveGame() {
    localStorage.setItem('idleMinerSave', JSON.stringify(gameState));
    console.log("Jogo salvo!");
}

function loadGame() {
    const savedGame = localStorage.getItem('idleMinerSave');
    if (savedGame) {
        // Usamos Object.assign para fundir o save com o estado inicial.
        // Isso evita que o jogo quebre se adicionarmos novas variáveis em uma atualização.
        const loadedState = JSON.parse(savedGame);
        gameState = Object.assign(getInitialGameState(), loadedState);
    }
    console.log("Jogo carregado!");
}


// --- INICIALIZAÇÃO DO JOGO ---

// Adiciona os "escutadores" de eventos nos botões
dom.cobre.mineBtn.addEventListener('click', () => mineResource('cobre'));
dom.ferro.mineBtn.addEventListener('click', () => mineResource('ferro'));

dom.cobre.click.btn.addEventListener('click', () => buyUpgrade('cobre', 'click'));
dom.cobre.idle.btn.addEventListener('click', () => buyUpgrade('cobre', 'idle'));
dom.ferro.click.btn.addEventListener('click', () => buyUpgrade('ferro', 'click'));
dom.ferro.idle.btn.addEventListener('click', () => buyUpgrade('ferro', 'idle'));

dom.saveBtn.addEventListener('click', saveGame); // Botão de save manual

// Carrega o jogo
loadGame();

// Inicia os loops
setInterval(gameLoop, 1000); // Loop de produção a cada segundo
setInterval(saveGame, 10000); // Salva automaticamente a cada 10 segundos

// Atualiza a tela pela primeira vez
updateDisplay();
