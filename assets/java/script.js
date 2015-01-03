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
    assetsToLoad = 8,
    numAssetsLoaded = 0;

// assets vars
var backgroundImg,
    backgroundSound,
    batSpritesheet,
    gunShotSound,
    gameOverSound,
    tickSound,
    batDieSound,
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
    score = undefined,
    batsKilled = 0,
    lastTime = new Date(),
    gunShotX,
    gunShotY,
    isSoundOn = true,
    isPlaying = false;
    

//settings vars
var HEIGHT = 600,
    WIDTH = 960,
    MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
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
    backgroundSound.volume = 0.4;
    backgroundSound.onloadeddata = function() {
        assetLoaded();
    };
    backgroundSound.src = 'assets/media/countryside.wav';
    backgroundSound.load();
    
    gunShotSound = new Audio();
    gunShotSound.volume = 0.3;
    gunShotSound.onloadeddata = function() {
        assetLoaded();
    };
    gunShotSound.src = 'assets/media/shot.wav';
    gunShotSound.load();
    
    batDieSound = new Audio();
    batDieSound.onloadeddata = function() {
        assetLoaded();
    };
    batDieSound.src = 'assets/media/die.wav';
    batDieSound.load();

    gameOverSound = new Audio();
    gameOverSound.onloadeddata = function() {
        assetLoaded();
    };
    gameOverSound.src = 'assets/media/gameOver.wav';
    gameOverSound.load();
}

function assetLoaded(){
    
    numAssetsLoaded++;
    if (numAssetsLoaded == assetsToLoad) {
	
	clearInterval(loading);
	
	if(MOBILE) {
	    isSoundOn = false;
	};
	backgroundSound.play();
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
    
    if(MOBILE) {
	c.addEventListener("touchstart", fireGunTouch, false);
    }else{
	c.addEventListener("mousedown", fireGun, false);
	c.addEventListener("mousemove", updateMousePos, false);
    };
    
    $('#btnstopgame').hide();
    
    loadAssets();
}

function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    
    if (isPlaying) {
	update(dt);
	drawSet();    
    }else{
	updatePause();
	drawPause();
    };
    
    if (backgroundSound.currentTime > 10) {
	backgroundSound.currentTime = 1;
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
  
}

function drawSet() {

    // draws background
    ctx.drawImage(backgroundImg, 0, 0, 960, 600);
    // draws score and time
    ctx.font="20px Arial";
    ctx.textAlign = "left";
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

function updatePause() {
    
    if (gunShotX!=undefined) {
	if (gunShotX > 410 && gunShotX < 410+145) {
	    if (gunShotY > 235 && gunShotY < 235+48) {
		isPlaying = true;
		resetGame();
	    }else if (gunShotY > 325 && gunShotY < 325+32) {
		if (!MOBILE) {
		    if (isSoundOn) {
			isSoundOn = false;
			backgroundSound.currentTime = 1;
			backgroundSound.pause();
		    }else{
			isSoundOn = true;
			backgroundSound.play();
		    };
		};
	    };
	};
	
	gunShotX = undefined;
	gunShotY = undefined;
    };
    
}

function resetGame() {
    score = 0;
    timePassed = 0;
    enemies = [];
    batsKilled = 0;
    batSpeed = [100, 50];
    $('#btnstopgame').show();
}

function btnStopGame() {
    isPlaying = false;
    $('#btnstopgame').hide();
}

function drawPause() {

    // draws background
    ctx.drawImage(backgroundImg, 0, 0, 960, 600);
    // draws score and time
    ctx.font="45px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    
    if (score > 0) {
	ctx.fillText("Your score: "+score, 480, 150);
    }else if (score == undefined) {
	ctx.fillText("A bat game", 480, 150);
    }else{
	ctx.fillText("GAME OVER", 480, 150);
    };
    
    ctx.beginPath();
    ctx.strokeStyle="white";
    ctx.rect(410, 235, 145, 48);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle="white";
    ctx.rect(410, 325, 145, 32);
    ctx.stroke();
    
    ctx.fillText("Start", 480, 275);
    ctx.font="25px Arial";
    if (isSoundOn) {
	ctx.fillText("Sound ON", 480, 350);
    }else{
	ctx.fillStyle = "red";
	ctx.fillText("Sound OFF", 480, 350);
    }
    // draw bats
    ctx.drawImage(batSpritesheet, 0,0, batSize[0], batSize[1], 150, 150, batRenderSize[0], batRenderSize[1]);
    ctx.drawImage(batSpritesheet, 0,0, batSize[0], batSize[1], 750, 300, batRenderSize[0], batRenderSize[1]);
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
    
    if (isSoundOn && isPlaying) {
	gunShotSound.currentTime = 0;
	gunShotSound.play();
    };
}

function fireGunTouch (event) {
    var rect = c.getBoundingClientRect();
    gunShotX = event.changedTouches[0].pageX - rect.left;
    gunShotY = event.changedTouches[0].pageY - rect.top;
    mouseX = gunShotX;
    mouseY = gunShotY;
    if (!isPlaying && gunShotY > 325 && gunShotY < 325+32) {
	if (isSoundOn) {
	    isSoundOn = false;
	    backgroundSound.currentTime = 1;
	    backgroundSound.pause();
	}else{
	    isSoundOn = true;
	    backgroundSound.play();
	};
    };
    if (isSoundOn && isPlaying) {
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
		if (isSoundOn) {
		    batDieSound.play();
		};
		score += 100;
		batsKilled++;
		batSpeed[0] *= 1.06;
		batSpeed[1] *= 1.05;
	    }else{
		score -= 33;
		batSpeed[0] *= 1.05;
		batSpeed[1] *= 1.04;
	    };
	    
	};
	
        gunShotX = undefined;
	gunShotY = undefined; 
    };
    
    if (timePassed > 60 || score < 0) {
	isPlaying = false;
	$('#btnstopgame').hide();
	if (isSoundOn) {
	    setTimeout(function(){gameOverSound.play()}, 300);
	};
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
	
	var speed0 = this.speed[0],
	    speed1 = this.speed[1],
	    pos0 = this.pos[0],
	    pos1 = this.pos[1],
	    speed0dt = speed0*dt,
	    speed1dt = speed1*dt;
	
	
	if (speed0 > 0) {
	    if (pos0 + (speed0dt) < (960-this.renderSize[0])) {
		this.pos[0] += speed0dt;
	    }else{
		this.speed[0] *= -1;
	    };
	}else{
	    if (pos0 + (speed0dt) > 0) {
		this.pos[0] += speed0dt;
	    }else{
		this.speed[0] *= -1;
	    };
	};
	
	if (speed1 > 0) {
	    if (pos1 + (speed1dt) < (600-this.renderSize[1])) {
		this.pos[1] += speed1dt;
	    }else{
		this.speed[1] *= -1;
	    };
	}else{
	    if (pos1 + (speed1dt) > 0) {
		this.pos[1] += speed1dt;
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