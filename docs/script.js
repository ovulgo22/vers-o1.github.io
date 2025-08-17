document.addEventListener('DOMContentLoaded', () => {
    // EFEITOS SONOROS
    const sounds = {
        click: new Audio('https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-the-sound-pack-tree/tspt_generic_button_click_2.mp3'),
        upgrade: new Audio('https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-the-sound-pack-tree/tspt_power_up_12.mp3'),
        quest: new Audio('https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-little-robot-sound-factory/lrfs_notification_ding_1.mp3'),
        error: new Audio('https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-the-sound-pack-tree/tspt_electronic_deactivate_5.mp3')
    };
    const playSound = (sound) => { sounds[sound].currentTime = 0; sounds[sound].play().catch(e => {}); };

    // ESTADO INICIAL DO JOGO (GAME STATE)
    let gameState = {
        gold: 1000, food: 500, wood: 500, stone: 500,
        infantry: 10, cavalry: 0, archers: 0,
        buildings: {
            farm: { level: 1, cost: { food: 100, wood: 50 } },
            sawmill: { level: 1, cost: { food: 100, wood: 50 } },
            quarry: { level: 1, cost: { food: 150, wood: 100 } },
            warehouse: { level: 1, cost: { wood: 200, stone: 100 } },
            barracks: { level: 1, cost: { wood: 150, stone: 150 } },
            wall: { level: 0, cost: { stone: 500 } },
            academy: { level: 0, cost: { wood: 1000, stone: 1000 } },
            heroesHall: { level: 0, cost: { gold: 5000, wood: 2000 } },
        },
        research: {
            agriculture: { level: 0, maxLevel: 5, cost: { gold: 1000 }, bonus: 0.1 },
            logistics: { level: 0, maxLevel: 5, cost: { gold: 1200 }, bonus: 0.1 },
            swordsmanship: { level: 0, maxLevel: 5, cost: { gold: 2000 }, bonus: 0.05 },
        },
        hero: { name: 'Nenhum', bonus: { type: null, value: 0 } },
        quests: { currentIndex: 0 }
    };

    // BANCO DE DADOS DO JOGO (DEFINIÇÕES)
    const buildingInfo = {
        farm: { name: "Fazenda", production: { type: 'food', base: 5 } },
        sawmill: { name: "Serraria", production: { type: 'wood', base: 5 } },
        quarry: { name: "Pedreira", production: { type: 'stone', base: 3 } },
        warehouse: { name: "Armazém", capacity: { base: 10000 } },
        barracks: { name: "Quartel" },
        wall: { name: "Muralha", defense: { base: 0.02 } },
        academy: { name: "Academia" },
        heroesHall: { name: "Salão dos Heróis" }
    };

    const researchInfo = {
        agriculture: { name: "Agricultura", description: "Aumenta a produção de comida em 10% por nível." },
        logistics: { name: "Logística", description: "Aumenta a produção de madeira e pedra em 10% por nível." },
        swordsmanship: { name: "Esgrima", description: "Aumenta o ataque da Infantaria em 5% por nível." },
    };

    const quests = [
        { description: "Evolua a Fazenda para o Nível 2.", target: () => gameState.buildings.farm.level >= 2, reward: { gold: 200 } },
        { description: "Treine 20 Infantarias.", target: () => gameState.infantry >= 20, reward: { food: 500 } },
        { description: "Construa a Muralha (Nível 1).", target: () => gameState.buildings.wall.level >= 1, reward: { stone: 1000 } },
        { description: "Construa a Academia.", target: () => gameState.buildings.academy.level >= 1, reward: { gold: 2000 } },
        { description: "Pesquise Agricultura Nível 1.", target: () => gameState.research.agriculture.level >= 1, reward: { food: 5000 } }
    ];

    const troopInfo = {
        infantry: { name: "Infantaria", cost: { food: 25, wood: 10 }, strongAgainst: 'cavalry' },
        cavalry: { name: "Cavalaria", cost: { food: 50, wood: 20 }, strongAgainst: 'archers' },
        archers: { name: "Arqueiros", cost: { food: 30, wood: 25 }, strongAgainst: 'infantry' }
    };

    // Seletores da UI
    const ui = {
        gold: document.getElementById('gold-resource'),
        food: document.getElementById('food-resource'),
        wood: document.getElementById('wood-resource'),
        stone: document.getElementById('stone-resource'),
        infantry: document.getElementById('infantry-resource'),
        cavalry: document.getElementById('cavalry-resource'),
        archers: document.getElementById('archer-resource'),
        questDescription: document.getElementById('quest-description'),
        questProgress: document.getElementById('quest-progress'),
        modalBackdrop: document.getElementById('modal-backdrop'),
        researchModal: document.getElementById('research-modal'),
        trainModal: document.getElementById('train-modal'),
        battleReportModal: document.getElementById('battle-report-modal'),
        eventModal: document.getElementById('event-modal'),
    };
    
    // FUNÇÕES DE LÓGICA
    const getCapacity = () => buildingInfo.warehouse.capacity.base * gameState.buildings.warehouse.level;
    const getProduction = (type) => {
        const building = Object.values(buildingInfo).find(b => b.production?.type === type);
        const buildingState = gameState.buildings[Object.keys(buildingInfo).find(k => buildingInfo[k] === building)];
        let bonus = 1;
        if (type === 'food') bonus += gameState.research.agriculture.level * gameState.research.agriculture.bonus;
        if (type === 'wood' || type === 'stone') bonus += gameState.research.logistics.level * gameState.research.logistics.bonus;
        if (gameState.hero.bonus.type === type) bonus += gameState.hero.bonus.value;
        return building.production.base * buildingState.level * bonus;
    };
    const getWallDefense = () => gameState.buildings.wall.level * buildingInfo.wall.defense.base;

    const hasEnoughResources = (cost) => Object.entries(cost).every(([res, val]) => gameState[res] >= val);
    const deductResources = (cost) => Object.entries(cost).forEach(([res, val]) => gameState[res] -= val);

    // FUNÇÕES DE ATUALIZAÇÃO DA UI
    function updateAllUI() {
        const capacity = getCapacity();
        ui.gold.textContent = `🪙 Ouro: ${Math.floor(gameState.gold)}`;
        ui.food.textContent = `🍎 Comida: ${Math.floor(gameState.food)} / ${capacity}`;
        ui.wood.textContent = `🪵 Madeira: ${Math.floor(gameState.wood)} / ${capacity}`;
        ui.stone.textContent = `🪨 Pedra: ${Math.floor(gameState.stone)} / ${capacity}`;

        ui.infantry.textContent = `🛡️ Infantaria: ${gameState.infantry}`;
        ui.cavalry.textContent = `🐎 Cavalaria: ${gameState.cavalry}`;
        ui.archers.textContent = `🏹 Arqueiros: ${gameState.archers}`;

        // Atualizar info das construções
        for (const [key, state] of Object.entries(gameState.buildings)) {
            document.getElementById(`${key}-level`).textContent = state.level;
            const btn = document.getElementById(`upgrade-${key}-btn`) || document.getElementById(`open-${key}-modal-btn`);
            if (btn) btn.disabled = !hasEnoughResources(state.cost);
            if (key === 'farm') document.getElementById('food-production').textContent = getProduction('food').toFixed(1);
            if (key === 'sawmill') document.getElementById('wood-production').textContent = getProduction('wood').toFixed(1);
            if (key === 'quarry') document.getElementById('stone-production').textContent = getProduction('stone').toFixed(1);
            if (key === 'warehouse') document.getElementById('storage-capacity').textContent = capacity;
            if (key === 'wall') document.getElementById('wall-defense').textContent = (getWallDefense() * 100).toFixed(0);
        }

        document.getElementById('hero-name').textContent = `${gameState.hero.name}`;
        
        // Atualizar Missão
        const currentQuest = quests[gameState.quests.currentIndex];
        if(currentQuest) {
            ui.questDescription.textContent = currentQuest.description;
            // Lógica de progresso (simples)
            ui.questProgress.style.width = '0%';
        } else {
            ui.questDescription.textContent = "Todas as missões foram completadas!";
            ui.questProgress.style.width = '100%';
        }
    }

    // MODAIS
    function toggleModal(modal, show) {
        playSound('click');
        ui.modalBackdrop.classList.toggle('hidden', !show);
        modal.classList.toggle('hidden', !show);
    }
    document.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', () => {
        toggleModal(btn.closest('.modal'), false);
    }));

    // LÓGICA DE TREINO
    document.getElementById('open-train-modal-btn').addEventListener('click', () => {
        const container = document.getElementById('train-options');
        container.innerHTML = '';
        for (const [type, info] of Object.entries(troopInfo)) {
            container.innerHTML += `
                <div class="train-item">
                    <p><strong>${info.name}</strong></p>
                    <p class="cost">${Object.entries(info.cost).map(([res, val]) => `${val} ${res}`).join(', ')}</p>
                    <div>
                        <input type="number" id="train-${type}-amount" value="10" min="1" style="width: 50px; margin-right: 5px;">
                        <button data-type="${type}" class="train-btn">Treinar</button>
                    </div>
                </div>
            `;
        }
        toggleModal(ui.trainModal, true);
    });

    document.getElementById('train-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('train-btn')) {
            const type = e.target.dataset.type;
            const amount = parseInt(document.getElementById(`train-${type}-amount`).value);
            const totalCost = {};
            for (const [res, val] of Object.entries(troopInfo[type].cost)) {
                totalCost[res] = val * amount;
            }
            if (hasEnoughResources(totalCost)) {
                playSound('click');
                deductResources(totalCost);
                gameState[type] += amount;
                updateAllUI();
            } else {
                playSound('error');
                alert("Recursos insuficientes!");
            }
        }
    });

    // LÓGICA DE PESQUISA
    document.getElementById('open-research-modal-btn').addEventListener('click', () => {
        const container = document.getElementById('research-tree');
        container.innerHTML = '';
        if(gameState.buildings.academy.level === 0){
            container.innerHTML = '<p>Você precisa construir a Academia primeiro!</p>';
            toggleModal(ui.researchModal, true);
            return;
        }
        for (const [key, state] of Object.entries(gameState.research)) {
            const info = researchInfo[key];
            const currentBonus = (state.level * state.bonus * 100).toFixed(0);
            const nextBonus = ((state.level + 1) * state.bonus * 100).toFixed(0);
            const isMaxed = state.level >= state.maxLevel;
            container.innerHTML += `
                <div class="research-item">
                    <p><strong>${info.name} (Nível ${state.level})</strong><br><small>${info.description}</small></p>
                    <p>Bônus Atual: ${currentBonus}%<br><small class="cost">${isMaxed ? 'NÍVEL MÁXIMO' : `Custo: ${state.cost.gold} Ouro`}</small></p>
                    <button class="research-btn" data-key="${key}" ${isMaxed ? 'disabled' : ''}>${isMaxed ? 'MAX' : `Pesquisar (+${nextBonus - currentBonus}%)`}</button>
                </div>
            `;
        }
        toggleModal(ui.researchModal, true);
    });

    document.getElementById('research-modal').addEventListener('click', e => {
        if (e.target.classList.contains('research-btn')) {
            const key = e.target.dataset.key;
            const research = gameState.research[key];
            if (hasEnoughResources(research.cost)) {
                playSound('upgrade');
                deductResources(research.cost);
                research.level++;
                research.cost.gold = Math.floor(research.cost.gold * 2.5);
                e.target.closest('.modal').classList.add('hidden'); // Fecha e reabre pra atualizar
                ui.modalBackdrop.classList.add('hidden');
            } else {
                playSound('error');
                alert("Recursos insuficientes!");
            }
        }
    });

    // LÓGICA DE EVOLUÇÃO (UPGRADE)
    document.getElementById('buildings-grid').addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON' && e.target.id.startsWith('upgrade')) {
            const key = e.target.id.replace('upgrade-', '').replace('-btn', '');
            const building = gameState.buildings[key];
            if (hasEnoughResources(building.cost)) {
                playSound('upgrade');
                deductResources(building.cost);
                building.level++;
                Object.keys(building.cost).forEach(res => {
                    building.cost[res] = Math.floor(building.cost[res] * 1.7);
                });
                
                // Lógica especial ao construir pela primeira vez
                if (building.level === 1) {
                    if (key === 'academy') document.getElementById('open-research-modal-btn').disabled = false;
                    if (key === 'heroesHall') {
                        gameState.hero = { name: 'Sir Reginald', bonus: { type: 'food', value: 0.1 } };
                        document.getElementById('hero-name').textContent = gameState.hero.name + ' (+10% Comida)';
                    }
                }
                 if(key === 'heroesHall'){
                     gameState.hero.bonus.value += 0.05;
                      document.getElementById('hero-name').textContent = gameState.hero.name + ` (+${(gameState.hero.bonus.value*100).toFixed(0)}% Comida)`;
                 }

                updateAllUI();
            } else { playSound('error'); }
        }
    });
    
    // LÓGICA DE BATALHA
    document.getElementById('battle-btn').addEventListener('click', () => {
        const troopsToSend = {
            infantry: parseInt(document.getElementById('infantry-to-send').value) || 0,
            cavalry: parseInt(document.getElementById('cavalry-to-send').value) || 0,
            archers: parseInt(document.getElementById('archer-to-send').value) || 0,
        };
        if (Object.values(troopsToSend).every(v => v === 0)) return alert("Envie pelo menos uma tropa!");
        if (troopsToSend.infantry > gameState.infantry || troopsToSend.cavalry > gameState.cavalry || troopsToSend.archers > gameState.archers) {
            return alert("Você não tem tropas suficientes!");
        }

        // Simulação do inimigo
        const totalPlayerTroops = Object.values(troopsToSend).reduce((a, b) => a + b, 0);
        const enemyTroops = {
            infantry: Math.floor(totalPlayerTroops * (Math.random() * 0.5)),
            cavalry: Math.floor(totalPlayerTroops * (Math.random() * 0.5)),
            archers: Math.floor(totalPlayerTroops * (Math.random() * 0.5)),
        };

        // Cálculo de poder com vantagens
        const calculatePower = (army, opponentArmy) => {
            let power = 0;
            for (const [type, count] of Object.entries(army)) {
                let multiplier = 1;
                const strongAgainst = troopInfo[type].strongAgainst;
                if (opponentArmy[strongAgainst] > 0) multiplier = 1.5; // Bônus de vantagem
                power += count * multiplier;
            }
            return power;
        };

        const playerPower = calculatePower(troopsToSend, enemyTroops) * (1 + (gameState.research.swordsmanship.level * gameState.research.swordsmanship.bonus));
        const enemyPower = calculatePower(enemyTroops, troopsToSend);

        let losses = { infantry: 0, cavalry: 0, archers: 0 };
        let gains = { gold: 0, food: 0 };
        const resultDiv = document.getElementById('battle-result');

        if (playerPower > enemyPower) { // Vitória
            const lossRatio = Math.min(0.3, (enemyPower / playerPower) * 0.5) * (1 - getWallDefense());
            Object.keys(losses).forEach(type => losses[type] = Math.floor(troopsToSend[type] * lossRatio));
            gains.gold = Math.floor(totalPlayerTroops * 10);
            gains.food = Math.floor(totalPlayerTroops * 15);
            resultDiv.innerHTML = `
                <h3>VITÓRIA</h3>
                <div class="player-army">
                    <h4>Suas Tropas</h4>
                    <p class="losses">🛡️-${losses.infantry}</p>
                    <p class="losses">🐎-${losses.cavalry}</p>
                    <p class="losses">🏹-${losses.archers}</p>
                </div>
                <div style="font-size: 2em;">VS</div>
                <div class="enemy-army">
                    <h4>Exército Inimigo</h4>
                    <p>🛡️ ${enemyTroops.infantry}</p>
                    <p>🐎 ${enemyTroops.cavalry}</p>
                    <p>🏹 ${enemyTroops.archers}</p>
                </div>
                <div class="gains" style="grid-column: 1 / -1;">
                    <p>Recompensas: 🪙+${gains.gold} 🍎+${gains.food}</p>
                </div>
            `;
        } else { // Derrota
            const lossRatio = Math.min(0.8, (enemyPower / playerPower) * 0.6) * (1 - getWallDefense());
            Object.keys(losses).forEach(type => losses[type] = Math.floor(troopsToSend[type] * lossRatio));
             resultDiv.innerHTML = `<h3>DERROTA</h3>... (Relatório de derrota detalhado aqui)`;
        }

        // Aplicar resultados
        Object.keys(losses).forEach(type => gameState[type] -= losses[type]);
        gameState.gold += gains.gold;
        gameState.food += gains.food;
        
        toggleModal(ui.battleReportModal, true);
        updateAllUI();
    });
    
    // LOOP PRINCIPAL DO JOGO
    setInterval(() => {
        const capacity = getCapacity();
        gameState.food = Math.min(capacity, gameState.food + getProduction('food'));
        gameState.wood = Math.min(capacity, gameState.wood + getProduction('wood'));
        gameState.stone = Math.min(capacity, gameState.stone + getProduction('stone'));
        gameState.gold += 5; // Ouro base

        // Checar Missão
        const currentQuest = quests[gameState.quests.currentIndex];
        if (currentQuest && currentQuest.target()) {
            playSound('quest');
            gameState.quests.currentIndex++;
            Object.entries(currentQuest.reward).forEach(([res, val]) => gameState[res] += val);
            alert(`Missão Concluída: ${currentQuest.description}`);
        }
        updateAllUI();
    }, 1000);

    // EVENTOS ALEATÓRIOS
    setInterval(() => {
        const eventRoll = Math.random();
        if (eventRoll > 0.8) { // 20% de chance a cada 2 minutos
            const eventTitle = document.getElementById('event-title');
            const eventDesc = document.getElementById('event-description');
            if (Math.random() > 0.5) {
                const bonusGold = Math.floor(gameState.gold * 0.1);
                gameState.gold += bonusGold;
                eventTitle.textContent = "Prosperidade Inesperada!";
                eventDesc.textContent = `Seus coletores de impostos encontraram uma reserva esquecida! Você ganhou ${bonusGold} de ouro.`;
            } else {
                const lostFood = Math.floor(gameState.food * 0.1);
                gameState.food -= lostFood;
                eventTitle.textContent = "Ratos no Armazém!";
                eventDesc.textContent = `Uma infestação de ratos destruiu parte do seu estoque! Você perdeu ${lostFood} de comida.`;
            }
            toggleModal(ui.eventModal, true);
        }
    }, 120000); // A cada 2 minutos

    updateAllUI();
});
