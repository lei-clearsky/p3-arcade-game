// Game engine.
var Engine = (function(global) {
    /**
     * Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        seconds,
        timer;
        game = new Game();

    canvas.width = 505;
    canvas.height = 606;
    doc.getElementById('game-board').appendChild(canvas);

    /**
     * Sets up the game loop itself and calls the update and render methods.
     * @return {void}
     */
    function main() {
        /**
         * Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is).
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;
        /**
         * Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();
        /**
         * Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;
        /**
         * Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         * if game's stop value set to true, stop the game.
         */
        if(!game.stop){
            win.requestAnimationFrame(main);
        };
    };
    /**
     * Sets a timer for the game.
     * @param {number} time Total seconds of the timer
     * @param {Game} game The new game instance
     * @return {void}
     */
    function setTimer(time, game) {
        timer = doc.getElementById('timer');
        seconds = time;
        // If out of time, game over.
        // Set game's stop value to true.
        if (seconds === 0) {
            game.gameOver();
            game.stop = true;
        };
        // If game's stop value is false, update timer and continue the game.
        if (!game.stop) {
            seconds--;
            updateTimer();
            win.setTimeout(function(){
                setTimer(seconds, game);
            }, 1000); 
        };
    }; 
    /**
     * Updates the timer each second.
     * @return {void}
     */
    function updateTimer() {
        var timerStr;
        var tempSeconds = seconds;
        var tempMinutes = Math.floor(seconds / 60) % 60;
        tempSeconds -= tempMinutes * 60;
        timerStr = formatTimer(tempMinutes, tempSeconds);
        timer.innerHTML = timerStr;
    };
    /**
     * Format timer string displayed in the game.
     * @param {number} minutes Remaining minutes of the timer
     * @param {number} seconds Ramaining seconds of the timer
     * @return {string}
     */   
    function formatTimer(minutes, seconds) {
        var formattedMinutes = (minutes < 10) ? '0' + minutes : minutes;
        var formattedSeconds = (seconds < 10) ? '0' + seconds : seconds;

        return formattedMinutes + ":" + formattedSeconds;
    };

    /**
     * This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     * return {void}
     */
    function init() {
        lastTime = Date.now();
        doc.getElementById('start').onclick = function() {
           main();          
           setTimer(60, game);

           doc.getElementById('score').innerHTML = 'Score: ' + game.score;
           doc.getElementById('life').innerHTML = 'Life: ' + game.life;
           doc.getElementById('timer').style.display = 'inline-block';
           doc.getElementById('life').style.display = 'inline-block';
           doc.getElementById('score').style.display = 'inline-block';          
           doc.getElementById('try-again').style.display = 'inline-block';
           doc.getElementById('game-board').style.display = 'inline-block';
           
           var instruction = doc.getElementById('instruction');
           instruction.parentNode.removeChild(instruction);
           var startButton = doc.getElementById('start');
           startButton.parentNode.removeChild(startButton);
           var heading = doc.getElementById('heading');
           heading.parentNode.removeChild(heading);
       }; 
    };

    /** 
     * This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. 
     * @param {number} dt A time delta between ticks
     * @return {void}
     */
    function update(dt) {
        updateEntities(dt);
        game.checkCollisions();
		game.checkDestination();
        game.checkPlayerHelpers();
    };

    /**
     * This is called by the update function and loops through all of the
     * objects within the allEnemies array as defined in app.js and calls
     * their update() methods. 
     * @param {number} dt A time delta between ticks
     * @return {void}
     */
    function updateEntities(dt) {
        game.allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        game.player.update(dt);
        game.playerHelper.update(dt);
    };

    /**
     * This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     * @return {void}
     */
    function render() {
        /**
         * This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
		var topRowImages = [
			'images/water-block.png',   
            'images/stone-block.png',
			'images/water-block.png',   
            'images/stone-block.png',
			'images/water-block.png'  
		    ],
			rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /**
         * Loop through the number of rows and columns defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid".
         */
		for (col = 0; col < numCols; col++) {
			ctx.drawImage(Resources.get(topRowImages[col]), col * 101, 0);
		};
		
        for (row = 1; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            };
        };

        renderEntities();
    };

    /**
     * This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions defined
     * on enemy and player entities within app.js.
     * return {void}
     */
    function renderEntities() {       
        game.allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        game.player.render();            
        game.playerHelper.render();           
        game.render();          
    };

    // Load all of the images.
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/Heart.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png',
        'images/Rock.png'
    ]);
    Resources.onReady(init);

    /**
     * Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that it can be used more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
