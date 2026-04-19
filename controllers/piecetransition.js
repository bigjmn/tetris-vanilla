module.exports = function (lobby, socket){
  socket.on('pieceset', (data) => {
    if (socket.id != lobby.host){
      return
    }
    if (lobby.dropinterval){
      clearInterval(lobby.dropinterval)
    }

    lobby.linescleared += data.linescleared

    if (lobby.waiters.length > 0){
      socket.emit('getgamestate')
      return
    }
    lobby.shufflecontrols()
    lobby.sendStats()

  })
  socket.on('getpiece', () => {
    console.log(socket.id)
    if (socket.id != lobby.host){
      return
    }
    lobby.sendPiece()
    lobby.lowerPiece()



  })
  socket.on('launchgame', () => {
    console.log(socket.id)
    if (socket.id != lobby.host){
      return
    }
    lobby.prepGame()
  })

  socket.on('startgame', () => {
    if (socket.id != lobby.host){
      return
    }
    lobby.startGame()
  })

  socket.on('gameover', () => {
    if (socket.id != lobby.host){
      return
    }
    if (lobby.dropinterval){
      clearInterval(lobby.dropinterval)
    }
    lobby.endGame()

  })
  socket.on('resetlobby', () => {
    if (socket.id != lobby.host){
      return
    }
    lobby.reset()
  })

}
