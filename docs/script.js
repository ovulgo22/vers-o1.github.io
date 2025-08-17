document.addEventListener('DOMContentLoaded', () => {
    // Estado inicial do jogo
    const gameState = {
        gold: 1000,
        food: 500,
        troops: 10,
        castleLevel: 1,
        farm: {
            level: 1,
            cost: 200,
            production: 5 // Comida por segundo
        },
        barracks: {
            level: 1,
            cost: 250,
            trainTimeModifier: 1.0 // 100% do tempo normal
        }
    };

    // Elementos da UI
    const ui = {
        gold: document.getElementById('gold-resource'),
        food: document.getElementById('food-resource'),
        troops: document.getElementById('troops-resource'),
        farmLevel: document.getElementById('farm-level'),
        farmCost: document.getElementById('farm-cost'),
        foodProduction: document.getElementById('food-production'),
        barracksLevel: document.getElementById('barracks-level'),
        barracksCost: document.getElementById('barracks-cost'),
        upgradeFarmBtn: document.getElementById('upgrade-farm-btn'),
        upgradeBarracksBtn: document.getElementById('upgrade-barracks-btn'),
        trainAmountInput: document.getElementById('train-amount'),
        trainTroopsBtn: document.getElementById('train-troops-btn'),
        battleBtn: document.getElementById('battle-btn'),
        battleReport: document.getElementById('battle-report'),
        battleResult: document.getElementById('battle-result'),
        closeReportBtn: document.getElementById('close-report-btn'),
    };

    // Atualiza a UI com os dados do gameState
    function updateUI() {
        ui.gold.textContent = `🪙 Ouro: ${Math.floor(gameState.gold)}`;
        ui.food.textContent = `🍎 Comida: ${Math.floor(gameState.food)}`;
        ui.troops.textContent = `⚔️ Tropas: ${gameState.troops}`;
        
        ui.farmLevel.textContent = gameState.farm.level;
        ui.farmCost.textContent = gameState.farm.cost;
        ui.foodProduction.textContent = gameState.farm.production;
        
        ui.barracksLevel.textContent = gameState.barracks.level;
        ui.barracksCost.textContent = gameState.barracks.cost;

        // Desabilita botões se não houver recursos suficientes
        ui.upgradeFarmBtn.disabled = gameState.gold < gameState.farm.cost;
        ui.upgradeBarracksBtn.disabled = gameState.gold < gameState.barracks.cost;
    }

    // Lógica para evoluir a fazenda
    ui.upgradeFarmBtn.addEventListener('click', () => {
        if (gameState.gold >= gameState.farm.cost) {
            gameState.gold -= gameState.farm.cost;
            gameState.farm.level++;
            gameState.farm.cost = Math.floor(gameState.farm.cost * 1.8);
            gameState.farm.production = Math.floor(gameState.farm.production * 1.5);
            updateUI();
        }
    });

    // Lógica para evoluir o quartel
    ui.upgradeBarracksBtn.addEventListener('click', () => {
        if (gameState.gold >= gameState.barracks.cost) {
            gameState.gold -= gameState.barracks.cost;
            gameState.barracks.level++;
            gameState.barracks.cost = Math.floor(gameState.barracks.cost * 2.0);
            gameState.barracks.trainTimeModifier *= 0.9; // Reduz o tempo de treino
            updateUI();
        }
    });

    // Lógica para treinar tropas
    ui.trainTroopsBtn.addEventListener('click', () => {
        const amount = parseInt(ui.trainAmountInput.value);
        if (isNaN(amount) || amount <= 0) return;

        const goldCost = amount * 50;
        const foodCost = amount * 25;

        if (gameState.gold >= goldCost && gameState.food >= foodCost) {
            gameState.gold -= goldCost;
            gameState.food -= foodCost;
            gameState.troops += amount;
            // Em um jogo complexo, haveria um tempo de treino
            updateUI();
        } else {
            alert('Recursos insuficientes para treinar tropas!');
        }
    });
    
    // Lógica da batalha
    ui.battleBtn.addEventListener('click', () => {
        if (gameState.troops <= 0) {
            alert("Você não tem tropas para batalhar!");
            return;
        }

        const troopsSent = gameState.troops;
        let troopsLost = 0;
        let goldGained = 0;
        let foodGained = 0;

        // Simulação de batalha simples
        const battlePower = troopsSent * (Math.random() * 0.5 + 0.7); // Fator de sorte
        const enemyPower = troopsSent * (Math.random() * 0.8 + 0.5);

        let resultText = '';
        if (battlePower > enemyPower) { // Vitória
            troopsLost = Math.floor(troopsSent * (Math.random() * 0.15)); // Perde até 15% das tropas
            goldGained = Math.floor(troopsSent * 20 * (Math.random() * 0.5 + 0.8));
            foodGained = Math.floor(troopsSent * 15 * (Math.random() * 0.5 + 0.8));
            resultText = `VITÓRIA! Você derrotou os bárbaros! <br><br> Tropas Perdidas: ${troopsLost} <br> Ouro Saqueado: ${goldGained} <br> Comida Saqueada: ${foodGained}`;
        } else { // Derrota
            troopsLost = Math.floor(troopsSent * (Math.random() * 0.4 + 0.3)); // Perde de 30% a 70%
            resultText = `DERROTA! Suas tropas foram superadas. <br><br> Tropas Perdidas: ${troopsLost}`;
        }
        
        gameState.troops -= troopsLost;
        gameState.gold += goldGained;
        gameState.food += foodGained;

        ui.battleResult.innerHTML = resultText;
        ui.battleReport.classList.remove('hidden');
        updateUI();
    });

    ui.closeReportBtn.addEventListener('click', () => {
        ui.battleReport.classList.add('hidden');
    });


    // Loop principal do jogo (game loop) para gerar recursos
    setInterval(() => {
        gameState.food += gameState.farm.production;
        gameState.gold += 1; // Produção base do castelo
        updateUI();
    }, 1000);

    // Inicia o jogo
    updateUI();
});
