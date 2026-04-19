const {writeStats} = require('../firebase/config.js')
module.exports = function(lobby, socket){
  socket.on('submitscore', () => {
    if (!lobby.cansubmit){
      return
    }
    lobby.cansubmit = false
    let statpack = {
      name: lobby.name,
      mode: lobby.gamemode,
      size: lobby.minplayers,
      lines: lobby.linescleared
    }
    console.log(statpack)
    writeStats(statpack)


  })
}
