
var Game = function(){
    // minimal enemy speed
    this.minEnemySpeed = 100;
    // maximen enemy speed
    this.maxEnemySpeed = 300;
    // score
    this.score = 0;
    // life
    this.life = 3;
    // set stop to false when initialize the game, 
    // when player lost all lives or no time, set stop to true to stop the game
    this.stop = false;
    // initialize enemy array
    this.allEnemies = [];
    // add enemy objects to the enemy array
    this.initEnemies();
    // initialize a new player
    this.player = new Player();
    // initialize player helpers
    this.playerHelper = new PlayerHelper();
    // assign "this" to new var "that" to use the object in a nested "keyup" function below
    var that = this;
    // use keyboard to move player in the game 
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        that.player.handleInput(allowedKeys[e.keyCode]);
    });
}

// initialize enemy objects and put them into the allEnemies array
Game.prototype.initEnemies = function(){
    // initialize four enemies on each row
    // loop through four enemy rows
    for(var i = 0; i < 4; i++){
        var enemy = new Enemy();
        // return random numbers between minEnemySpeed and maxEnemySpeed
        enemy.speed = Math.floor(Math.random()*this.maxEnemySpeed + this.minEnemySpeed); 
        // push each enemy to allEnemies array
        this.allEnemies.push(enemy);
    }
}

// Check collisions
Game.prototype.checkCollisions = function(){
    for (var i = 0; i < this.allEnemies.length; i++){
        if (Math.abs(this.player.x - this.allEnemies[i].x) < 50 && Math.abs(this.player.y - this.allEnemies[i].y) < 50){
            // if player is hit, reset player position
            this.player.reset();
            if (this.life > 0){
                // if player's life is more than 0, subtract one life
                this.life --;
                // update life
                document.getElementById('life').innerHTML = "Life: "+this.life;
            }
        }
    }
} 

// Change stats or enemies behavior after player collect items, and update stats
Game.prototype.checkPlayerHelpers = function(){
    // if the player collect an item
    if (Math.abs(this.player.x - this.playerHelper.x) < 50 && Math.abs(this.player.y - this.playerHelper.y) < 50){
        // if the player collects a heart, add one life
        if(this.playerHelper.sprite == 'images/Heart.png'){
            this.life ++;
            document.getElementById('life').innerHTML = "Life: "+this.life;
        // if the player collects a blue gem, slow enemies speed for one second
        }else if(this.playerHelper.sprite == 'images/Gem Blue.png'){
            // save enemies original speed
            var originalEnemySpeeds = new Array(3);
            var allEnemies = this.allEnemies;
            // slow each enemy's speed
            for(var i = 0; i < allEnemies.length; i++){
                originalEnemySpeeds[i] = allEnemies[i].speed;
                allEnemies[i].speed = allEnemies[i].speed / 3;
            }     
            // change back to original speed after one second
            setTimeout(function () {
                for(var i = 0; i < originalEnemySpeeds.length; i++){
                    allEnemies[i].speed = originalEnemySpeeds[i];
                } 
            }, 1000); 
        // if the player collects a green gem, add two points
        }else if(this.playerHelper.sprite == 'images/Gem Green.png'){
            this.score += 2;
            document.getElementById('score').innerHTML = "Score: "+this.score;
        // if the player collects a orange gem, add five points
        }else if(this.playerHelper.sprite == 'images/Gem Orange.png'){
            this.score += 5;
            document.getElementById('score').innerHTML = "Score: "+this.score;
        // if the player collects a rock, it will lose one life :( don't collect rocks in this game..
        }else if(this.playerHelper.sprite == 'images/Rock.png'){
            this.life --;
            document.getElementById('life').innerHTML = "Life: "+this.life;
        }
        // once the player hit the helpers, move the helper off the screen;
        this.playerHelper.x = -100;
        this.playerHelper.y = -100;
    }

} 

// If player hit water, reset the player location, player will lose one life.
// Otherwise, the player reaches the destination, increase score
Game.prototype.checkDestination = function(){
    if(this.player.y < 0) {
        if((this.player.x > 10 && this.player.x < 200) || (this.player.x > 200 && this.player.x < 400)) {
            this.player.reset();
            this.score ++;
            document.getElementById('score').innerHTML = "Score: "+this.score;
        }else {
            this.player.reset();
            this.life --;
            document.getElementById('life').innerHTML = "Life: "+this.life;
        }
    }
}
// check if the game need stop, if life is zero, set stop to true and game over.
Game.prototype.render = function(){
    if(this.life == 0){
        this.stop = true;
        this.gameOver();
    }
}
// game over message
Game.prototype.gameOver = function(){
    var gameBoard = document.getElementById('game-board');
    gameBoard.parentNode.removeChild(gameBoard);
    var gameOverMessage = document.getElementById('game-over-message');
    var zeroLifeMessage = "Look like your life is zero :( "+ "<br>";
    var gameScoreMessage = "Your final score is " + game.score;
    // if life is zero, display zero life message; if run out of time, display the score
    if(this.life === 0){
        gameOverMessage.innerHTML = zeroLifeMessage + gameScoreMessage;
    }else{
        gameOverMessage.innerHTML = gameScoreMessage;
    }    
}

// Enemy object
var Enemy = function() {
    // enemy's y values
	this.enemyY = [60,145,230,315];
    // enemy's starting x value
    this.x = -101;
    // randomnize enemy's y values 
	this.y = this.enemyY[Math.round(Math.random()*3)];
	this.speed;
    // load enemy's image
    this.sprite = 'images/enemy-bug.png';
}

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // move enemy
    this.x += this.speed * dt;
    // If our enemies move off the screen, restart them at one block (101px) 
    // right before the start of the screen.  
    if(this.x > 500) {
        this.x = -101;
        // randomnize enemy's y value every time enemy move off 
        // the screen and start from the begining again
        this.y = this.enemyY[Math.round(Math.random()*3)];
    }
    
}

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}
// Items player can collect
var Item = function(){
    this.itemX = [0,100,200,300,400];
    this.itemY = [80,160,240,320];
    this.x = this.startPosX();
    this.y = this.startPosY();
}

Item.prototype.startPosX = function () {
    var startX = this.itemX[Math.round(Math.random()*this.itemX.length)];
    return startX;
}

Item.prototype.startPosY = function() {
    var startY = this.itemY[Math.round(Math.random()*this.itemY.length)];
    return startY;
}

Item.prototype.update = function(dt) {
    this.x*dt;
    this.y*dt;
}

Item.prototype.reset = function() {
    this.x = this.startPosX();
    this.y = this.startPosY();
}

Item.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}
// PlayerHelper inherites Item 
var PlayerHelper = function () {
    Item.call(this);
    this.loadNewHelper();
    this.reset();
};
// PlayerHelper inherites Item 
PlayerHelper.prototype = Object.create(Item.prototype);
// set PlayerHelper constructor
PlayerHelper.prototype.constructor = PlayerHelper;
// load one new helper
PlayerHelper.prototype.loadNewHelper = function(){
    this.spriteOptions = ['images/Rock.png','images/Rock.png','images/Rock.png','images/Heart.png','images/Gem Blue.png', 'images/Gem Green.png', 'images/Gem Orange.png'];
    this.sprite = this.spriteOptions[Math.floor(Math.random()*this.spriteOptions.length)];
}

PlayerHelper.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

PlayerHelper.prototype.reset = function(){
    var that = this;
    // move the helper off the screen;
    that.x = -100;
    that.y = -100;
    setInterval(function(){
        that.loadNewHelper();
        Item.prototype.reset.call(that);    
    }, 5000);
}


// Player constructor
var Player = function() {
	this.sprite = 'images/char-boy.png';
    this.x = 200;
    this.y = 400;
}

Player.prototype.update = function(dt) {
    this.x*dt;
    this.y*dt;
}

Player.prototype.reset = function() {
    this.x = 200;
    this.y = 400;
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}
// player can use keyboard to move in the game
Player.prototype.handleInput = function(key){
	switch(key) {
        case 'left':
            if(this.x > 0)
            this.x -= 100;
            break;
        case 'up':
            if(this.y > 0)
            this.y -= 90;
            break;
        case 'right':
            if(this.x < 400)
            this.x += 100;
            break;
        case 'down':
            if(this.y < 375)
            this.y += 90;
            break;
        default:
            return;
    }
}


