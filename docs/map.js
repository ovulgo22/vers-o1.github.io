const MAP_SIZE = 10; // 10x10 tiles
const TILE_SIZE = 60;

let map = [];

function generateMap() {
    for(let y = 0; y < MAP_SIZE; y++) {
        let row = [];
        for(let x = 0; x < MAP_SIZE; x++) {
            // 0 = vazio, 1 = recurso, 2 = construção NPC
            let tileType = Math.floor(Math.random() * 3);
            row.push(tileType);
        }
        map.push(row);
    }
}

function renderMap(ctx) {
    for(let y = 0; y < MAP_SIZE; y++) {
        for(let x = 0; x < MAP_SIZE; x++) {
            switch(map[y][x]) {
                case 0: ctx.fillStyle = '#a3d3a2'; break; // grama
                case 1: ctx.fillStyle = '#f1c40f'; break; // recurso
                case 2: ctx.fillStyle = '#e74c3c'; break; // construção
            }
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE-2, TILE_SIZE-2);
        }
    }
}
