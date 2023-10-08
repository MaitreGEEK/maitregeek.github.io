let levels, levels_mode
function init_levels(mode) {
    levels_mode = mode
    levels = get(mode + "_levels")

    if (!levels) {
        switch (mode) {
            case "flow":
                levels = [ //Level + (length+1)
                    [7, 15, 10] //ballspeed, timer, enemy score
                ]
                break
            case "superSpeed":
                levels = [ //Level + (length+1) //ballspeed, timer, enemy score
                    [12, 5, 0],
                    [12, 6, 0],
                    [12, 7, 0],
                    [12, 8, 0],
                ]
                break
            case "survival":
                levels = [ //Level + (length+1)  //ballspeed, timer, enemy score
                    [6, 30, 15],
                    [6, 60, 15],
                    [7, 60, 10],
                ]
                break
            case "superSpeedSurvival":
                levels = [ //Level + (length+1)//ballspeed, timer, enemy score
                    [12, 30, 15],
                    [12, 60, 15],
                    [12, 60, 10],
                ]
                break
            default:
                return undefined
        }
    }
    save(mode + "_levels", levels)
    return levels
}

function gen_level(stats, level) {
    //Générer des levels en fonction du nombre de fautes omises par joueurs (en calculant son high score sur le level précédent et de son Win/Lose)

    /* Stats:
    level = {
                played: 0,
                wins: 0,
                lose: 0,
                high_score: undefined,
                time_played: 0,
            }
    */

    //high score = player score - bot score 
    let new_level = [null, null, null]
    if (stats.high_score >= level[2]) {
        //Vitesse de la baballe
        new_level[0] = level[0] + randomBetween(0, 1)
        if (new_level[0] > 12) new_level[0] = 12 //12 est le maximum, plus c'est le bordel

        //Timer
        new_level[1] = level[1] + randomBetween(0, 3)

        //PT ennemi
        if (level[2] > 0) new_level[2] = level[2] - Math.floor(randomBetween(1, 5))
        else new_level[2] = level[2]
    }
    else if (stats.high_score > Math.floor(level[2] / 2)) { // Plus de la moitié
        new_level[0] = level[0]
        //Timer
        new_level[1] = level[1] + randomBetween(0, 2)

        //PT ennemi
        if (level[2] > 0) new_level[2] = level[2] - Math.floor(randomBetween(1, 5))
        else new_level[2] = level[2]
    }
    else if (stats.high_score <= Math.floor(level[2] / 2)) { // La moitié et moins
        new_level[0] = level[0]
        new_level[1] = level[1]

        //PT ennemi
        if (level[2] > 0) new_level[2] = level[2] - Math.floor(randomBetween(1, 5))
        else new_level[2] = level[2]
    }

    levels.push(new_level)
    save(levels_mode + "_levels", levels)

    return true
}