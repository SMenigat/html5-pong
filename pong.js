/**
 * Transforms a given HTML5 canvas into a pong game
 * @param gameCanvasNodeId
 * @param Player1Name
 * @param Player2Name
 * @constructor
 */
var PongGame = function(gameCanvasNodeId, Player1Name, Player2Name){
    var self = this;

    // game performance settings & timings
    var drawRate = 10; // in milliseconds
    var gameSpeed = 2;
    var gameBounceSmoothness = 0.05;
    var gameBounceSpeedRatio = 0.25;
    var scorePauseTimer = 1000; // in milliseconds

    // trigger that stops the game
    var gameStopped = false;

    // canvas
    var gameCanvas = document.getElementById(gameCanvasNodeId);
    var canvasWidth = gameCanvas.width;
    var canvasHeight = gameCanvas.height;
    var canvasContext = gameCanvas.getContext('2d');

    // colors
    var colorBackground = 'black';
    var colorBat = 'green';
    var colorBall = 'white';
    var colorScores = 'red';

    // game object dimensions
    var batHeightRatio = 0.3;
    var batHeight = canvasHeight * batHeightRatio;
    var batWidthRatio = 0.035;
    var batWidth = canvasWidth * batWidthRatio;
    var batBorderSpacingRatio = 0.01;
    var batBorderSpacing = canvasWidth * batBorderSpacingRatio;
    var ballRadiusRatio = 0.02;
    var ballRadius = canvasWidth * ballRadiusRatio;
    var scoreFontSizeRatio = 0.03;
    var scoreFontSize = canvasWidth * scoreFontSizeRatio;
    var winningMessageFontSize = scoreFontSize * 2;

    // game objects itself
    var Player1Bat;
    var Player2Bat;
    var Ball;
    var BallVelocity;

    // players & scores
    if (!Player1Name) Player1Name = 'Player1';
    if (!Player2Name) Player2Name = 'Player2';
    var scoreFinal = 10;
    var scorePlayer1 = 0;
    var scorePlayer2 = 0;
    var isMultiplayer = true;

    // input control's
    self.keyboardIO = {
        Player1Up: false,
        Player1Down: false,
        Player2Up: false,
        Player2Down: false
    };

    /**
     * initializes the game and starts the game loop
     */
    this.run = function () {

        // initialize the game canvas
        gameCanvas.style.backgroundColor = colorBackground;

        // initialize the player bats
        Player1Bat = new GameObject(
            batBorderSpacing + (batWidth / 2),
            canvasHeight / 2
        );

        Player2Bat = new GameObject(
            canvasWidth - batBorderSpacing - (batWidth / 2),
            canvasHeight / 2
        );

        // register event hanlder for keyboard inputs
        document.addEventListener('keypress', keyboardIOHandler);
        document.addEventListener('keyup', keyboardIOReset);

        // create the ball game object & give it a random velocity and direction
        resetBall();

        // start the game engine
        engine();
    };

    /**
     * method stops the game engine
     */
    this.stop = function(){
        gameStopped = true;
    };

    /**
     * game engine, calculates positions of game objects and players scores
     */
    var engine = function(){

        // check if the game is stopped
        if (gameStopped) return;

        // move the players bats
        if (self.keyboardIO.Player1Up && canBatBeMovedOnYAxis(Player1Bat, (gameSpeed * 2) * -1)) {
            Player1Bat.moveObject(new Vector(0, (gameSpeed * 2) * -1));
        }
        if (self.keyboardIO.Player1Down && canBatBeMovedOnYAxis(Player1Bat, (gameSpeed * 2))) {
            Player1Bat.moveObject(new Vector(0, (gameSpeed * 2)));
        }
        if (self.keyboardIO.Player2Up && canBatBeMovedOnYAxis(Player2Bat, (gameSpeed * 2) * -1)) {
            Player2Bat.moveObject(new Vector(0, (gameSpeed * 2) * -1));
        }
        if (self.keyboardIO.Player2Down && canBatBeMovedOnYAxis(Player2Bat, (gameSpeed * 2))) {
            Player2Bat.moveObject(new Vector(0, (gameSpeed * 2)));
        }

        // check if ball colides with player1's bat
        if (checkBallCollision(Player1Bat)) {

            // we need to add a velocity limit to avoid collision detection from bugging out
            var VelocityX = (BallVelocity.x - (gameSpeed * gameBounceSpeedRatio));
            if (Math.abs(VelocityX) > ballRadius) {
                VelocityX = ballRadius * -1;
            }

            // bounce the ball from the bat & speed the ball up
            BallVelocity = new Vector(
                VelocityX * -1,
                (Player1Bat.y - Ball.y) * gameBounceSmoothness * -1
            );
        }

        // check if ball colides with player2's bat
        if (checkBallCollision(Player2Bat)) {

            // we need to add a velocity limit to avoid collision detection from bugging out
            var VelocityX = (BallVelocity.x + (gameSpeed * gameBounceSpeedRatio));
            if (Math.abs(VelocityX) > ballRadius) {
                VelocityX = ballRadius;
            }

            // bounce the ball from the bat & speed the ball up
            BallVelocity = new Vector(
                VelocityX * -1,
                (Player2Bat.y - Ball.y) * gameBounceSmoothness * -1
            );
        }

        // check if ball collides with canvas's top border
        if ((Ball.y - ballRadius) <= 0) {

            // bounce the ball
            BallVelocity = new Vector(
                BallVelocity.x,
                BallVelocity.y * -1
            );
        }

        // check if ball collides with canvas's bottom border
        if ((Ball.y + ballRadius) >= canvasHeight) {

            // bounce the ball
            BallVelocity = new Vector(
                BallVelocity.x,
                BallVelocity.y * -1
            );
        }

        // move the ball
        Ball.moveObject(BallVelocity);

        // check if someone has scored
        if (checkScore()) {

            // has one of the players won?
            if (scorePlayer1 === scoreFinal) {

                // print winning screen and stop the game
                gameStopped = true;
                return drawWinningScreen(Player1Name);
            } else if (scorePlayer2 === scoreFinal) {

                // print winning screen and stop the game
                gameStopped = true;
                return drawWinningScreen(Player2Name);
            } else {

                // nobody has won yet, so we are resetting the ball to the middle
                resetBall();
            }
        }

        // draw all game object onto the canvas
        drawGame();

        // rerun the engnie function
        setTimeout(function(){
            engine();
        }, drawRate);
    };

    /**
     * if a player has scored the players score is raised and true is returned
     * @returns {boolean}
     */
    var checkScore = function(){

        // check if player1 has scored
        if (Ball.x >= canvasWidth) {
            scorePlayer1++;
            return true;
        }

        // check if player2 has scored
        if (Ball.x <= 0) {
            scorePlayer2++;
            return true;
        }

        // nobody scored
        return false;
    };

    /**
     * checks if ball colides with given player bat
     * @param playerBat
     * @returns {boolean}
     */
    var checkBallCollision = function(playerBat) {

        // bat coordinates
        var batInfo = {
            centerX: playerBat.x,
            centerY: playerBat.y,
            smallestX: playerBat.x - (batWidth / 2),
            biggestX: playerBat.x + (batWidth / 2),
            smallestY: playerBat.y - (batHeight / 2),
            biggestY: playerBat.y + (batHeight / 2)
        };

        // ball coordinates
        var ballInfo = {
            centerX: Ball.x,
            centerY: Ball.y,
            smallestX: Ball.x - ballRadius,
            biggestX: Ball.x + ballRadius,
            smallestY: Ball.y - ballRadius,
            biggestY: Ball.y + ballRadius
        };

        // check if they would collide on the x axis
        if (
            (batInfo.smallestX <= ballInfo.smallestX && ballInfo.smallestX <= batInfo.biggestX) ||
            (batInfo.smallestX <= ballInfo.biggestX && ballInfo.biggestX <= batInfo.biggestX)
        ) {
            // check if the are colliding on the y axis too
            if (
                (batInfo.smallestY <= ballInfo.smallestY && ballInfo.smallestY <= batInfo.biggestY) ||
                (batInfo.smallestY <= ballInfo.biggestY && ballInfo.biggestY <= batInfo.biggestY)
            ) {
                return true;
            }
        }

        // the ball didn't collide with the given bat
        return false;
    };

    /**
     * (re)creates the ball game object and generates a random velocity for it
     */
    var resetBall = function(){

        // (re)create game object
        Ball = new GameObject(
            canvasWidth / 2,
            canvasHeight / 2
        );

        // start moving the ball, but we have to determine in which direction
        // which is done randomly
        if (Math.random() > 0.5) {
            BallVelocity = new Vector(gameSpeed * -1, 0);
        } else {
            BallVelocity = new Vector(gameSpeed, 0);
        }

        // we pause the script execution for the defined pause time
        var startTime = new Date();
        var currentTime = null;
        do {
            currentTime = new Date();
        } while(currentTime - startTime < scorePauseTimer);
    };

    /**
     * checks if bat can be moved up or down the Y axis, or if bat is already to close to the border
     * @param bat
     * @param distance
     * @returns {boolean}
     */
    var canBatBeMovedOnYAxis = function(bat, distance) {

        // are we to far too the top if we move the bat?
        if ((bat.y - (batHeight / 2)) + distance <= 0) {
            console.log('bat too far up', (bat.y - (batHeight / 2)) + distance);
            return false;
        }

        // are we too far to the bottom if we move the bat?
        if ((bat.y + (batHeight / 2)) + distance >= canvasHeight) {
            console.log('bat too far down', (bat.y + (batHeight / 2)) + distance);
            return false;
        }

        // everything is fine, bat can be moved
        return true;
    };

    /**
     * eventhandler for keypress events of document which sets the player's io states
     * @param event
     */
    var keyboardIOHandler = function(event){

        // detect pressed char code
        var characterCode = (typeof event.which == "number") ? event.which : event.keyCode;

        // if player1 moves the bat
        if (characterCode == 119 || characterCode == 115) {

            // up
            if (characterCode == 119) {
                self.keyboardIO.Player1Up = true;
                self.keyboardIO.Player1Down = false;
            }

            // down
            else if (characterCode == 115) {
                self.keyboardIO.Player1Up = false;
                self.keyboardIO.Player1Down = true;
            }
        } else {

            // player1 is not moving
            self.keyboardIO.Player1Up = false;
            self.keyboardIO.Player1Down = false;
        }

        // if player1 moves the bat
        if (characterCode == 111 || characterCode == 108) {

            // up
            if (characterCode == 111) {
                self.keyboardIO.Player2Up = true;
                self.keyboardIO.Player2Down = false;
            }

            // down
            else if (characterCode == 108) {
                self.keyboardIO.Player2Up = false;
                self.keyboardIO.Player2Down = true;
            }
        } else {

            // player1 is not moving
            self.keyboardIO.Player2Up = false;
            self.keyboardIO.Player2Down = false;
        }
    };

    /**
     * resets the keyboard input events
     * @param event
     */
    var keyboardIOReset = function(event) {
        self.keyboardIO.Player1Up = false;
        self.keyboardIO.Player1Down = false;
        self.keyboardIO.Player2Up = false;
        self.keyboardIO.Player2Down = false;
    };

    /**
     * writes the winners name & reset information centered onto the canvas
     * @param playerName
     */
    var drawWinningScreen = function(playerName) {

        // clear all drawings from the canvas
        canvasContext.fillStyle = colorBackground;
        canvasContext.clearRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );

        // prepare the winner message
        var winningMessage = playerName + ' has won!';

        // draw the message
        canvasContext.fillStyle = colorScores;
        canvasContext.font = 'bold ' + winningMessageFontSize + 'px Courier New';
        canvasContext.fillText(
            winningMessage,
            (canvasWidth / 2) - (canvasContext.measureText(winningMessage).width / 2),
            (canvasHeight / 2) - (winningMessageFontSize / 2)
        );

        // draw reset information
        var resetMessage = 'Press (R) to restart the game.';
        canvasContext.font = 'bold ' + scoreFontSize + 'px Courier New';
        canvasContext.fillText(
            resetMessage,
            (canvasWidth / 2) - (canvasContext.measureText(resetMessage).width / 2),
            (canvasHeight / 2) + (winningMessageFontSize / 2)
        );
    };

    /**
     * draws all game objects onto the canvas
     */
    var drawGame = function(){

        // clear all drawings from the canvas
        canvasContext.fillStyle = colorBackground;
        canvasContext.clearRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );

        // draw player bats
        var bats = [Player1Bat, Player2Bat];
        for (var bat in bats) {
            canvasContext.fillStyle = colorBat;
            canvasContext.fillRect(
                bats[bat].x - (batWidth / 2),
                bats[bat].y - (batHeight / 2),
                batWidth,
                batHeight
            );
        }

        // draw the ball
        canvasContext.fillStyle = colorBall;
        canvasContext.beginPath();
        canvasContext.arc(
            Ball.x,
            Ball.y,
            ballRadius,
            0,
            2*Math.PI
        );
        canvasContext.fill();

        // draw the player's scores
        canvasContext.fillStyle = colorScores;
        canvasContext.font = 'bold ' + scoreFontSize + 'px Courier New';
        canvasContext.fillText(
            Player1Name + ' ' + scorePlayer1,
            batBorderSpacing,
            scoreFontSize
        );

        canvasContext.fillText(
            Player2Name + ' ' + scorePlayer2,
            canvasWidth - canvasContext.measureText(Player2Name + ' ' + scorePlayer2).width - batBorderSpacing,
            scoreFontSize
        );
    };


    /**
     * minimalistic GameObject
     * @param x
     * @param y
     * @constructor
     */
    var GameObject = function (x, y) {
        var self = this;
        this.x = x;
        this.y = y;

        /**
         * moves the game object by the given vector
         * @param vector
         */
        this.moveObject = function (vector) {
            self.x += vector.x;
            self.y += vector.y;
        };
    };


    /**
     * Vector object shell
     * @param x
     * @param y
     * @constructor
     */
    var Vector = function(x, y) {
        var self = this;
        this.x = x;
        this.y = y;
    }
};
