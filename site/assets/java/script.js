$(window).load(function () {
    
    //Start loading assets
    setupGame();
    
});

$(document).ready(function() { 

    //Start loadingscreen
    loading = setInterval(setLoading, 400); 
    
});


/*
 *	VARS
 */
// Canvas vars
var c,
    ctx;

// Loading vars
var loading,
    loadingTimer = 1,
    assetsToLoad = 4,
    numAssetsLoaded = 0;

// assets vars
var backgroundImg,
    batSpritesheet,
    batDeathSpritesheet,
    crosshair,
    batSize = [198,117], //Bat size on the spritesheet
    batRenderSize = [125,75], //Bat size on the canvas
    batSpeed = [20,5];
    batFrames = [0, 1, 2, 3, 4, 3, 2, 1];

// Game vars
var mouseX,
    mouseY,
    clock,
    timePassed = 0,
    enemies = [], //Array holding all the bats
    score = 0,
    lastTime = new Date();
    

//settings vars
var HEIGHT = 600,
    WIDTH = 960;
    
/*
 *	VARS END
 */


/*
 *	LOADING
 */
function setLoading() {
    
    c = $("#gamecanvas").get(0);
    c.width = WIDTH;
    c.height = HEIGHT;
    ctx = c.getContext("2d");
    
    ctx.clearRect(0,0,960,600);
    ctx.font = "30px Arial";
    var gradient=ctx.createLinearGradient(0,0,570,0);
	gradient.addColorStop("0","magenta");
	gradient.addColorStop("0.5","blue");
	gradient.addColorStop("1.0","red");
    ctx.textAlign = "left";
    ctx.fillStyle = gradient;
    var temp = "";
    for (i=1;i<loadingTimer;i++) {
	temp = temp + ".";
    }
    ctx.fillText("Loading" + temp, 425,(c.height/2)+10);
    
    loadingTimer++;
    
    if (loadingTimer > 4) {
	loadingTimer = 1;
    };
}

function loadAssets() {
    
    backgroundImg = new Image();
    backgroundImg.onload = function() {
        assetLoaded();
    };
    backgroundImg.src = 'assets/media/background.png';
   
    batSpritesheet = new Image();
    batSpritesheet.onload = function() {
        assetLoaded();
    };
    batSpritesheet.src = 'assets/media/batSpritesheet.png';
    
    batDeathSpritesheet = new Image();
    batDeathSpritesheet.onload = function() {
        assetLoaded();
    };
    batDeathSpritesheet.src = 'assets/media/batDeath.png';
    
    crosshair = new Image();
    crosshair.onload = function() {
        assetLoaded();
    };
    crosshair.src = 'assets/media/crosshair.png'; 
}

function assetLoaded(){
    
    numAssetsLoaded++;
    if (numAssetsLoaded == assetsToLoad) {
	clearInterval(loading);
	
    var newEnemy = new Sprite(batSpritesheet, [100,100], batSize, batSpeed, batFrames, false, batRenderSize)
    enemies.push(newEnemy);
	
    main();
    
    };
}
/*
 *	LOADING END
 */


function setupGame() {
    
    c = $("#gamecanvas").get(0);
    c.width = WIDTH;
    c.height = HEIGHT;
    ctx = c.getContext("2d");
    
    c.addEventListener("mousemove", updateMousePos, false);
    
    loadAssets();
}

function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    
    update(dt);
    drawSet();

    lastTime = now;
    requestAnimationFrame(main);
}

function update(dt) {
    timePassed += dt;

    updateEntities(dt);
    
    //checkCollisions();    
}

function drawSet() {

    // draws background
    ctx.drawImage(backgroundImg, 0, 0, 960, 600);
    // draws score and time
    ctx.font="20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Time: " + timePassed, 870, 25);
    ctx.fillText("Score: " + score, 10, 25);
    // draw bats
    for (var i=0;i<enemies.length;i++){
	enemies[i].render();
    };
    // draws crosshair
    ctx.drawImage(crosshair, 0,0, crosshair.width, crosshair.height, mouseX-37, mouseY-37, 74, 74);
}

function updateMousePos(event) {
    
    var rect = c.getBoundingClientRect();
    mouseX = event.clientX - rect.left -0.5;
    mouseY = event.clientY - rect.top;
}

function updateEntities(dt) {
    for (var i=0;i<enemies.length;i++){
	enemies[i].update(dt);
    };
}

function Sprite(img, pos, size, speed, frames, once, renderSize) {

    this.pos = pos;
    this.size = size;
    this.speed = speed;
    this.frames = frames;
    this.frameIndex = 0;
    this._index = 0;
    this.img = img;
    this.once = once;

    // function updates info for each sprite
    this.update = function(dt) {
	this.pos[0] += this.speed[0]*dt;
	this.pos[1] += this.speed[1]*dt;
	this._index += dt*((this.speed[1]+this.speed[0])/2);
	
	var temp_index = Math.floor(this._index);
	
	if (temp_index >= this.frames.length) {
	    temp_index = 0;
	    this._index = 0;
	};
	
	this.frameIndex = this.frames[temp_index];
    }
    // function returns the render output for each sprite
    this.render = function() {
	var output;
	output = ctx.drawImage(img, this.size[0]*this.frameIndex, 0, this.size[0], this.size[1], this.pos[0], this.pos[1], renderSize[0], renderSize[1]);
	return output;
    }
}