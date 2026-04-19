// handle players joining mid game
module.exports = function(lobby, socket){
  socket.on('takestate', (data) => {
    //only handle event from host to avoid reddundancies/errors
    if (socket.id != lobby.host){
      return
    }
    lobby.waiters.forEach(sock => {
      //give each joining user the board state and the preview of the next piece.
      //again, waiting players are connected each new piece so this is unlikely to be more than one.
      lobby.nsp.to(sock.id).emit('takegamedata', {boardstate: data.boardstate, ondeck:data.ondeck})

    })

  })
  //connecting user has received and set the game data
  socket.on('readynow', () => {
    //add them to the game
    lobby.addUser(socket)
    //remove them from the list of waiters.
    lobby.waiters = lobby.waiters.filter(x => x.id != socket.id)
    console.log(lobby.waiters)
    
    if (lobby.waiters.length == 0){
      lobby.describeLobby()
      lobby.sendStats()
      lobby.sendView()
      lobby.shufflecontrols()
    }
  })
}
