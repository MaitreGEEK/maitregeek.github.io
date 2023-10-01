
function game() {
    const game_button = document.getElementById("game_button")
    game_button.style.display = "none"

    var canvas = document.getElementById("game");
    var context = canvas.getContext("2d");

    var player1 = {
        x: 5,
        y: 220,
        width: 10,
        height: 90,
        score: 0
    };

    var player2 = {
        x: 825,
        y: 220,
        width: 10,
        height: 90,
        score: 0
    };

    var ball = {
        x: 320,
        y: 240,
        radius: 10,
        speed: 5,
        velocityX: 10,
        velocityY: 10
    };

    function collisionDetection(ball, player) {
        if (ball.x < player.x + player.width &&
            ball.x + ball.radius > player.x &&
            ball.y < player.y + player.height &&
            ball.y + ball.radius > player.y) {
            return true;
        } else {
            return false;
        }
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.fillRect(player1.x, player1.y, player1.width, player1.height);
        context.fillRect(player2.x, player2.y, player2.width, player2.height);
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.fill();
        context.font = "30px Calibri";
        context.fillText(player1.score, 100, 50);
        context.fillText(player2.score, canvas.width - 100, 50);
    }

    function movement() {

        if ((keys[38] || keys[90] || keys[87] || arrowUpButtonPressed) && player1.y > 0) {
            player1.y -= 10;
        } else if ((keys[83] || keys[40] || arrowDownButtonPressed) && player1.y < canvas.height - player1.height) {
            player1.y += 10;
        }

        if (ball.y > player2.y + player2.height / 2) {
            player2.y += 10;
        } else {
            player2.y -= 10;
        }
    }

    function update() {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;


        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.velocityY = -ball.velocityY;
        }


        if (collisionDetection(ball, player1)) {
            ball.velocityX = -ball.velocityX;
        }

        if (collisionDetection(ball, player2)) {
            ball.velocityX = -ball.velocityX;
        }


        if (ball.x - ball.radius < 0) {
            player2.score++;
            reset();
        }

        if (ball.x + ball.radius > canvas.width) {
            player1.score++;
            reset();
        }

        draw();
        movement();
    }

    function reset() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = -ball.velocityX;
        ball.speed = 5;
    }

    //CLAVIER
    var keys = [];
    window.addEventListener("keydown", function (e) {
        keys[e.keyCode] = true;
    });

    window.addEventListener("keyup", function (e) {
        delete keys[e.keyCode];
    });

    //PC CLICKS
    var arrowUpButton = document.getElementById("arrowup");
    var arrowDownButton = document.getElementById("arrowdown");

    var arrowUpButtonPressed = false;
    var arrowDownButtonPressed = false;

    arrowUpButton.addEventListener("mousedown", function () {
        arrowUpButtonPressed = true;
    });

    arrowUpButton.addEventListener("mouseup", function () {
        arrowUpButtonPressed = false;
    });

    arrowDownButton.addEventListener("mousedown", function () {
        arrowDownButtonPressed = true;
    });

    arrowDownButton.addEventListener("mouseup", function () {
        arrowDownButtonPressed = false;
    });


    //TACTILE MOBILE
    arrowUpButton.addEventListener("touchstart", function (e) {
        e.preventDefault(); // Empêche le comportement par défaut du navigateur (comme le défilement)
        arrowUpButtonPressed = true;
    });

    arrowUpButton.addEventListener("touchend", function () {
        arrowUpButtonPressed = false;
    });

    arrowDownButton.addEventListener("touchstart", function (e) {
        e.preventDefault();
        arrowDownButtonPressed = true;
    });

    arrowDownButton.addEventListener("touchend", function () {
        arrowDownButtonPressed = false;
    });


    function gameLoop() {
        update();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}
