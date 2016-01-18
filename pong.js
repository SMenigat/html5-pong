/**
 * Transforms a given HTML5 canvas into a pong game
 * @param gameCanvasNodeId
 * @param Player1Name
 * @param Player2Name
 * @constructor
 */
var PongGame = function(gameCanvasNodeId, Player1Name, Player2Name){
    var self = this;

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

    // game objects itself
    var Player1Bat;
    var Player2Bat;
    var Ball;

    // players & scores
    if (!Player1Name) Player1Name = 'Player1';
    if (!Player2Name) Player2Name = 'Player2';
    var scoreFinal = 10;
    var scorePlayer1 = 0;
    var scorePlayer2 = 0;

    /**
     * initializes the game and starts the game loop
     */
    this.run = function () {

        // initialize the game canvas
        gameCanvas.style.backgroundColor = colorBackground;

        // initialize the game objects
        Player1Bat = new GameObject(
            batBorderSpacing + (batWidth / 2),
            canvasHeight / 2
        );

        Player2Bat = new GameObject(
            canvasWidth - batBorderSpacing - (batWidth / 2),
            canvasHeight / 2
        );

        Ball = new GameObject(
            canvasWidth / 2,
            canvasHeight / 2
        );

        // draw the first frame (static at the moment)
        self.draw();
    };

    /**
     * draws all game obects onto the canvas
     */
    this.draw = function(){

        console.log('draw');
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
            console.log('draw', bats[bat]);
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

        // calculate the width of the text of player2 to align it properly on the right
        var player2TextWidth = (Player2Name.length + scorePlayer2.toString().length) * scoreFontSize;
        console.log(Player2Name.length + scorePlayer2.toString().length, scoreFontSize, player2TextWidth);
        canvasContext.fillText(
            Player2Name + ' ' + scorePlayer2,
            canvasWidth - player2TextWidth - batBorderSpacing,
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