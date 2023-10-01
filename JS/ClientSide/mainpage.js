let book = [ // Livre représenté sous forme d'une liste, chaque élément représente une page
    { display: [".background_img"], animation: '/assets/icons/background/book_open_2.gif', arrows: "none", infinite_anim: false },
    { display: [".content", ".features", ".feature",], animation: { left: '/assets/icons/background/book_close.gif', right: '/assets/icons/background/page_turn.gif' }, arrows: "both" },
    { display: [".features", '.feature_2', ".feature_3"], animation: { left: '/assets/icons/background/page_unturn.gif', right: '/assets/icons/background/page_turn.gif' }, arrows: "both" },
    { display: ["header", "footer"], animation: { left: '/assets/icons/background/page_unturn.gif' }, infinite_anim: false, arrows: "left", background: "/assets/icons/background/home_background.png" },
    //{ display: [""], animation: '' },
]

let mobile_book = [
    { display: [".background_img"], animation: '/assets/icons/background/book_open_2.gif', arrows: "none", infinite_anim: false },
    { display: [".content"], animation: { left: '/assets/icons/background/book_close.gif', right: '/assets/icons/background/page_turn.gif' }, background: "/assets/icons/background/demi_page_left.png", infinite_anim: false, arrows: "both" },
    { display: [".features", ".feature",], animation: { left: '/assets/icons/background/page_turn.gif', right: '/assets/icons/background/page_turn.gif' }, background: "/assets/icons/background/demi_page_right.png", infinite_anim: false, arrows: "both" },
    { display: [".features", '.feature_2'], animation: { left: '/assets/icons/background/page_turn.gif', right: '/assets/icons/background/page_turn.gif' }, background: "/assets/icons/background/demi_page_left.png", infinite_anim: false, arrows: "both" },
    { display: [".features", ".feature_3"], animation: { left: '/assets/icons/background/page_turn.gif', right: '/assets/icons/background/page_turn.gif' }, background: "/assets/icons/background/demi_page_right.png", infinite_anim: false, arrows: "both" },
    { display: ["header"], animation: { left: '/assets/icons/background/page_turn.gif', right: '/assets/icons/background/page_turn.gif' }, background: "/assets/icons/background/demi_page_home_background.png", infinite_anim: false, arrows: "both" },
    { display: ["footer"], animation: { left: '/assets/icons/background/page_turn.gif' }, background: "/assets/icons/background/demi_page_right.png", infinite_anim: false, arrows: "left" },
]

let all_elements = ["#left_arrow", "#right_arrow"]
function get_all_elements() {
    for (let element of book) {
        for (let elt of element.display) {
            if (all_elements.includes(elt)) continue
            all_elements.push(elt)
        }
    }
}

function display(value, array) {
    for (let elt of array) {
        let element
        if (elt.includes('#')) {
            elt = elt.slice(1)
            element = document.getElementById(elt)
        }
        else {
            element = document.querySelector(elt)
        }
        element.style.display = value

    }
}

var page_number = 0
function turn_page(sens) {
    let page = book[page_number]
    let origin_num = page_number

    if (sens == "left") {
        page_number -= 1
    } else {
        page_number += 1
    }

    if (screen.width <= 768) {
        if (page_number < 0 || page_number > mobile_book.length) {
            page_number = origin_num
            return "bruh"
        }
        page = mobile_book[origin_num]
    }
    else {
        if (page_number < 0 || page_number > book.length) {
            page_number = origin_num
            return "bruh"
        }
    }


    //GIF SRC
    let animation_src = ""
    if (typeof page.animation != "string") {
        animation_src = page.animation[sens]
    } else {
        animation_src = page.animation
    }

    //DISPLAY NONE ALL 
    display("none", all_elements)

    //GIF APPEND
    let gifImage = document.createElement('img')
    gifImage.style.display = "block"
    gifImage.style.width = "100%"
    gifImage.style.height = "100%"
    gifImage.src = animation_src;
    gifImage.autoplay = true;

    let gif_container = document.getElementById('gif_container');
    gif_container.innerHTML = '';
    gif_container.style.display = "block";
    gif_container.appendChild(gifImage);

    //POUF
    setTimeout(() => {
        let new_page = book[page_number]
        if (screen.width <= 768) {
            new_page = mobile_book[page_number]
        }

        if (new_page.infinite_anim != undefined && new_page.infinite_anim == false) {
            if (new_page.background != undefined) {
                gifImage.src = new_page.background
            }
            else {
                gifImage.style.display = "none"
                gif_container.style.display = "none"
            }
        }

        if (new_page.arrows != "none") {
            if (new_page.arrows == "left" || new_page.arrows == "both") {
                left_arrow.style.display = "block"
            }
            if (new_page.arrows == "right" || new_page.arrows == "both") {
                right_arrow.style.display = "block"
            }
        }

        display("block", new_page.display)
    }, 250);
}

function init_display() {
    get_all_elements()
    display("none", all_elements)
    let gif_container = document.getElementById('gif_container');
    gif_container.style.display = "none"

    let new_page = book[page_number]
    if (screen.width <= 768) {
        new_page = mobile_book[page_number]
    }

    if (new_page.arrows != "none") {
        if (new_page.arrows == "left" || new_page.arrows == "both") {
            left_arrow.style.display = "block"
        }
        if (new_page.arrows == "right" || new_page.arrows == "both") {
            right_arrow.style.display = "block"
        }
    }

    display("block", new_page.display)
}