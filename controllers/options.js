module.exports = function(lobby, socket){
  socket.on('changemode', (data) => {
    if (lobby.midgame){
      return
    }
    lobby.modeindex = (lobby.modeindex+data.type)%3
    console.log(lobby.modeindex)
    lobby.sendOptions()
  })
  socket.on('togglejump', () => {
    if (lobby.midgame){
      return
    }
    lobby.jumpins = !lobby.jumpins
    lobby.sendOptions()
  })
}
