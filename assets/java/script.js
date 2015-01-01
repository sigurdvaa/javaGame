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
    assetsToLoad = 6,
    numAssetsLoaded = 0;

// assets vars
var backgroundImg,
    backgroundSound,
    batSpritesheet,
    batDeathSpritesheet,
    crosshair,
    batSize = [198,117], //Bat size on the spritesheet
    batRenderSize = [125,75], //Bat size on the canvas
    batSpeed = [100,50];
    batFrames = [0, 1, 2, 3, 4, 3, 2, 1];

// Game vars
var mouseX,
    mouseY,
    clock,
    timePassed = 0,
    enemies = [], //Array holding all the bats
    score = 0,
    batsKilled = 0,
    lastTime = new Date(),
    gunShotX,
    gunShotY,
    isSoundOn = true,
    isPlaying = true;
    

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
    
    backgroundSound = new Audio();
    backgroundSound.loop = true;
    backgroundSound.onloadeddata = function() {
        assetLoaded();
    };
    backgroundSound.src = 'assets/media/countryside.wav';
    
    gunShotSound = new Audio();
    gunShotSound.onloadeddata = function() {
        assetLoaded();
    };
    gunShotSound.src = 'assets/media/shot.wav';
}

function assetLoaded(){
    
    numAssetsLoaded++;
    if (numAssetsLoaded == assetsToLoad) {
	
	clearInterval(loading);
	//backgroundSound.play();
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
    
    c.onselectstart = function () { return false; }
    c.addEventListener("mousemove", updateMousePos, false);
    c.addEventListener("mousedown", fireGun, false);
    c.addEventListener("touchstart", fireGunTouch, false);
    
    loadAssets();
}

function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    
    if (isPlaying) {
	update(dt);
	drawSet();    
    };
    
    lastTime = now;
    requestAnimationFrame(main);
}

function update(dt) {
    
    timePassed += dt;

    if (enemies.length == 0) {
	var tempBat = new Sprite(batSpritesheet, [Math.random()*960,Math.random()*600], batSize, batSpeed, batFrames, false, batRenderSize);
	enemies.push(tempBat);
    }; 
    
    
    updateEntities(dt);
    
    checkCollisions();
    
    if (backgroundSound.currentTime > 11) {
	backgroundSound.currentTime = 1;
    };
  
}

function drawSet() {

    // draws background
    ctx.drawImage(backgroundImg, 0, 0, 960, 600);
    // draws score and time
    ctx.font="20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Time: " + parseInt(timePassed), 870, 25);
    ctx.fillText("Score: " + score, 10, 50);
    ctx.fillText("Bats killed: " + batsKilled, 10, 25);
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

	if (enemies[i].once == true) {
	    if (enemies[i].frameIndex == enemies[i].frames.length) {
		enemies.splice(i,1);
	    };
	};

    };
}

function fireGun() {
    gunShotX = mouseX;
    gunShotY = mouseY;
    
    if (isSoundOn) {
	gunShotSound.currentTime = 0;
	gunShotSound.play();
    };
}

function fireGunTouch(event) {
    var rect = c.getBoundingClientRect();
    gunShotX = event.clientX - rect.left -0.5;
    gunShotY = event.clientY - rect.top;
    
    if (isSoundOn) {
	gunShotSound.currentTime = 0;
	gunShotSound.play();
    };
}

function checkCollisions() {
    
    if (gunShotX != undefined) {
	for(var i=0;i<enemies.length;i++){
	    var hit = false;
	    var centerOfSpriteX = enemies[i].pos[0] + (enemies[i].renderSize[0]/2);
	    var centerOfSpriteY = enemies[i].pos[1] + (enemies[i].renderSize[1]/2);
	    var sizeX1over4 = enemies[i].renderSize[0]/4;
	    var sizeY1over2 = enemies[i].renderSize[1]/2;
	
	    if (gunShotX > centerOfSpriteX-sizeX1over4 && gunShotX < centerOfSpriteX+sizeX1over4) {
		if (gunShotY > centerOfSpriteY-sizeY1over2 && gunShotY < centerOfSpriteY+sizeY1over2) {
		    hit = true;
		};
	    };
	    
	    if (hit && enemies[i].once == false) {
		enemies[i].kill();
		score += 100;
		batsKilled++;
		batSpeed[0] *= 1.06;
		batSpeed[1] *= 1.05;
	    }else{
		score -= 10;
		batSpeed[0] *= 1.06;
		batSpeed[1] *= 1.05;
	    };
	    
	};
    
    };
    
    gunShotX = undefined;
    gunShotY = undefined; 
}

function Sprite(img, pos, size, speed, frames, once, renderSize) {

    this.pos = pos;
    this.size = size;
    this.speed = speed;
    this.frames = frames;
    this.frameIndex = 0;
    this._index = 0;
    this.img = img;
    this.renderSize = renderSize;
    this.once = once;
    
    // Bat killed
    this.kill = function() {
	
	this.img = batDeathSpritesheet;
	this.frames = [0,1,2,3,4,5,6];
	this.once = true;
	this.size = [198,148];
	this.frameIndex = 0;
	this._index = 0;
	this.speed = [0,0];

    }

    // function updates info for sprite
    this.update = function(dt) {
	
	var tempRndX = Math.random()*800;
	if (tempRndX < 1) {
	    this.speed[0] *= -1;
	};
	var tempRndY = Math.random()*800;
	if (tempRndY < 1) {
	    this.speed[1] *= -1;
	};
	
	if (this.speed[0] > 0) {
	    if (this.pos[0] + (this.speed[0]*dt) < (960-this.renderSize[0])) {
		this.pos[0] += this.speed[0]*dt;
	    }else{
		this.speed[0] *= -1;
	    };
	}else{
	    if (this.pos[0] + (this.speed[0]*dt) > 0) {
		this.pos[0] += this.speed[0]*dt;
	    }else{
		this.speed[0] *= -1;
	    };
	};
	
	if (this.speed[1] > 0) {
	    if (this.pos[1] + (this.speed[1]*dt) < (600-this.renderSize[1])) {
		this.pos[1] += this.speed[1]*dt;
	    }else{
		this.speed[1] *= -1;
	    };
	}else{
	    if (this.pos[1] + (this.speed[1]*dt) > 0) {
		this.pos[1] += this.speed[1]*dt;
	    }else{
		this.speed[1] *= -1;
	    };
	};
	
	if (!this.once) {
	    this._index += dt*((Math.abs(this.speed[1])+Math.abs(this.speed[0]))/12);
	    
	    var temp_index = Math.floor(this._index);
	    
	    if (temp_index >= this.frames.length) {
		temp_index = 0;
		this._index = 0;
	    };
	    
	    this.frameIndex = this.frames[temp_index];
	}else{ // .once is true if the bat has been .kill()
	    this._index += dt*10;
	    
	    var temp_index = Math.floor(this._index);
	    
	    if (temp_index < this.frames.length) {
		this.frameIndex = this.frames[temp_index];
	    }else{
		this.frameIndex = this.frames.length;
	    };	    
	};
    }
    
    // function returns output with rendermethod for sprite
    this.render = function() {
	
	var output;
	
	output = ctx.drawImage(this.img, this.size[0]*this.frameIndex, 0, this.size[0], this.size[1], this.pos[0], this.pos[1], this.renderSize[0], this.renderSize[1]);
	
	return output;
    }
}