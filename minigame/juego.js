
//constant declaration
const tiles = {
    wall : '#',
    player: '@',
    void: ' ',
    ice: '_',
    box: 'B',
    iceBox: 'V',
    goal: 'G',
    zombie: 'Z',
    ground: '.'
};

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var tile;
if(screenWidth < 1024){
    tile = 50; 
}
else{
    tile = 70;
}

canvas.style.alignContent;
document.getElementById("gameDiv").appendChild(canvas);

// game function declaration
function loadSprites() {
    const loadImage = (src) => {
        const image = new Image();
        image.src = src;
        return image;
    };

    const wall = loadImage("sprites/wall.png");
    const box = loadImage("sprites/box.png");
    const ground = loadImage("sprites/ground.png");
    const ice = loadImage("sprites/ice.png");
    const goal = loadImage("sprites/goal.png");
    const voidSprite = loadImage("sprites/void.png");
    const zombie = loadImage("sprites/zombie.png");
    const playerSprite = loadImage("sprites/txikiPedrit.png");
    const greatMessage = loadImage("greatMessage.png");
    const spriteMap = {
        [tiles.wall]: wall,
        [tiles.void]: voidSprite,
        [tiles.player]: playerSprite,
        [tiles.box]: box,
        [tiles.goal]: goal,
        [tiles.zombie]: zombie,
        [tiles.ice]: ice,
        [tiles.ground]: ground,
        ["greatMessage"]: greatMessage
    };

    return spriteMap;
};
async function loadLevels(){
    try {
        const response = await fetch('levels.json');
        maps = await response.json();
      } catch (error) {
        console.error('Error fetching the file:', error);
      }
};

function setLevel(id){
    map = Array.from(maps[id]);
    canvas.height = map.length * tile;
    canvas.width = map[0].length * tile;
}

function draw() {
    for (let j = 0; j < map.length; j++) {
        for (let i = 0; i < map[0].length; i++) {
            if (map[j][i] == tiles.player) {
                ctx.drawImage(spriteMap[player.buffer], i * tile, j * tile,tile,tile);
                ctx.drawImage(spriteMap[player.sprite], i * tile, j * tile,tile,tile);
            }
            else if (map[j][i] == tiles.zombie){
                let z = findEntityInPosition(zombies,i,j);
                ctx.drawImage(spriteMap[z.buffer], i * tile, j * tile,tile,tile);
                ctx.drawImage(spriteMap[z.sprite], i * tile, j * tile,tile,tile);
            }
             else {
                ctx.drawImage(spriteMap[map[j][i]], i * tile, j * tile,tile,tile);
            }
        }
    }
};
function setCharAt(str, index, char) {
    let aux1 = str.split('');
    aux1[index] = char;
    str = aux1.join('');
    return str
};

function findEntityInPosition(array,x,y){
    for(let i = 0; i <array.length; i++){
        if(array[i].x == x && array[i].y == y ){
            return array[i];
        }
    }
};

class entity{
    constructor(x,y,sprite,buffer){
        this.alive = true;
        this.x = x;
        this.y = y;
        this.buffer = buffer;
        this.sprite = sprite;
        this.direction;
        this.moveFailed = false;
    };
    
    
    move(dx,dy){
        let destX = this.x + dx;
        let destY = this.y + dy;   
        //console.log(this.buffer)
        switch(map[destY][destX]) {
            case tiles.box://this is a mess        
                let box = findEntityInPosition(boxes,this.x+dx,this.y+dy);
                if(map[destY+dy][destX+dx] == tiles.void){
                    box.sprite = tiles.void;
                    this.pushBox(box,dx,dy);
                }  
                else if([tiles.wall, tiles.box, tiles.player, tiles.zombie].includes(map[destY+dy][destX+dx])){
                    if(!this.moveFailed){ 
                        if(this.buffer == tiles.void){
                            this.sprite = tiles.void;
                            this.alive = false;
                            this.refreshGraphics(this.x, this.y);
                        }
                        if(this.sprite == tiles.zombie){
                            this.direction = this.direction.map(number => -number);
                            this.moveFailed = true;
                            this.move(this.direction[0],this.direction[1]);
                            
                        }
                    }
                }
                else if(map[destY+dy][destX+dx] != tiles.wall && map[destY+dy][destX+dx] != tiles.box ){
                    this.pushBox(box,dx,dy);                
                }
                if(this.buffer == tiles.ice){
                    this.buffer = tiles.void;
                } 
                draw()
                break;
            case tiles.void:
                this.sprite = tiles.void;
                this.refreshGraphics(destX, destY);
                this.alive = false;
                break;
            case tiles.ice: 
                this.refreshGraphics(destX, destY);
                this.buffer = tiles.void;
                break;
            case tiles.zombie:
                this.sprite = tiles.zombie;
                this.refreshGraphics(destX, destY);
                this.alive = false;
                break;
            case tiles.player:
                if(this.sprite === tiles.zombie){
                    player.sprite = tiles.zombie;
                    player.alive = false;
                    this.refreshGraphics(destX, destY);
                }
                break;
            default:
                if(map[destY][destX] !== tiles.wall) {
                    this.refreshGraphics(destX, destY);
                }
                else{
                    this.moveFailed = true;
                    if(this.buffer == tiles.void){
                        this.sprite = tiles.void;
                        this.alive = false;
                        
                    }
                    if(this.sprite == tiles.zombie){
                        this.direction = this.direction.map(number => -number);
                        
                        this.move(this.direction[0],this.direction[1])
                        this.refreshGraphics(this.x,this.y); 
                    }
                }
        }

    };
    
    refreshGraphics(destX,destY){
    
        map[this.y] = setCharAt(map[this.y] ,this.x,this.buffer)
        this.x = destX;
        this.y = destY;
        this.buffer = map[destY][destX];
        this.moveFailed = false;
        map[destY] = setCharAt(map[destY],destX,this.sprite);
    };


    pushBox(box,dx, dy){
        
        //update the graphic I'm in
        map[this.y] = setCharAt(map[this.y],this.x,this.buffer);
        //update the variables
        this.buffer = box.buffer;
        box.buffer = map[box.y+dy][box.x+dx];
        box.x += dx;
        box.y += dy;
        this.x += dx;
        this.y += dy;
        //update the graphic the box is moving to
        map[box.y] = setCharAt(map[box.y], box.x, box.sprite);
        //update the graphic im moving to
        map[this.y] = setCharAt(map[this.y],this.x,this.sprite);

    }

}
var map;
var maps;
var player;
var win;
var boxes = [];
var initialMap ;
var zombies = [];
var restarts = 0;
var currentLevel = 0;

function start(map){
    boxes= [];
    zombies = [];
    initialMap = Array.from(map);
    directions = {
        ['R']: [1,0],
        ['r']: [1,0],
        ['L']: [-1,0],
        ['l']: [-1,0],
        ['U']: [0,-1],
        ['u']: [0,-1],
        ['D']: [0,1],
        ['d']: [0,1]
    }
    for(let j = 0; j < map.length; j++){
        for(let i = 0; i < map[0].length; i++){
            if(map[j][i] == tiles.player){
                player = new entity(i,j,tiles.player,tiles.ground);
            }
            else if(map[j][i] == tiles.box){
                boxes.push(new entity(i,j,tiles.box,tiles.ground));
            }
            else if(map[j][i] == tiles.iceBox){
                boxes.push(new entity(i,j,tiles.box,tiles.ice));
                map[j] = setCharAt(map[j],i,tiles.box);
            }
            else if(['L','R','U','D','u','r','l','d'].includes(map[j][i])){
                let floor ;
                if(map[j][i] == map[j][i].toUpperCase()){
                    floor = tiles.ground;
                }
                else{
                    floor = tiles.ice;
                }
                let zombie = new entity(i,j,tiles.zombie, floor);
                zombie.direction = directions[map[j][i]];
                zombies.push(zombie);
                map[j] = setCharAt(map[j],i,tiles.zombie);
            }
        };
    };
    win = false;
    draw();
};
function sleepms(time){
    return new Promise(resolve => setTimeout(resolve, time));
};
async function update(dx,dy){
//for each entity updatePosition
    if(player.alive ){
        player.move(dx,dy);
        draw();
        await sleepms(100);
        if(!player.moveFailed && player.alive)
            {zombies.forEach(zombie => {
                if(zombie.alive){
                    zombie.move(zombie.direction[0],zombie.direction[1]);
                };
                
            });
        }
        if(player.buffer == tiles.goal){
            player.alive = false;
            win = true;
            console.log("Victory");
           
        }
    }
    if(!player.alive){
        console.log("Muerto")
    }
    draw();
    if(win){
        ctx.drawImage(spriteMap["greatMessage"], Math.round(canvas.width/2) - 181, Math.round(canvas.height/2) - 123);

    }
};

//Start 

var spriteMap = loadSprites();

loadLevels().then(async () => {
    let levelList = document.getElementById("levelList");
    let i = 1;
    for (let key in maps) {
        let item = document.createElement("li");
        item.id = "ListItemlevel" + (i - 1);
        (function (level) {
            item.addEventListener('click', async function () {
                await setLevel(level);
                start(map);
            });
        })(i - 1);
        item.textContent = "Level " + i;
        levelList.appendChild(item);
        i++;
    }
    await setLevel(0);
    await sleepms(100);
    start(map);
    draw();
}).catch(error => {
    console.error('Error:', error);
});

window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            update(0, -1);
            break;
        case 'ArrowDown':
            update(0, 1);
            break;
        case 'ArrowLeft':
            update(-1, 0);
            break;
        case 'ArrowRight':
            update(1, 0);
            break;
        case 'r':
            map = initialMap;
            start(initialMap);
            console.log("restart")
            break;
        case 'R':
            map = initialMap;
            start(initialMap);
            restarts++;
            console.log("restart")
            break;
    }
});