var lobbylist = require('../middlewares/lobbylist.js')

module.exports = function(lobby, socket){
// attach username to socket object
  socket.on('giveusername', (data) => {
    socket.username = data.username
    // if the game is going on, show them the wait message
    if (lobby.midgame){
      socket.emit('pleasewait')
      //add them to the list of people waiting to join the game.
      //this will almost certainly never be more than one, but who knows.
      lobby.waiters.push(socket)
      return
    }
    //otherwise, show them the options page
    socket.emit('optionpage')
    //add them to the game, update everyone
    lobby.addUser(socket)
    lobby.describeLobby()



  })

//disconnection handler
  socket.on('disconnect', () => {
    //check for remaining connections
    if (lobby.socketlist.length == 0){
      //if none, check that the piece-dropping interval
      //isn't still going on. It shouldn't be.
      if (lobby.dropinterval){
        //but just in case it is, clear it.
        clearInterval(lobby.dropinterval)
      }
      //shut down the namespace.
      lobby.nsp.disconnectSockets(true)
      //remove the lobby from the list
      lobbylist.splice(lobbylist.indexOf(lobby), 1)
      console.log(lobbylist)

    }

    if (lobby.midgame){
      //if remaining players are mid-game, update the minimum players list
      //this is to ensure you can't set a high score for 10 by starting w
      //10 players and then having 9 people immediately quit
      lobby.minplayers = Math.min(lobby.minplayers, lobby.playerlist.length)
    }
    if (socket.playing){
      //if disconnected player was playing, tell everyone so they can remove
      //them from the list

      lobby.broadcast('removeboy',{oldid:'#'+socket.id+'tag'})
      return


    }
    //otherwise, make sure they're not waiting to join
    lobby.waiters = lobby.waiters.filter(s => s.id != socket.id)

  })
  //seperate handlers for different game operations
  require('./movement.js')(lobby, socket)
  require('./piecetransition.js')(lobby, socket)
  require('./options.js')(lobby, socket)
  require('./midgamejoin.js')(lobby, socket)
  require('./submitscore.js')(lobby, socket)
}
