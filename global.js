const socket = io()

/**
 * **Transform a string into a proper case**
 * @returns { String } The String as a proper case with a capital as its first letter and the other as lowercase.
 */
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

/**
 * **Check if it's actualy Day or Night and return the perfect suffix to**
 * @param { Number } hour - Actual Hour to get if it's the night or the day
 * @returns { String } Suffix that can be added to something to show that's it's night or day.
 */
function getTimeByHour(hour) {
    let isDay = hour > 6 && hour < 20;
    if (!isDay) {
        return "_night"
    } else {
        return ""
    }
}


var userid, quests, actual_npc, other

socket.on('connect', () => {
    console.log("Connected")
    waitForUser();
})

socket.on("quests", response => {
    if (userid != response.userid) return
    quests = response.quests
    quests_display()
})

function init(playerid, other_ = null) {
    userid = playerid
    other = other_
}

socket.on("redirect", (response) => {
    if (response.userid != userid) return
    else {
        window.location.href = response.to
    }
})

socket.on("modal", (response) => {
    if (response.userid != userid) return

    let modalWindow = window.open(window.location.origin + response.page, 'modal', 'width=10,height=10');
})

socket.on("close", (response) => {
    if (response.userid != userid) return

    if (response.page == window.location.pathname) {
        window.close();
    }
})

socket.on("notification", (response) => {
    if (response.userid != userid) return
    let notification = document.getElementById('notification') || document.createElement('div')
    notification.id = "notification"
    notification.innerHTML = response.message
    notification.style.display = "flex"

    document.body.appendChild(notification)

    setTimeout(() => { notification.style.display = 'none' }, 3000)
})

socket.on("dialog", (response) => {
    if (response.userid != userid) return
    //assets\characters\NPC\unknow_npc.png
    if (!response.dialog) return
    let messages = response.dialog.split("/")

    let overlay = document.getElementById('overlay') || document.createElement('div')
    overlay.id = "overlay"
    overlay.innerHTML = ""
    overlay.style.display = "block"

    let dialog_box = document.createElement('div')
    dialog_box.id = "dialog-box"

    let img = document.createElement('img')
    img.id = "npc-image"

    let message_container = document.createElement('div')
    message_container.id = "message-container"

    let arrow = document.createElement("div")
    arrow.id = "arrow"

    let arrow_inner = document.createElement("div")
    arrow_inner.id = "arrow-inner"

    let message_content = document.createElement('div')
    message_content.id = "message-content"

    message_container.appendChild(message_content)
    dialog_box.appendChild(message_container)
    dialog_box.appendChild(img)
    overlay.appendChild(dialog_box)
    document.body.appendChild(overlay)

    let actual_mention
    function typeMessage(message) {
        message_content.innerHTML = ""

        let display_message = ""

        let mention
        if (message.length > 1) {
            mention = message.match(/@\S+\s/)
            if (mention) {
                mention = mention[0].slice(0, -1)
                actual_mention = mention
            }
        }
        if ((!mention) && (actual_mention)) {
            mention = actual_mention
        }
        let npc
        if (mention) {
            if (response.characters) {
                npc = response.characters[mention]
                actual_npc = npc
            }

            if (!npc) {
                if ((mention != "@narrator") && (mention != "@you")) {
                    npc = { name: "?¿?¿?¿?¿", image: "assets/characters/NPC/unknow_npc.png" }
                    display_message += npc.name + ": "
                }
            }
            if (message.includes(mention)) {
                display_message += message.split(mention)[1]
            }
            else {
                display_message += message
            }
        }
        else {
            display_message += message
        }
        let html_message = textToHTML(display_message)
        return new Promise(resolve => {
            let index = 0;
            function typeWriter() {
                if (index < display_message.length) {
                    message_content.innerHTML += display_message.charAt(index);
                    index++;
                    setTimeout(typeWriter, Math.floor(Math.random()) + 35); //Ajoute un peu de variété dans la vitesse de dactylographie
                }
                else return message_content.innerHTML = html_message
            }
            function skip_typing() {
                index = display_message.length
                message_content.innerHTML = html_message
                message_container.addEventListener('click', skip)
            }

            function skip() {
                index = display_message.length
                message_content.innerHTML = html_message
                resolve()
            }
            arrow.addEventListener('click', skip)
            arrow.appendChild(arrow_inner)

            arrow.style.cursor = "pointer"
            arrow.style.zIndex = 10000000000
            message_container.appendChild(arrow)
            message_container.addEventListener('click', skip_typing)

            if (npc) {
                img.src = npc.image || "assets/characters/NPC/unknow_npc.png"
                img.style.display = "block"
                actual_npc = npc
            }
            else {
                img.style.display = "none"
            }

            typeWriter()
        });
    }

    async function displayMessages() {
        for (let message of messages) {
            await typeMessage(message)
        }
        try {
            if (response.responses) {
                let responses = document.createElement('div')
                responses.id = "dialog-responses"

                for (let elt of response.responses) {
                    let response_div = document.createElement('div')
                    response_div.id = response.adventureId + "#" + elt.id + "#" + response.actionId
                    response_div.innerHTML = `<p id="${response.adventureId + "#" + elt.id + "#" + response.actionId}"> > ` + elt.message + "</p>"
                    response_div.style.cursor = "pointer"
                    response_div.addEventListener('click', response_chosen)

                    responses.appendChild(response_div)
                }
                message_container.appendChild(responses)
            }
            else if (response.adventureId == "npc_chat") { //AI CHAT
                let input = document.createElement('input')
                input.id = "user_response"
                input.placeholder = "Type your message"
                input.className = "chat-input"
                input.addEventListener("keydown", response_written)

                let button_send = document.createElement('button')
                button_send.addEventListener('click', response_send)
                button_send.innerHTML = "Send"
                button_send.className = "chat-send-button"

                let close = document.createElement("span")
                close.className = "close"
                close.innerHTML = "&times;"
                close.addEventListener('click', chatStop)

                message_container.appendChild(close)
                message_container.appendChild(input)
                message_container.appendChild(button_send)
            }
            else {
                overlay.style.display = "none"
                socket.emit('adventure_pass', { userid: userid, adventureId: response.adventureId, actionId: response.actionId, location: location.pathname })
            }
        }
        catch (e) {
            if (response.adventureId == "npc_chat") { //AI CHAT
                let input = document.createElement('input')
                input.id = "user_response"
                input.placeholder = "Type your message"
                input.className = "chat-input"
                input.addEventListener("keydown", response_written)


                let button_send = document.createElement('button')
                button_send.addEventListener('click', response_send)
                button_send.innerHTML = "Send"
                button_send.className = "chat-send-button"

                let close = document.createElement("span")
                close.className = "close"
                close.innerHTML = "&times;"
                close.addEventListener('click', chatStop)

                message_container.appendChild(close)
                message_container.appendChild(input)
                message_container.appendChild(button_send)
            }
            else {
                overlay.style.display = "none"
                socket.emit('adventure_pass', { userid: userid, adventureId: response.adventureId, actionId: response.actionId, location: location.pathnames })
            }
        }
    }

    displayMessages()
})

function response_written(event) {
    let input = document.getElementById("user_response")
    if (event.key === "Enter" && input.value.trim() !== "") {
        waiting_response()
        socket.emit('adventure_pass', { userid: userid, adventureId: "npc_interaction", time: new Date(Date.now()), responseId: "chat", location: location.pathname, npcId: actual_npc.id, message: input.value })
        input.value = "";
    }
}

function response_send(event) {
    let input = document.getElementById("user_response")
    if (!input.value) return
    waiting_response()
    socket.emit('adventure_pass', { userid: userid, adventureId: "npc_interaction", time: new Date(Date.now()), responseId: "chat", location: location.pathname, npcId: actual_npc.id, message: input.value })
    input.value = "";
}

function waiting_response() {
    let message_container = document.getElementById("message-container")
    message_container.innerHTML = ""
    let typing = document.createElement('div')
    typing.className = "typing-indicator"

    for (let i = 0; i < 3; i++) {
        let span = document.createElement('span')
        span.innerHTML = "•"
        typing.appendChild(span)
    }
    message_container.appendChild(typing)
}

function response_chosen(event) {
    let response = event.target.id.split("#")
    document.getElementById('overlay').style.display = "none"
    socket.emit('adventure_pass', { userid: userid, adventureId: response[0], actionId: response[2], responseId: response[1], location: location.pathname, npcId: actual_npc.id })
}

function chatStop() {
    let overlay = document.getElementById('overlay')
    overlay.style.display = "none"
}

function textToHTML(text) {
    let html
    try {
        converter = new showdown.Converter()
        html = converter.makeHtml(text)
    }
    catch {
        html = text
    }

    return html
}

function quests_display() {
    let bigcontainer = document.getElementById("bigcontainer") || document.createElement('div')
    bigcontainer.id = "bigcontainer"
    bigcontainer.innerHTML = ""
    bigcontainer.style.display = "block"

    let dropdownContainer = document.createElement('div')
    dropdownContainer.id = "dropdown-container"

    let dropdownToggle = document.createElement('div')
    dropdownToggle.id = "dropdown-toggle"

    dropdownToggle.addEventListener('click', function () {
        dropdownContainer.classList.toggle('open');
    });

    let currentQuest = document.createElement("span")
    currentQuest.id = "current-quest"
    currentQuest.innerHTML = "Current Quests"

    let arrowDown = document.createElement("span")
    arrowDown.id = "arrow-down"
    arrowDown.innerHTML = "&#9660;"

    let dropdownMenu = document.createElement("div")
    dropdownMenu.id = "dropdown-menu"

    let ul = document.createElement('ul')
    for (let questId of Object.keys(quests)) {
        let quest = quests[questId]
        if (quest.done) continue

        let li = document.createElement('li')
        li.id = questId

        let message = "Quest " + questId + ": "
        message += "<em>" + (quest.details || "") + "</em> "
        try {
            if (quest.steps) {
                let step
                if (quest.steps.length > 1) {
                    step = quest.steps[quest.steps.length - 1]
                }
                else {
                    step = quest.steps[0]
                }
                message = stepToMessage(step, message)
            }
            else {
                if (quest.type) {
                    //It's a step 
                    message = stepToMessage(quest, message)
                }
            }
        }
        catch (e) {
            if (quest.type) {
                //It's a step 
                message = stepToMessage(quest, message)
            }
        }

        li.innerHTML = message
        li.addEventListener("click", quest_display)
        li.style.cursor = "pointer"

        ul.appendChild(li)
    }
    dropdownContainer.appendChild(dropdownToggle)
    dropdownToggle.appendChild(currentQuest)
    dropdownToggle.appendChild(arrowDown)
    dropdownContainer.appendChild(dropdownMenu)
    dropdownMenu.appendChild(ul)

    bigcontainer.appendChild(dropdownContainer)
    document.body.appendChild(bigcontainer)
}

function stepToMessage(step, message) {
    switch (step.type) {
        case "farm":
            message += step.farmType
            if (Array.isArray(step.farmWhat)) {
                for (let elt of step.farmWhat) {
                    message += " " + elt.quantity_get.toLocaleString() + "/" + elt.quantity.toLocaleString() + " " + elt.name
                }
            }
            else {
                let elt = step.farmWhat
                message += " " + elt.quantity_get.toLocaleString() + "/" + elt.quantity.toLocaleString() + " " + elt.name
            }
            break;
        case "interaction":
            message += "<strong>" + step.interactionType + "</strong>" + " " + step.interactionWhat.name
            break;
    }
    return message
}

function quest_display(event) {
    let questId = event.target.id
    let quest = quests[questId]
    if (!quest) return

    let bigmodal = document.getElementById("bigmodal") || document.createElement('div')
    bigmodal.id = "bigmodal"
    bigmodal.innerHTML = ""
    bigmodal.style.display = "block"

    let modal = document.createElement("div")
    modal.id = "modal"

    let h2 = document.createElement('h2')
    h2.innerHTML = "Quest " + questId

    let em = document.createElement('em')
    em.innerHTML = (quest.details || "No details provided")

    let expire = document.createElement("p")
    expire.style.color = "red"
    let date
    if (quest.limitDate) {
        let limitDate = new Date(quest.limitDate)
        date = "Expire at: " + limitDate.toLocaleTimeString() + " on " + limitDate.toLocaleDateString()
    }
    else date = "Never Expire"
    expire.innerHTML = date
    let h3 = document.createElement('h3')
    h3.innerHTML = "Current step: "
    let message = ""
    try {
        if (quest.steps) {
            let step
            if (quest.steps.length > 1) {
                step = quest.steps[quest.steps.length - 1]
            }
            else {
                step = quest.steps[0]
            }
            message = stepToMessage(step, message)
        }
        else {
            if (quest.type) {
                //It's a step 
                message = stepToMessage(quest, message)
            }
            else {
                h3.innerHTML = ""
            }
        }
    }
    catch (e) {
        if (quest.type) {
            //It's a step 
            message = stepToMessage(quest, message)
        }
        else {
            h3.innerHTML = ""
        }
    }
    let rewardH3, reward_div
    if (quest.reward) {
        rewardH3 = document.createElement('h3')
        rewardH3.innerHTML = "Rewards: "

        reward_div = document.createElement("p")
        reward_div.id = "reward_div"

        function rewardDisplay(reward) {
            return reward.quantity.toLocaleString() + " <strong>" + reward.proper_name + "</strong>"
        }

        let reward_message = ""
        if (Array.isArray(quest)) {
            for (let reward of quest) {
                reward_message += rewardDisplay(reward)
            }
        }
        else {
            reward_message += rewardDisplay(quest.reward)
        }

        reward_div.innerHTML = reward_message
    }

    let p = document.createElement("p")
    p.innerHTML = message

    let modalContent = document.createElement('div')
    modalContent.id = "modal-content"

    let close = document.createElement("span")
    close.className = "close"
    close.innerHTML = "&times;"
    close.addEventListener('click', close_quest)

    modalContent.appendChild(close)
    modalContent.appendChild(h2)
    modalContent.appendChild(em)
    modalContent.appendChild(expire)
    modalContent.appendChild(h3)
    modalContent.appendChild(p)
    if (quest.reward) {
        modalContent.appendChild(rewardH3)
        modalContent.appendChild(reward_div)
    }


    modal.appendChild(modalContent)
    bigmodal.appendChild(modal)

    document.body.appendChild(bigmodal)
}

function close_quest() {
    document.getElementById("modal").style.display = "none"
}

function createHTMLElementFromString(htmlString) {
    const div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}
