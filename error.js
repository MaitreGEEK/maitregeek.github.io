class Game {
    constructor(ball_speed, timerMax, score_max, level_num) {

        if (ball_speed> Math.floor(ball_speed)) ball_speed = Math.floor(ball_speed) + 0.5 
        //La vélocité de la balle est sa vitesse de déplacement
        this.ball.velocityX = ball_speed
        this.ball.velocityY = ball_speed
        this.timer.max = Math.floor(timerMax)
        this.player1.score = score_max
        this.level = level_num

        //Set timer
        let timerElt = document.getElementById("timer") || document.createElement('div')
        timerElt.id = "timer"
        timerElt.style.color = "white"
        timerElt.style.display = "block"
        timerElt.innerHTML = Math.floor(timerMax)
        document.body.appendChild(timerElt)
    }

    canvas = document.getElementById("game");
    context = this.canvas.getContext("2d");

    timer = {
        now: 0,
        max: 60
    }

    stop = true

    player1 = {
        x: 5,
        y: 220,
        width: 10,
        height: 90,
        score: 0,
        speed: 10,
        color: "blue",
    };

    player2 = {
        x: 825,
        y: 220,
        width: 10,
        height: 90,
        score: 0,
        speed: 10,
        color: "red",
    };

    ball = {
        x: 320,
        y: 240,
        radius: 10,
        velocityX: 10,
        velocityY: 10,
        color: "white",
    };

    keys = [];
    arrowUpButtonPressed = false;
    arrowDownButtonPressed = false;

    timer_incr() {
        if (this.stop == true) return
        this.timer.now += 1
        document.getElementById('timer').innerHTML = Math.floor(this.timer.max - this.timer.now)
        if (Math.floor(this.timer.max - this.timer.now) <= 10) document.getElementById('timer').style.color = "red"
        if (Math.floor(this.timer.max - this.timer.now) <= 0) this.end_game((this.player1.score >= this.player2.score))
    }

    /**
     * Check the colisions of the selected player
     * @param { Object } player - The selected player
     * @returns If the selected player have a colision of not
     */
    collisionDetection(player) {
        if ((this.ball.x <= player.x + player.width) && (this.ball.x + this.ball.radius >= player.x) && (this.ball.y <= player.y + player.height) && (this.ball.y + this.ball.radius >= player.y)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Draw the Current scene
     */
    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //Player 1
        this.context.fillStyle = this.player1.color;
        this.context.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
        //Player 2 
        this.context.fillStyle = this.player2.color;
        this.context.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);

        this.context.beginPath();
        //Ball
        this.context.fillStyle = this.ball.color;
        this.context.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.context.fill();

        this.context.font = "30px Courrier New";

        //Player 1 Score
        this.context.fillStyle = this.player1.color
        this.context.fillText(this.player1.score, 100, 50);

        //Player 2 Scores
        this.context.fillStyle = this.player2.color
        this.context.fillText(this.player2.score, this.canvas.width - 100, 50);
    }

    /**
     * Move the player in function of the key pressed
     */
    movement() {
        if ((this.keys[38] || this.keys[90] || this.keys[87] || this.arrowUpButtonPressed) && this.player1.y > 0) {
            this.player1.y -= this.player1.speed;
        } else if ((this.keys[83] || this.keys[40] || this.arrowDownButtonPressed) && this.player1.y < this.canvas.height - this.player1.height) {
            this.player1.y += this.player1.speed;
        }

        if (this.ball.y > this.player2.y + this.player2.height / 2) {
            this.player2.y += this.player2.speed;
        } else {
            this.player2.y -= this.player2.speed;
        }
    }

    /**
     * Update the ball position
     */
    updateBall() {
        this.ball.x += this.ball.velocityX;
        this.ball.y += this.ball.velocityY;


        if (this.ball.y + this.ball.radius > this.canvas.height || this.ball.y - this.ball.radius < 0) {
            this.ball.velocityY = -this.ball.velocityY;
        }

        //Si la balle entre en collision avec un joueur, on doit lui donner une vitesse dans l'autre sens
        if (this.collisionDetection(this.player1) || (this.collisionDetection(this.player2))) {
            this.ball.velocityX = -this.ball.velocityX;
        }

        //La balle a touché le but du joueur 1
        if (this.ball.x - this.ball.radius < 0) {
            this.player2.score++;
            if (this.player2.score >= this.player1.score) this.end_game(false)
            this.resetBall();
        }

        //La balle a touché le but du joueur 2
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.player1.score++;
            this.resetBall();
        }

        this.draw();
        this.movement();
    }

    /**
     * *Sert à reset la boule*
     */
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.velocityX = -this.ball.velocityX;
        //this.ball.speed = 5;
    }

    /**
     * Permet de lire les input du joueur
     */
    input_reader() {
        let keys = this.keys
        let arrowUpButtonPressed = this.arrowUpButtonPressed
        let arrowDownButtonPressed = this.arrowDownButtonPressed

        //CLAVIER
        window.addEventListener("keydown", function (e) {
            keys[e.keyCode] = true;
        });

        window.addEventListener("keyup", function (e) {
            delete keys[e.keyCode];
        });

        //PC CLICKS
        var arrowUpButton = document.getElementById("arrowup");
        var arrowDownButton = document.getElementById("arrowdown");

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

        this.keys = keys
        this.arrowUpButtonPressed = arrowUpButtonPressed
        this.arrowDownButtonPressed = arrowDownButtonPressed
    }

    end_game(playerWin, message = undefined) {
        this.stop = true

        //stats
        let level = player.pong[mode].levels[this.level]
        if (!level) {
            level = {
                played: 0,
                wins: 0,
                lose: 0,
                high_score: undefined,
                time_played: 0,
            }
        }
        player.pong[mode].parties_played++;
        level.played++;

        let time = this.timer.now
        player.pong[mode].time_played += time
        level.time_played += time

        //Calculate score
        let score = this.player1.score - this.player2.score
        if (level.high_score == undefined || score > level.high_score) {
            level.high_score = score
        }

        //message
        if (!message) {
            if (playerWin) {
                message = "You won. "
                //stat
                player.pong[mode].wins++;
                level.wins++;
                //Display next button
                document.getElementById("next").style.display = "block"
            }
            else {
                message = "Enemy won. "
                //stat
                player.pong[mode].lose++;
                document.getElementById("restart").style.display = "block"
                level.lose++;
            }
            message += "<br>Score: " + score.toLocaleString()
        }

        player.pong[mode].levels[this.level] = level

        //Display win message
        let win_message = document.getElementById("win_message") || document.createElement("div")
        win_message.id = "win_message"
        win_message.style.display = "block"
        win_message.innerHTML = message
        document.body.appendChild(win_message)

        save("player", player)
    }
}

//Get Player
let player = get("player")
if (!player) player = init_player()

let play
let mode = "flow"
let cur_level = player.pong[mode].level


function game() {
    mode = document.getElementById('mode_select').value
    cur_level = player.pong[mode].level
    levels = init_levels(mode)
    if (!levels) return
    clear_game()
    //Faire disparaitre le game button
    document.getElementById("game_button").style.display = "none"

    let level = levels[cur_level]
    play = new Game(level[0], level[1], level[2], cur_level)
    play.draw()
    play.input_reader()
    play.stop = false

    //Game loop
    function gameLoop() {
        if (play.stop != true) {
            play.updateBall();
            requestAnimationFrame(gameLoop);
        }
    }

    //Timer
    play.interval = setInterval(() => {
        if (!play.stop) {
            play.timer_incr()
        }
    }, 1000)

    save("player", player)
    gameLoop();
}

function next_level() {
    //Player didn't win it
    if (mode !== document.getElementById('mode_select').value) {
        mode = document.getElementById('mode_select').value
        cur_level = player.pong[mode].level
    }
    if (player.pong[mode].levels[cur_level].wins < 1) return clear_game()

    if (levels.length - 1 < cur_level + 1) {
        //Level doesn't exists
        let check = gen_level(player.pong[mode].levels[cur_level], levels[cur_level])
        if (!check) return clear_game()
    }
    cur_level += 1
    clear_game()
}

function previous_level() {
    if (mode !== document.getElementById('mode_select').value) {
        mode = document.getElementById('mode_select').value
        cur_level = player.pong[mode].level
    }
    if (cur_level != 0) {
        cur_level -= 1
        clear_game()
    }
}

function clear_game() {
    document.getElementById("game_button").style.display = "block"
    document.getElementById("previous").style.display = "none"
    document.getElementById("next").style.display = "none"
    document.getElementById("restart").style.display = "none"
    document.getElementById('level_name').innerHTML = "Level " + cur_level
    if (mode !== document.getElementById('mode_select').value) {
        mode = document.getElementById('mode_select').value
        cur_level = player.pong[mode].level
    }
    if (!player.pong[mode].levels[cur_level]) {
        player.pong[mode].levels[cur_level] = {
            played: 0,
            wins: 0,
            lose: 0,
            high_score: undefined,
            time_played: 0,
        }
    }

    if (player.pong[mode].levels[cur_level].wins >= 1) {
        document.getElementById("next").style.display = "block"
    }
    if (cur_level > 0) {
        document.getElementById("previous").style.display = "block"
    }

    if (play) {
        play.stop = true
        if (play.interval) {
            clearInterval(play.interval)
        }
    }

    let win_message = document.getElementById("win_message")
    if (win_message) {
        win_message.style.display = "none"
    }
    let timer = document.getElementById("timer")
    if (timer) {
        timer.style.display = "none"
    }

    player.pong[mode].level = cur_level
    save("player", player)
}