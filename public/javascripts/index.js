import {playertags} from './tagmaker.js'
import {makepiece, makepreview} from './gameplay.js'
import {Board} from './board.js'
import {maskControls} from './utils.js'
import {Soundboard} from './makeaudio.js'

const socket = io.connect(window.location.href)
socket.on('connect', () => {
  let username = document.getElementById('usernameholder').innerHTML
  socket.emit('giveusername', {username:username})
})
socket.on('pleasewait', () => {
  $('#waitcard').show()
})
socket.on('optionpage', () => {
  $('#waitcard').hide()
  $('#optionsholder').show()
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

$('#prevmode').on('click', () => {
  socket.emit('changemode', {type:1})
})
$('#nextmode').on('click', () => {
  socket.emit('changemode', {type:2})
})

$('.togglejump').on('click', () => {
  socket.emit('togglejump')
})

socket.on('takecode', (data) => {
  $('#roomcode').text(`Room Code: ${data.roomcode}`)
  $('#teamnameholder').text(`Team: ${data.roomname}`)
})

socket.on('takemode', (data) => {
  $('.modename').hide()
  $('.moderules').hide()
  $('.jumptype').hide()
  $('.jumprules').hide()

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
})

const mutebutton = document.querySelector('#mutebutton')
const soundicon = "<i style='font-size:30px' class='fas'>&#xf028;</i>"
const muteicon = "<i style='font-size:30px' class='fas fa-volume-mute'></i>"
function mutetoggle(){
  gameState.sounds.muted = !gameState.sounds.muted
  mutebutton.innerHTML = gameState.sounds.muted ? muteicon : soundicon
  mutebutton.blur()
}
mutebutton.addEventListener('click', mutetoggle)
//tetris gamestate
var gameState = {
  canvas : document.getElementById('canvas'),
  ctx: null,

  preview: document.getElementById('previewcanvas'),
  dtx: null,

  board : null,
  piece : null,
  upcoming: null,

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
  },

  prevdraw: function(){
    this.dtx.clearRect(0,0,150,120)
    let showpiece = makepreview(this.upcoming)
    console.log(showpiece)
    showpiece.prevarray.forEach(sq => {
      var topleftX = sq[0]*30
      var topleftY = sq[1]*30

      this.dtx.fillStyle = showpiece.prevcolor
      this.dtx.fillRect(topleftX, topleftY, 30,30)
      this.dtx.strokeRect(topleftX, topleftY, 30,30)
    })
  },
  sounds: new Soundboard(),




  createpiece : function(x){
    let i = this.upcoming


    this.piece = makepiece(i, this.canvas)
    this.upcoming = x
    this.prevdraw()

  },

  countdown:null,

  reset: function(){
    if (this.countdown){
      clearInterval(this.countdown)

    }
    this.piece = null
    this.upcoming = null
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
  var namelist = playertags(data.namelist, socket.id)



  $('#nameholder').html(namelist)

})
socket.on('removeboy', (data) => {
  $(data.oldid).remove()
})
socket.on('takehost', () => {
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
  socket.emit('getpiece')


})

socket.on('takestats', (data) => {
  $('#levelstat').text(data.levelstat)
  $('#penalties').text(data.penalties)
  $('#linescleared').text(data.linescleared)
})

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
