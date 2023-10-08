/**
 * *Cette fonction va nous servir à sauvegarder la valeur value à l'espace key (clé) dans le localStorage*
 * @param { String } key - **Clé dans la base de donnée**
 * @param { Object } value - **Valeur associée à la clé**
 * @returns { Boolean } **Si l'opération s'est effectuée True sinon False**
 */
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
    return true
}

/**
 * *Cette fonction va nous servir pour récupérer la valeur value à l'espace key (clé) dans le localStorage*
 * @param { String } key - **Clé dans la base de donnée**
 * @returns { Object } **Valeur associée à la clé**
 */
function get(key) {
    let value = localStorage.getItem(key)
    if (value) {
        value = JSON.parse(value)
    }
    return value
}


function init_player() {
    //Generate a form to ask him his pseudo
    pseudo = "Player"
    let modes = ["flow", "superSpeed", "survival", "superSpeedSurvival"]
    let player = {
        pseudo: pseudo,
        pong: {},
        created: Date.now(),
    }
    for (let elt of modes) {
        player.pong[elt] = {
            level: 0,
            lose: 0,
            wins: 0,
            parties_played: 0,
            time_played: 0,
            levels: {}
        }
    }

    save("player", player)
    return player
}

/**
 * 
 * @param {*} min 
 * @param {*} max 
 * @returns 
 */
function randomBetween(min, max) {
    nombreAleatoire = Math.random() * (max - min) + min;
    return nombreAleatoire
}