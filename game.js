const canvas = document.querySelector('#game')
const game = canvas.getContext('2d')
const btnUp = document.querySelector('#up')
const btnLeft = document.querySelector('#left')
const btnRight = document.querySelector('#right')
const btnDown = document.querySelector('#down')
const spanLives = document.querySelector('#lives')
const spanTime = document.querySelector('#time')
const spanRecord = document.querySelector('#record')

let canvasSize, elementSize

const playerPosition = {
    x: undefined,
    y: undefined,
}

const giftPosition = {
    x: undefined,
    y: undefined,
}

const collisionPosition = {
    x: undefined,
    y: undefined,
}

const nlives = 3

let enemyPosition = []

let level = 0

let getGift = false

let map = []

let lives = nlives

let timeStart
let timePlayer
let timeInterval
let beginPlay
let endPlay
let recordTime
let enemyCollision


const startGame = () => {
    game.font = elementSize + 'px Verdana'
    game.textAlign = 'end'
    endPlay = false

    if (!timeStart && beginPlay) {
        timeStart = Date.now()
        timeInterval = setInterval(showtime, 100)
    }
    showLives()
    showRecordTime()

    map = maps[level]

    if (!map) {
        endGame()
        return
    }

    mapRowsCols = map.trim().split('\n').map(row => row.trim().split(''))
    game.clearRect(0, 0, canvasSize, canvasSize)
    enemyPosition = []
    mapRowsCols.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            const posX = elementSize * (colI + 1)
            const posY = elementSize * (rowI + 1)
            if (col == 'O') {
                if (!playerPosition.x && !playerPosition.y) {
                    playerPosition.y = posY
                    playerPosition.x = posX
                }
            } else if (col == 'I') {
                giftPosition.y = posY
                giftPosition.x = posX
            } else if (col == 'X') {
                enemyPosition.push({
                    x: posX,
                    y: posY
                })
            }
            game.fillText(emojis[col], posX, posY)

        })
    });
    movePlayer()
}

const movePlayer = () => {
    getGift = playerPosition.x == giftPosition.x && playerPosition.y == giftPosition.y
    if (getGift) {
        winLevel()
    }
    enemyCollision = enemyPosition.find(enemy => {
        const enemyCollisionX = enemy.x == playerPosition.x
        const enemyCollisionY = enemy.y == playerPosition.y
        return enemyCollisionX && enemyCollisionY
    })

    if (enemyCollision) {
        game.fillText(emojis['BOMB_COLLISION'], playerPosition.x, playerPosition.y)
        levelFail()
    }

    game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y)
    
}

const showBoom = () => {
    game.fillText(emojis['BOMB_COLLISION'], collisionPosition.x, collisionPosition.y)
}

const setCanvasSize = () => {

    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.7
    } else {
        canvasSize = window.innerHeight * 0.7
    }

    canvasSize = Number(canvasSize.toFixed(0))

    canvas.setAttribute('width', canvasSize)
    canvas.setAttribute('height', canvasSize)
    elementSize = Math.round(canvasSize / 10)

    playerPosition.x = undefined
    playerPosition.y = undefined
    startGame()
}


const setRecordTime = () => {
    if (!recordTime) {
        recordTime = timePlayer
        localStorage.setItem("record", timePlayer)
    } else {
        if (timePlayer <= recordTime || recordTime === 0) {
            recordTime = timePlayer
            localStorage.setItem("record", timePlayer)
        }
    }
}

const showMessageEndGame = () => {
    swal("No hay mas niveles", "¿Desea continuar el juego?", "info", {
        buttons: {
            btnSi: {
                text: "Si",
                value: "S",
                defeat: true,
            },
            btnNo: {
                text: "No",
                value: "N",
            },
        },
        dangerMode: true,
    })
        .then((value) => {
            switch (value) {
                case "S":
                    startGame();
                    break;
                case "N":
                    exitGame();
                    break;
                default:
                    showMessageEndGame();
                    break;
            }
        });
}

const winLevel = () => {
    level++
    getGift = false
}

const endGame = () => {
    level = 0
    getGift = false
    beginPlay = false
    playerPosition.x = undefined
    playerPosition.y = undefined
    setRecordTime()
    showRecordTime()
    clearInterval(timeInterval)
    timeStart = undefined
    endPlay = true
    showMessageEndGame()
}

const levelFail = () => {
    lives--
    if (lives <= 0) {
        lives = nlives
        level = 0
        clearInterval(timeInterval)
        timeStart = undefined
        beginPlay = false
    }
    
    playerPosition.x = undefined
    playerPosition.y = undefined
    
}

const showTimeFormat = (time) => {
    return (new Date(Number(time)).toISOString().slice(11, 19))
}

const showLives = () => {
    spanLives.innerHTML = emojis['HEART'].repeat(lives)
}

const showtime = () => {
    timePlayer = Date.now() - timeStart
    spanTime.innerHTML = showTimeFormat(timePlayer)
}

const showRecordTime = () => {
    recordTime = Number(localStorage.getItem("record") === null) ? 0 : localStorage.getItem("record")
    spanRecord.innerHTML = showTimeFormat(recordTime)
}

const showCollision = (posX, posY) => {
    console.log({playerPosition})
    game.fillText(emojis['BOMB_COLLISION'], posX, posY)
}


const exitGame = () => {
    window.open('', '_parent', '');
    window.close();
}


const moveByKeys = (event) => {
    if (endPlay) {
        return
    }
    beginPlay = true
    switch (event.key) {
        case 'ArrowUp':
            moveUp()
            break;
        case 'ArrowLeft':
            moveLeft()
            break;
        case 'ArrowRight':
            moveRight()
            break;
        case 'ArrowDown':
            moveDown()
            break;
    }
    startGame()
}

const moveUp = () => {
    if ((playerPosition.y - elementSize) < elementSize) {
        console.log('OUT-UP')
    } else {
        playerPosition.y -= elementSize
    }
}
const moveLeft = () => {
    if ((playerPosition.x - elementSize) < elementSize) {
        console.log('OUT-LEFT')
    } else {
        playerPosition.x -= elementSize
    }
}
const moveRight = () => {
    if ((playerPosition.x + elementSize) > canvasSize) {
        console.log('OUT-RIGHT')
    } else {
        playerPosition.x += elementSize
    }
}
const moveDown = () => {
    if ((playerPosition.y + elementSize) > canvasSize) {
        console.log('OUT-DOWN')
    } else {
        playerPosition.y += elementSize
    }
}


window.addEventListener('load', setCanvasSize)
window.addEventListener('resize', setCanvasSize)

window.addEventListener('keydown', moveByKeys)
btnUp.addEventListener('click', moveUp)
btnLeft.addEventListener('click', moveLeft)
btnRight.addEventListener('click', moveRight)
btnDown.addEventListener('click', moveDown)