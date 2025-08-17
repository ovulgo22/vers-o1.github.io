const MAP_SIZE = 10;
const TILE_SIZE = 60;
let map = [];

function generateMap() {
    for(let y=0; y<MAP_SIZE; y++){
        let row = [];
        for(let x=0; x<MAP_SIZE; x++){
            let tileType = Math.floor(Math.random()*3);
            let level = tileType===2 ? 1 : 0;
            row.push({type: tileType, level: level});
        }
        map.push(row);
    }
}

function renderMap(ctx){
    for(let y=0; y<MAP_SIZE; y++){
        for(let x=0; x<MAP_SIZE; x++){
            let color;
            switch(map[y][x].type){
                case 0: color='#a3d3a2'; break;
                case 1: color='#f1c40f'; break;
                case 2: color='#e74c3c'; break;
            }
            ctx.fillStyle=color;
            ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-2, TILE_SIZE-2);

            if(map[y][x].type===2){
                ctx.fillStyle='#fff';
                ctx.font='16px Arial';
                ctx.fillText(map[y][x].level, x*TILE_SIZE+20, y*TILE_SIZE+35);
            }
        }
    }
}
