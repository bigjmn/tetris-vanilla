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

  socket.on('triggerpowerup', (data) => {
    const powerup = lobby.usePowerup(data.powerupId)
    if (powerup){
      if (powerup.id === 'bombsaway') {
        lobby.pendingBombs = true
      } else if (powerup.id === 'sneak_peak') {
        const previewPieces = lobby.peekPieces(3)
        lobby.broadcast('peekpieces', {pieces: previewPieces})
        lobby.broadcast('powerupactivated', {powerup: powerup, triggeredBy: socket.id})
      } else if (powerup.id === 'controlme') {
        socket.rights = {left: true, rotate: true, right: true}
        const controlinfo = lobby.playerlist.map(usr => [usr.id, usr.rights])
        lobby.broadcast('controlsUpdated', {info: controlinfo})
        lobby.broadcast('powerupactivated', {powerup: powerup, triggeredBy: socket.id})
      } else {
        lobby.broadcast('powerupactivated', {powerup: powerup, triggeredBy: socket.id})
      }
    }
  })

  socket.on('devpowerup', (data) => {
    const devPowerups = {
      bombsaway: {id: 'bombsaway', title: 'Bombs Away', linesNeeded: 4, immediateTrigger: false},
      sneak_peak: {id: 'sneak_peak', title: 'Sneak Peak', linesNeeded: 2, immediateTrigger: false},
      controlme:  {id: 'controlme',  title: 'Control Me', linesNeeded: 3, immediateTrigger: true}
    }
    const powerup = devPowerups[data.powerupId]
    if (powerup) {
      lobby.powerups.push(powerup)
      lobby.sendPowerups()
    }
  })

}
