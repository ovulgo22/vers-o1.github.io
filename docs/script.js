// --- ESTADO DO JOGO ---
// Usamos um objeto para guardar todas as variáveis importantes do jogo.
let gameState = {
    cobre: 0,
    cobrePorClique: 1,
    cobrePorSegundo: 0,
    clickUpgrade: {
        level: 1,
        cost: 10,
        baseCost: 10,
        costMultiplier: 1.5 // Custo aumenta 50% a cada nível
    },
    idleUpgrade: {
        level: 0,
        cost: 50,
        baseCost: 50,
        productionPerLevel: 1,
        costMultiplier: 1.8
    }
};

// --- ELEMENTOS DO HTML ---
// Pegamos referências para os elementos que vamos manipular.
const cobreCountElem = document.getElementById('cobre-count');
const cobrePerSecondElem = document.getElementById('cobre-per-second');
const mineCobreBtn = document.getElementById('mine-cobre-btn');

const clickUpgradeLevelElem = document.getElementById('click-upgrade-level');
const clickUpgradeCostElem = document.getElementById('click-upgrade-cost');
const buyClickUpgradeBtn = document.getElementById('buy-click-upgrade-btn');

const idleUpgradeLevelElem = document.getElementById('idle-upgrade-level');
const idleUpgradeCostElem = document.getElementById('idle-upgrade-cost');
const buyIdleUpgradeBtn = document.getElementById('buy-idle-upgrade-btn');


// --- FUNÇÕES DO JOGO ---

// Função chamada quando o botão de minerar é clicado
function mineCobre() {
    gameState.cobre += gameState.cobrePorClique;
    updateDisplay();
}

// Função para comprar o upgrade de clique
function buyClickUpgrade() {
    const upgrade = gameState.clickUpgrade;
    if (gameState.cobre >= upgrade.cost) {
        gameState.cobre -= upgrade.cost;
        upgrade.level++;
        gameState.cobrePorClique++;
        // Aumenta o custo para o próximo nível
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level -1));
        updateDisplay();
    }
}

// Função para comprar o upgrade de produção automática (idle)
function buyIdleUpgrade() {
    const upgrade = gameState.idleUpgrade;
    if (gameState.cobre >= upgrade.cost) {
        gameState.cobre -= upgrade.cost;
        upgrade.level++;
        gameState.cobrePorSegundo += upgrade.productionPerLevel;
         // Aumenta o custo para o próximo nível
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
        updateDisplay();
    }
}

// Função para atualizar todos os números na tela
function updateDisplay() {
    cobreCountElem.textContent = Math.floor(gameState.cobre);
    cobrePerSecondElem.textContent = gameState.cobrePorSegundo;

    clickUpgradeLevelElem.textContent = gameState.clickUpgrade.level;
    clickUpgradeCostElem.textContent = gameState.clickUpgrade.cost;

    idleUpgradeLevelElem.textContent = gameState.idleUpgrade.level;
    idleUpgradeCostElem.textContent = gameState.idleUpgrade.cost;
    
    // Desabilita os botões de compra se não tiver cobre suficiente
    buyClickUpgradeBtn.disabled = gameState.cobre < gameState.clickUpgrade.cost;
    buyIdleUpgradeBtn.disabled = gameState.cobre < gameState.idleUpgrade.cost;
}

// --- LOOP PRINCIPAL DO JOGO ---
// Esta função roda a cada segundo para adicionar a produção automática
function gameLoop() {
    gameState.cobre += gameState.cobrePorSegundo;
    updateDisplay();
}

// --- INICIALIZAÇÃO ---
// Adiciona os "escutadores" de eventos nos botões
mineCobreBtn.addEventListener('click', mineCobre);
buyClickUpgradeBtn.addEventListener('click', buyClickUpgrade);
buyIdleUpgradeBtn.addEventListener('click', buyIdleUpgrade);

// Inicia o loop do jogo, que vai rodar a cada 1000ms (1 segundo)
setInterval(gameLoop, 1000);

// Atualiza a tela pela primeira vez quando a página carrega
updateDisplay();
