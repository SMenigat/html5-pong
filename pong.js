/**
 * Transforms a given HTML5 canvas into a pong game
 * @param gameCanvasNodeId
 * @param Player1Name
 * @param Player2Name
 * @constructor
 */
var PongGame = function(gameCanvasNodeId, Player1Name, Player2Name){
    var self = this;

    // game performance settings
    var drawRate = 10; // in milliseconds
    var gameSpeed = 2;

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

    // input control's
    var keyboarIO = {
        Player1Up: false,
        Player1Down: false,
        Player1Up: false,
        Player1Down: false
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

        // create the ball game object & give it a random velocity and direction
        resetBall();

        // start the game engine
        engine();
    };

    /**
     * game engine, calculates positions of game objects and players scores
     */
    var engine = function(){

        // check if the game is stopped
        if (gameStopped) return;

        // move the players bats


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