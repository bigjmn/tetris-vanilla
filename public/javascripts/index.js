import {playertags} from './tagmaker.js'
import {makepiece, makepreview} from './gameplay.js'
import {Board} from './board.js'
import {maskControls} from './utils.js'
import {Soundboard} from './makeaudio.js'

const BOMBSPEED = 6 // rows per second

function drawDynamite(ctx, centerX, bottomY, blocksize) {
  const bw = blocksize * 0.65
  const bh = blocksize * 0.85
  const x = centerX - bw / 2
  const bodyTop = bottomY - bh

  ctx.save()

  // Fuse
  ctx.beginPath()
  ctx.strokeStyle = '#7B4F2E'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.moveTo(centerX - bw * 0.1, bodyTop)
  ctx.quadraticCurveTo(
    centerX + bw * 0.35, bodyTop - bh * 0.15,
    centerX + bw * 0.3,  bodyTop - bh * 0.4
  )
  ctx.stroke()

  // Spark
  const sparkX = centerX + bw * 0.3
  const sparkY = bodyTop - bh * 0.4
  ctx.beginPath()
  ctx.fillStyle = '#FF6600'
  ctx.arc(sparkX, sparkY, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.fillStyle = '#FFD700'
  ctx.arc(sparkX, sparkY, 1.2, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.fillStyle = '#CC1111'
  ctx.fillRect(x, bodyTop, bw, bh)

  // Top and bottom caps
  ctx.fillStyle = '#991111'
  ctx.fillRect(x, bodyTop,           bw, bh * 0.07)
  ctx.fillRect(x, bottomY - bh * 0.07, bw, bh * 0.07)

  // Bands
  ctx.fillStyle = '#444444'
  ctx.fillRect(x, bodyTop + bh * 0.30, bw, bh * 0.09)
  ctx.fillRect(x, bodyTop + bh * 0.62, bw, bh * 0.09)

  // Highlight
  ctx.fillStyle = 'rgba(255,100,100,0.4)'
  ctx.fillRect(x + bw * 0.08, bodyTop + bh * 0.10, bw * 0.22, bh * 0.78)

  // Outline
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(x, bodyTop, bw, bh)

  ctx.restore()
}

console.log('[DEBUG] index.js module executing, connecting to:', window.location.href)
const socket = io.connect(window.location.href)
socket.on('connect', () => {
  console.log('[DEBUG] socket connected, id:', socket.id)
  let username = document.getElementById('usernameholder').innerHTML
  console.log('[DEBUG] username from DOM:', JSON.stringify(username))
  socket.emit('giveusername', {username:username})
})
socket.on('connect_error', (err) => {
  console.error('[DEBUG] socket connect_error:', err.message)
})
socket.on('pleasewait', () => {
  console.log('[DEBUG] pleasewait received')
  $('#waitcard').show()
})
socket.on('optionpage', () => {
  console.log('[DEBUG] optionpage received')
  $('#waitcard').hide()
  $('#optionsholder').show()
  console.log('[DEBUG] optionsholder display after show():', document.getElementById('optionsholder').style.display)
})
//key event listeners. not bound yet, just defined
const handleKey = (e) => {
  let m;
  switch (e.key) {
    case 'ArrowUp':
    m = 'rotate'
    break;

    case 'ArrowLeft':
    m = 'left'
    break;

    case 'ArrowRight':
    m = 'right'
    break;

    case 'Spacebar':
    m = 'autodrop'
    break;

    case " ":
    m = 'autodrop'
    break;

    case "ArrowDown":
    m = 'down'
    break;

    default:
    return;

  }
  socket.emit('move', {move:m})
}
const bindKeys = () => {
  window.addEventListener('keydown', handleKey)
}
const unbindKeys = () => {
  window.removeEventListener('keydown', handleKey)
}

// Track which moves the current player is responsible for
const myControls = {left: false, rotate: false, right: false}

// Card-based touch controls: delegate on #nameholder (exists in static HTML)
document.getElementById('nameholder').addEventListener('touchstart', (e) => {
  if (!gameState.playing) return
  const slotMoves = ['left', 'rotate', 'right']
  // Visible control slot (own playercontrols)
  for (const move of slotMoves) {
    const el = document.getElementById(socket.id + move)
    if (el && (e.target === el || el.contains(e.target))) {
      e.preventDefault()
      socket.emit('move', {move: myControls[move] ? move : 'autodrop'})
      return
    }
  }
  // Masked control slot (own controlmask)
  const maskContainer = document.getElementById(socket.id + 'controlmask')
  if (maskContainer && maskContainer.contains(e.target)) {
    const move = e.target.dataset.move
    if (move) {
      e.preventDefault()
      socket.emit('move', {move: myControls[move] ? move : 'autodrop'})
    }
    return
  }
  // Drop controls (own card only — always available)
  const ownTag = document.getElementById(socket.id + 'tag')
  if (ownTag && ownTag.contains(e.target) && e.target.classList.contains('dropcontrol')) {
    const move = e.target.dataset.move
    if (move) {
      e.preventDefault()
      socket.emit('move', {move})
    }
  }
}, {passive: false})

document.getElementById('nameholder').addEventListener('click', (e) => {
  if (!gameState.playing) return
  const ownTag = document.getElementById(socket.id + 'tag')
  if (ownTag && ownTag.contains(e.target) && e.target.classList.contains('dropcontrol')) {
    socket.emit('move', {move: e.target.dataset.move})
  }
})

$('#prevmode').on('click', () => {
  socket.emit('changemode', {type:1})
})
$('#nextmode').on('click', () => {
  socket.emit('changemode', {type:2})
})

$('.togglejump').on('click', () => {
  socket.emit('togglejump')
})

$('.togglesuper').on('click', () => {
  socket.emit('togglesuper')
})

socket.on('takecode', (data) => {
  console.log('[DEBUG] takecode received:', data)
  $('#roomcode').text(`Room Code: ${data.roomcode}`)
  $('#teamnameholder').text(`Team: ${data.roomname}`)
})

socket.on('takemode', (data) => {
  console.log('[DEBUG] takemode received:', data)
  $('.modename').hide()
  $('.moderules').hide()
  $('.jumptype').hide()
  $('.jumprules').hide()
  $('.supertype').hide()
  $('.superrules').hide()

  $('#modename'+data.mode.toString()).show()
  $('#moderules'+data.mode.toString()).show()

  if (data.jumpins){
    $('#jumpin').show()
    $('#jumpon').show()
  }
  else{
    $('#nojumpin').show()
    $('#jumpoff').show()
  }

  if (data.supermode){
    $('#superin').show()
    $('#superon').show()
  }
  else{
    $('#nosuper').show()
    $('#superoff').show()
  }
})

const mutebutton = document.querySelector('#mutebutton')
const soundicon = "<i class='fas'>&#xf028;</i>"
const muteicon = "<i class='fas fa-volume-mute'></i>"
function mutetoggle(){
  gameState.sounds.muted = !gameState.sounds.muted
  mutebutton.innerHTML = gameState.sounds.muted ? muteicon : soundicon
  mutebutton.blur()
}
if (mutebutton) mutebutton.addEventListener('click', mutetoggle)
//tetris gamestate
var gameState = {
  canvas : document.getElementById('canvas'),
  ctx: null,

  preview: document.getElementById('previewcanvas'),
  dtx: null,

  board : null,
  piece : null,
  upcoming: null,
  previewQueue: [],
  previewExtended: 0,
  sneakPeakPending: false,

  bombs: [],
  bombAnimation: null,
  bombLastTime: null,
  bombsBlockingPiece: false,

  playing : false,

  start: function() {

    this.playing = true
    this.ctx = this.canvas.getContext('2d')
    this.dtx = this.preview.getContext('2d')
    this.board = new Board(this.canvas, this.sounds)
    socket.emit('startgame')
  },
  midstart: function(data){
    this.playing = true
    this.ctx = this.canvas.getContext('2d')
    this.dtx = this.preview.getContext('2d')
    this.board = new Board(this.canvas, this.sounds)
    this.board.board = data.boardstate
    this.upcoming = data.ondeck
    socket.emit('readynow')
  },
  update: function(){
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
    if (this.board){
      this.board.drawSolids()
    }
    if (this.piece){
      this.piece.redraw()
    }
    if (this.bombs.length > 0) {
      this.drawBombs()
    }
  },

  drawBombs: function() {
    const blocksize = this.canvas.width / 10
    this.bombs.forEach(bomb => {
      if (bomb.exploded) return
      const centerX = bomb.col * blocksize + blocksize / 2
      drawDynamite(this.ctx, centerX, bomb.y, blocksize)
    })
  },

  startBombs: function() {
    if (!this.board) return
    if (this.bombAnimation) {
      cancelAnimationFrame(this.bombAnimation)
      this.bombAnimation = null
    }
    const blocksize = this.canvas.width / 10
    const bombH = blocksize * 0.85
    this.bombs = []
    for (let col = 0; col < 10; col++) {
      let targetRow = -1
      for (let row = 1; row <= 18; row++) {
        if (this.board.board[row].some(b => b[0] === col)) {
          targetRow = row
          break
        }
      }
      if (targetRow === -1) continue
      this.bombs.push({
        col,
        y: -bombH,
        targetY: (targetRow - 1) * blocksize,
        targetRow,
        exploded: false
      })
    }
    if (this.bombs.length === 0) return
    this.bombLastTime = null
    this.bombAnimation = requestAnimationFrame((t) => this.tickBombs(t))
  },

  tickBombs: function(now) {
    if (!this.board) {
      this.bombs = []
      this.bombAnimation = null
      return
    }
    const blocksize = this.canvas.width / 10
    if (this.bombLastTime === null) this.bombLastTime = now
    const dt = Math.min((now - this.bombLastTime) / 1000, 0.1)
    this.bombLastTime = now

    this.bombs.forEach(bomb => {
      if (bomb.exploded) return
      bomb.y += BOMBSPEED * blocksize * dt
      if (bomb.y >= bomb.targetY) {
        bomb.y = bomb.targetY
        bomb.exploded = true
        const idx = this.board.board[bomb.targetRow].findIndex(b => b[0] === bomb.col)
        if (idx !== -1) this.board.board[bomb.targetRow].splice(idx, 1)
      }
    })

    this.update()

    if (this.bombs.some(b => !b.exploded)) {
      this.bombAnimation = requestAnimationFrame((t) => this.tickBombs(t))
    } else {
      this.bombs = []
      this.update()
      this.bombAnimation = null
      if (this.bombsBlockingPiece && this.playing) {
        this.bombsBlockingPiece = false
        socket.emit('getpiece')
      }
    }
  },

  prevdraw: function(){
    this.dtx.clearRect(0,0,150,120)
    const piecesToShow = this.previewExtended > 0 ?
      [this.upcoming, ...this.previewQueue.slice(0, this.previewExtended - 1)] :
      [this.upcoming]

    const n = piecesToShow.length
    const blocksize = Math.min(30, Math.floor(120 / (n * 2.5)))
    const slotHeight = Math.floor(120 / n)

    piecesToShow.forEach((pieceType, idx) => {
      let showpiece = makepreview(pieceType)
      if (!showpiece) return
      const yOffset = idx * slotHeight
      showpiece.prevarray.forEach(sq => {
        var topleftX = sq[0] * blocksize
        var topleftY = sq[1] * blocksize + yOffset

        this.dtx.fillStyle = showpiece.prevcolor
        this.dtx.fillRect(topleftX, topleftY, blocksize, blocksize)
        this.dtx.strokeRect(topleftX, topleftY, blocksize, blocksize)
      })
    })
  },
  sounds: new Soundboard(),




  createpiece : function(x){
    let i = this.upcoming

    this.piece = makepiece(i, this.canvas)

    if (this.sneakPeakPending) {
      this.sneakPeakPending = false
      this.previewExtended = 3
      this.previewQueue.push(x)
      this.upcoming = this.previewQueue.shift()
      // no decrement — first piece of extended preview, show full 3
    } else if (this.previewExtended > 0) {
      this.previewQueue.push(x)
      this.upcoming = this.previewQueue.shift()
      this.previewExtended--
    } else {
      this.upcoming = x
      this.previewQueue = []
    }

    this.prevdraw()

  },

  countdown:null,

  reset: function(){
    if (this.countdown){
      clearInterval(this.countdown)

    }
    this.piece = null
    this.upcoming = null
    this.previewQueue = []
    this.previewExtended = 0
    this.sneakPeakPending = false
    if (this.bombAnimation) {
      cancelAnimationFrame(this.bombAnimation)
      this.bombAnimation = null
    }
    this.bombs = []
    this.bombLastTime = null
    this.bombsBlockingPiece = false
    this.board = null
    if (this.dtx){
      this.dtx.clearRect(0,0,150,120)
    }
    if (this.ctx){
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
    }
    this.playing = false
  }

}

const resetgame = () => {
  gameState.reset()
  $('#gameover').hide()
  $('#cantsubmit').hide()
  $('#levelstat').text(1)
  $('#penalties').text(0)
  $('#linescleared').text(0)
  $('#powerupslist').empty()
  $('.centerlayer').hide()
  $('#canvas').hide()
  $('#optionsholder').show()
  $('.playercontrols').hide()
  $('.playercontrolmask').hide()
  $('#sendscore').html('Submit Score')
  socket.emit('resetlobby')


}

socket.on('welcome', () => {socket.emit('refresh') })

socket.on('takeplayers', (data) => {
  console.log('[DEBUG] takeplayers received:', data, 'my socket.id:', socket.id)
  var namelist = playertags(data.namelist, socket.id)
  $('#nameholder').html(namelist)
})
socket.on('removeboy', (data) => {
  $(data.oldid).remove()
})
socket.on('takehost', () => {
  console.log('[DEBUG] takehost received')
  $('#waitmessage').hide()
  $('#hostbutton').show()
})

$('#hostbutton').on('click', () => {
  if (gameState.playing){
    return
  }
  socket.emit('launchgame')
})

socket.on('prepgame', (data) => {
  if (gameState.playing){
    return
  }
  $('#optionsholder').hide()
  $('#canvas').show()
  console.log('starting')
  bindKeys()
  gameState.upcoming = data.firstpiece
  gameState.start()

})
socket.on('takeView', (data) => {
  maskControls(data.viewmode, socket.id)
})



socket.on('takepiece', (data) => {
  gameState.createpiece(data.piecetype)
  gameState.update()
})
socket.on('takemove', (data) => {
  if (!gameState.piece || gameState.piece.setting){
    console.log('cant')
    return
  }

  console.log(data.move)
  gameState.piece.move(gameState.board.board, data.move)
  $(data.turngreen).css('background-color', '#23a559')
  setTimeout(() => {
    $(data.turngreen).css('background-color', '')
  }, 200)
  console.log(gameState.piece)

  gameState.update()
  if (gameState.piece.setting){
    gameState.piece.pushtoboard(gameState.board)
    gameState.board.handleset(socket)
  }
})

socket.on('illegal', (data) => {
  gameState.sounds.soundoff('badauto')
  $(data.turnred).css('background-color', '#f23f42')
  setTimeout(() => {
    $(data.turnred).css('background-color', '')
  }, 200)

})

socket.on('takeControls', (data) => {
  $('.control').css('visibility','hidden')
  var infos = data.info
  infos.forEach((item) => {
    ['left', 'rotate', 'right'].forEach((control) => {
      if (item[1][control]){
        var idtoshow = item[0]+control
        $('#'+idtoshow).css('visibility', 'visible')
      }
    });
  });
  const myInfo = infos.find(item => item[0] === socket.id)
  if (myInfo) {
    myControls.left = !!myInfo[1].left
    myControls.rotate = !!myInfo[1].rotate
    myControls.right = !!myInfo[1].right
  }
  if (gameState.bombs.length > 0) {
    gameState.bombsBlockingPiece = true
  } else {
    socket.emit('getpiece')
  }

})

socket.on('takestats', (data) => {
  $('#levelstat').text(data.levelstat)
  $('#penalties').text(data.penalties)
  $('#linescleared').text(data.linescleared)
})

socket.on('takepowerups', (data) => {
  const powerupsList = $('#powerupslist')
  powerupsList.empty()
  data.powerups.forEach((powerup, index) => {
    const powerupBtn = $('<button>')
      .addClass('powerup-btn')
      .attr('data-powerup-id', powerup.id)
      .attr('data-powerup-index', index)
      .text(powerup.title)
      .on('click', function() {
        if (gameState.playing) {
          socket.emit('triggerpowerup', {powerupId: powerup.id})
        }
      })
    powerupsList.append(powerupBtn)
  })
})

socket.on('powerupactivated', (data) => {
  const powerup = data.powerup
  if (powerup.id === 'sneak_peak') {
    gameState.sneakPeakPending = true
  }
})

socket.on('peekpieces', (data) => {
  data.pieces.forEach(p => gameState.previewQueue.push(p))
  gameState.prevdraw()
})

socket.on('controlsUpdated', (data) => {
  $('.control').css('visibility', 'hidden')
  const infos = data.info
  infos.forEach((item) => {
    ;['left', 'rotate', 'right'].forEach((control) => {
      if (item[1][control]) {
        $('#' + item[0] + control).css('visibility', 'visible')
      }
    })
  })
  const myInfo = infos.find(item => item[0] === socket.id)
  if (myInfo) {
    myControls.left = !!myInfo[1].left
    myControls.rotate = !!myInfo[1].rotate
    myControls.right = !!myInfo[1].right
  }
})

socket.on('bombsaway', () => {
  if (!gameState.board) return
  gameState.startBombs()
})

if (window.location.hostname === 'localhost') {
  window.addEventListener('keydown', (e) => {
    if (!gameState.playing) return
    const devMap = {b: 'bombsaway', s: 'sneak_peak', c: 'controlme'}
    if (devMap[e.key]) socket.emit('devpowerup', {powerupId: devMap[e.key]})
  })
}

socket.on('getgamestate', () => {
  socket.emit('takestate', {boardstate:gameState.board.board, ondeck:gameState.upcoming})
})

socket.on('takegamedata', (data) => {
  $('#waitcard').hide()
  $('#canvas').show()
  console.log('starting')
  bindKeys()
  gameState.midstart(data)
})

$('#gamelobby').on('click', () => {
  $('#gameover').hide()
  resetgame()
})

$('#sendscore').on('click', () => {
  $('#sendscore').html('sent!')
  $('#sendscore').prop('disabled', true)
  socket.emit('submitscore')
})

socket.on('endgame', (data) => {
  unbindKeys()
  $('#sendscore').prop('disabled', !data.cansubmit)
  if (!data.cansubmit){
    $('#cantsubmit').show()
  }

  $('#gameover').show()

  let i = 10
  gameState.countdown = setInterval(() => {
    i--
    if (i<0){
      clearInterval(gameState.countdown)
      resetgame()

      return
    }
    document.getElementById('secsleft').innerHTML = i
  }, 1000)
})
