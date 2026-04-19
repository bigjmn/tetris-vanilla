module.exports = function(lobby, socket){
  socket.on('move', (data) => {
    console.log(data.move)
    if (data.move == 'autodrop' || data.move=='down'){
      lobby.broadcast('takemove', {move:data.move})
      return
    }
    if (socket.rights[data.move]){
      lobby.broadcast('takemove', {move:data.move, turngreen: '#'+socket.id+data.move})
      return
    }
    if (lobby.graceperiod){
      return
    }
    lobby.broadcast('takemove', {move:'autodrop'})
    lobby.broadcast('illegal', {turnred:'#'+socket.id+'tag'})
    lobby.penalties++
    lobby.graceperiod = true
    setTimeout(() => {
      lobby.graceperiod = false
    }, 1000)

  })


}
