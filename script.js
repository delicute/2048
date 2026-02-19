const grid_node = document.querySelector('.grid');
const score_node = document.querySelector(".score span");
const timer_node = document.querySelector(".timer span");
const reset = document.querySelector('.reset');
const message = document.querySelector(".message");
const container = document.querySelector(".container");
const italic = document.querySelector(".hint i");
let grid = [0,0,0,0,
            0,0,0,0,
            0,0,0,0,
            0,0,0,0];
let timer = 0;
let score = 0;
let timerInterval = null;
let gameState = "beginning";
let debug = false;
let tile = document.createElement("div");
tile.className="win-tile";
tile.innerHTML="2048";

for (let i = 0;i<16;i++){
    let tile = document.createElement("div");
    tile.className="void";
    grid_node.appendChild(tile);
}

reset.addEventListener("click", function(){
    if (confirm("Can you confirm?")) {
        reset_game();
    }
});

italic.addEventListener("mouseover",function(){
    italic.innerHTML = "&nbsp;&emsp;废话&emsp;&nbsp;";
})
italic.addEventListener("mouseleave",function(){
    italic.innerHTML = "nonsense";
})
document.addEventListener("keyup",function(event){
    if (gameState == "result")return;
    switch (event.key){
        case "w":
            moveUp();
            render();
            break;
        case "s":
            moveDown();
            render();
            break;
        case "a":
            moveLeft();
            render();
            break;
        case "d":
            moveRight();
            render();
            break;
    }
});

document.addEventListener("keydown",function(event){
    if (event.key == " " && gameState == "result"){
        message.style.opacity=0;
        message.style.zIndex=-1;
        reset_game();
    }
});
reset_game();

function reset_game(){
    score=0;
    timer=0;
    grid = [0,0,0,0,
            0,0,0,0,
            0,0,0,0,
            0,0,0,0];
    gameState = "beginning";
    tile.remove();
    render();
    addTile(2);
    startTimer();
}

function render(){
    score_node.innerHTML=score;
    let hours = Math.floor(timer / 3600);
    let minutes = Math.floor((timer % 3600)/60);
    let seconds = timer % 60; 
    timer_node.innerHTML= `${hours}'${minutes.toString().padStart(2,"0")}"${seconds.toString().padStart(2,"0")}`;
    for (let i in grid){
        let current = grid_node.children[i];
        if (grid[i] == 0){
            current.className="void";
            current.innerHTML="";
        } else{
            current.className = `tile-${grid[i]}`;
            current.innerHTML=grid[i];
        }
    }
    checkGameOver();
}

function random(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function addTile(num){
    let empty = [];
    for (let i in grid){
        if (grid[i] == 0)empty.push(i);
    }
    for (let i = 0;i<num;i++){
        let random_location = random(0,empty.length -1);
        let value = empty[random_location];
        grid[value] = Math.random()<0.9 ? 2 : 4;
        empty.splice(random_location,1);
    }
    render();
}

function moveLeft(){
    if (gameState == "beginning"){
        gameState = "running";
    }
    let original = grid.slice();
    for (let i = 0;i<4;i++){
        let original_data=[grid[i*4],grid[i*4+1],grid[i*4+2],grid[i*4+3]];

        let new_data = original_data.filter(i => i !==0);
        let change = new_data.slice();
        for (let i = 0;i<new_data.length-1;i++){
            if (new_data[i] == new_data[i+1]){
                new_data[i]*=2;
                score+=new_data[i];
                new_data.splice(i+1,1);
            }
        }

        while (new_data.length < 4){
            new_data.push(0);
        }

        for (let k = 0;k<4;k++){
            grid[i*4+k]=new_data[k];
        }
    }
    if (JSON.stringify(grid) !== JSON.stringify(original)){
        addTile(1);
    }
}

function moveRight(){
    mirror();
    moveLeft();
    mirror();
}

function moveUp(){
    rotateLeft();
    moveLeft();
    rotateRight();
}

function moveDown(){
    rotateRight();
    moveLeft();
    rotateLeft();
}

function mirror(){
    for (let i = 0;i<4;i++){
        let data=[grid[i*4],grid[i*4+1],grid[i*4+2],grid[i*4+3]];
        data.reverse();
        for (let k =0;k<4;k++){
            grid[i*4+k]=data[k];
        }
    }
}

function rotateLeft(){
    let temp = new Array(16);
    for (let i = 0;i<4;i++){
        for (let k =0;k<4;k++){
            temp[i*4+k]=grid[k*4+3-i];
        }
    }
    grid = temp;
}

function rotateRight(){
    let temp = new Array(16);
    for (let i = 0;i<4;i++){
        for (let k =0;k<4;k++){
            temp[i*4+k]=grid[(3-k)*4+i];
        }
    }
    grid = temp;
}

function startTimer(){
    if (timerInterval)clearInterval(timerInterval);
    timerInterval=setInterval(function(){
        if (gameState == "running"){
            timer++;
            render();
        }
    },1000)
}

function checkGameOver(){
    if (debug == true)return;
    for(let i in grid){
        if (grid[i]==0)return;
        if (grid[i]==2048){
            showMessage("success");
            return;
        }
    }
    for (let i=0;i<4;i++){
        for (let k=0;k<4;k++){
            if(k<3 && grid[i*4+k]==grid[i*4+k+1])return;
            if(i<3 && grid[i*4+k]==grid[i*4+4+k])return;
        }
    }
    showMessage("failure");
}

function showMessage(state){
    gameState = "result";
    message.style.zIndex=1;
    if (state == "success"){
        message.innerHTML=`
                        <span style="font-weight:800;font-size:60px;color:#FFD700;">Congratulations!</span>
                        <span>Your score is ${score}.</span>
                        <span>Timer: ${timer_node.innerHTML}.</span>
                        <span>And...nothing, right! Nothing.</span>
                        <span>Press Space to continue.</span>`;
        container.appendChild(tile);
    } else {
        message.innerHTML=`
                        <span style="font-weight:800;font-size:60px;color:#666;">Game over!</span>
                        <span>Your score is ${score}.</span>
                        <span>Timer: ${timer_node.innerHTML}.</span>
                        <span>Go ahead and retry it.</span>
                        <span>Press Space to continue.</span>`;
    }
    message.style.opacity=1;
}