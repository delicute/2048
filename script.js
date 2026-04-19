const gridN = document.querySelector('.grid');
const scoreN = document.querySelector(".score span");
const timerN = document.querySelector(".timer span");
const restartN = document.querySelector('.restart');
const message = document.querySelector(".message");
const container = document.querySelector(".container");
const italic = document.querySelector(".hint em");
const undoN = document.querySelector(".undo");
let lastGrid = null;
let grid = null;
let time = null;
let score = null;
let timer = null;
let ui = null;
let record = null;
let change = false;
let debug = false;

const undo = () => JSON.stringify(lastGrid) == JSON.stringify(grid);
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const size = 4;
const cells = size**2;
const winCondition = 2048;

for (let i = 0; i < cells; i++) {
  let tile = document.createElement("div");
  tile.className = "void";
  gridN.appendChild(tile);
}

restartN.addEventListener("click", () => {
  if (confirm("Can you confirm?")) reset();
});

italic.addEventListener("mouseover", () => {
  italic.innerHTML = "&nbsp;&emsp;废话&emsp;&nbsp;";
});
italic.addEventListener("mouseleave",() =>{
  italic.innerHTML = "nonsense";
});

undoN.addEventListener("click",()=>{
  if (undo())return;
  grid = lastGrid.slice();
  render();
});

document.addEventListener("keyup", event => {
  if (ui == "result") return;

  const moves = {
    "a": moveLeft,
    "d": () => {mirror();moveLeft();mirror();},
    "w": () => {rotateLeft();moveLeft();rotateRight();},
    "s": () => {rotateRight();moveLeft();rotateLeft();},
    "ArrowLeft": moveLeft,
    "ArrowRight": () => {mirror();moveLeft();mirror();},
    "ArrowUp": () => {rotateLeft();moveLeft();rotateRight();},
    "ArrowDown": () => {rotateRight();moveLeft();rotateLeft();},
  }
  
  const move = moves[event.key];
  if (move){
    let temp = grid.slice();
    move();
    if (change){
      change = 0;
      lastGrid = temp.slice();
      addTile(1);
    }
  }
});

document.addEventListener("keydown",event => {
  if (ui == "result") {
    if (event.key == " ") {
      message.style.opacity = 0;
      message.style.zIndex = -1;
      reset();
      return;
    }
    if (event.key == "z" && record == "success") {
      message.style.opacity = 0;
      message.style.zIndex = -1;
      ui = "running";
    }
  }
});
reset();

function reset() {
  score = 0;
  time = 0;
  grid = new Array(cells).fill(0);
  ui = "beginning";
  record = "unsettled";
  gridN.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  gridN.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  addTile(2);
  lastGrid = grid.slice();
  render();
  startTimer();
}

function render() {
  scoreN.innerHTML = score;
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor(time % 3600 / 60);
  let seconds = time % 60;
  timerN.innerHTML = `${hours}'${minutes.toString().padStart(2, "0")}"${seconds.toString().padStart(2, "0")}`;
  for (let i in grid) {
    let current = gridN.children[i];
    if (grid[i] == 0) {
      current.className = "void";
      current.innerHTML = "";
    } else {
      current.className = `tile-${grid[i]}`;
      current.innerHTML = grid[i];
    }
  }
  undoN.classList.remove("disabled");
  if (undo())undoN.classList.add("disabled");
  checkGameOver();
}

function addTile(num) {
  let empty = [];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0) empty.push(i);
  }
  for (let i = 0; i < num; i++) {
    let location = random(0, empty.length - 1);
    grid[empty[location]] = Math.random() < 0.9 ? 2 : 4;
    empty.splice(location, 1);
  }
  render();
}

function moveLeft() {
  if (ui == "beginning") ui = "running";
  let origin = grid.slice();
  change = false;
  for (let i = 0; i < size; i++) {
    let row = [];
    for (let col = 0;col<size;col++){
      row.push(grid[i*size+col]);
    }

    let new_data = row.filter(i => i !== 0);
    for (let i = 0; i < new_data.length - 1; i++) {
      if (new_data[i] == new_data[i + 1]) {
        new_data[i] *= 2;
        score += new_data[i];
        new_data.splice(i + 1, 1);
      }
    }

    while (new_data.length < size) {
      new_data.push(0);
    }

    for (let k = 0; k < size; k++) {
      grid[i * size + k] = new_data[k];
    }
  }
  if (JSON.stringify(grid) !== JSON.stringify(origin)) change = true;
}

function mirror() {
  for (let i = 0; i < size; i++) {
    let data = [];
    for (let col = 0; col < size; col++) {
      data.push(grid[i*size + col]);
    }
    data.reverse();
    for (let k = 0; k < size; k++) {
      grid[i*size + k] = data[k];
    }
  }
}

function rotateLeft() {
  let temp = new Array(cells);
  for (let i = 0; i < size; i++) {
    for (let k = 0; k < size; k++) {
      temp[i*size+k] = grid[k*size+size-1-i];
    }
  }
  grid = temp;
}

function rotateRight(){
  let temp = new Array(cells);
  for (let i = 0; i < size; i++) {
    for (let k = 0; k < size; k++) {
      temp[i*size+k] = grid[(size-1-k)*size+i];
    }
  }
  grid = temp;
}

function startTimer(){
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  timer = setInterval(()=>{
    if (ui == "running") {
      time++;
      render();
    }
  }, 1000)
}

function checkGameOver(){
  if (debug == true) return;
  if (grid.includes(winCondition) && record == "unsettled") {
    result("success");
    return;
  }
  if (grid.includes(0)) return;

  for (let i = 0; i < size; i++) {
    for (let k = 0; k < size; k++) {
      if (k < size-1 && grid[i*size+k] == grid[i*size+k+1]) return;
      if (i < size-1 && grid[i*size+k] == grid[i*size+size+k]) return;
    }
  }
  result("failure");
}

function result(state) {
  ui = "result";
  record = state;
  message.style.zIndex = 1;
  if (state == "success") {
    message.innerHTML = `
                        <span style="font-weight:800;font-size:60px;color:gold;">Congratulations!</span>
                        <span>Your score is ${score}.</span>
                        <span>Timer: ${timerN.innerHTML}.</span>
                        <span>And...nothing. <s>What did you expect?</s></span>
                        <span>Press <strong style="color:darkgray;">Space</strong> to restart.</span>
                        <span>Press <strong style="color:darkgray;">Z</strong> to continue.</span>`;
  } else {
    message.innerHTML = `
                        <span style="font-weight:800;font-size:60px;color:#666;">Game over!</span>
                        <span>Your score is ${score}.</span>
                        <span>Timer: ${timerN.innerHTML}.</span>
                        <span>A bit tough? Try it again.</span>
                        <span>Press <strong style="color:darkgray;">Space</strong> to restart.</span>`;
  }
  message.style.opacity = 1;
}