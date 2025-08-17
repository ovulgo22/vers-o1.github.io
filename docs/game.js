let config = {
    type: Phaser.AUTO,
    width: window.innerWidth*0.9,
    height: window.innerHeight*0.7,
    parent: 'game-container',
    scale: {mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH},
    scene: { preload, create, update }
};

let game = new Phaser.Game(config);
let ctxCanvas;
let player = {gold:100, wood:100, troops:5};

function preload(){
    // Aqui você pode carregar sprites futuros via this.load.image()
}

function create(){
    ctxCanvas = this.add.graphics();
    generateMap();
    drawMap();
    loadPlayerData();
    setupUI();
    setInterval(autoBattle, 5000); // batalhas automáticas
}

function update(){}

function drawMap(){ ctxCanvas.clear(); renderMap(ctxCanvas); }

function setupUI(){
    updateUI();
    document.getElementById('collect-resources').onclick = () => {
        player.gold+=Math.floor(Math.random()*50+20);
        player.wood+=Math.floor(Math.random()*30+10);
        updateUI();
        savePlayerData();
    };
    document.getElementById('train-troops').onclick = () => {
        if(player.gold>=20){player.gold-=20; player.troops+=1; updateUI(); savePlayerData();}
        else alert("Ouro insuficiente!");
    };
    document.getElementById('upgrade-building').onclick = () => {
        if(player.wood>=50){player.wood-=50; upgradeRandomBuilding(); updateUI(); drawMap(); savePlayerData();}
        else alert("Madeira insuficiente!");
    };
}

function updateUI(){
    document.getElementById('gold').innerText=player.gold;
    document.getElementById('wood').innerText=player.wood;
    document.getElementById('troops').innerText=player.troops;
}

function autoBattle(){
    for(let y=0;y<MAP_SIZE;y++){
        for(let x=0;x<MAP_SIZE;x++){
            if(map[y][x].type===2 && player.troops>0){
                player.troops--;
                player.gold+=10*map[y][x].level;
                player.wood+=5*map[y][x].level;
                map[y][x].level--;
                if(map[y][x].level<=0){map[y][x].type=1; map[y][x].level=0;}
            }
        }
    }
    updateUI();
    drawMap();
}

function upgradeRandomBuilding(){
    let buildings=[];
    for(let y=0;y<MAP_SIZE;y++){
        for(let x=0;x<MAP_SIZE;x++){
            if(map[y][x].type===2) buildings.push({x,y});
        }
    }
    if(buildings.length===0) return;
    let b=buildings[Math.floor(Math.random()*buildings.length)];
    map[b.y][b.x].level++;
}

function savePlayerData(){ localStorage.setItem('playerData', JSON.stringify(player)); }

function loadPlayerData(){ let data=localStorage.getItem('playerData'); if(data) player=JSON.parse(data); updateUI(); }
