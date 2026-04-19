var newcontrols = require('./helpers/shufflecontrols')
var fillbag = require('./helpers/randombag')
module.exports = class Lobby {
  constructor(name, nsp, urlpath, roomid, roomcode) {
    this.name = name
    this.nsp = nsp
    this.urlpath = urlpath

    this.graceperiod = false
    this.midgame = false
    this.dropinterval = null
    this.modeindex = 0
    this.jumpins = true;
    this.waiters = []
    this.roomid = roomid

    this.roomcode = roomcode
    this.penalties = 0

    this.linescleared = 0

    this.piecebag = []

    this.cansubmit = false

    this.minplayers = null

  }
  get gamemode(){
    return ['Classic Mode', 'Self View', 'Buddy View'][this.modeindex]
  }
  get level(){
    return Math.floor(this.linescleared/5)+1
  }
  get droprate(){
    return Math.max(250, 1000-(this.level-1)*75)
  }
  get socketlist(){
    var sockmap = Array.from(this.nsp.sockets.values())
    return sockmap
  }
  get userlist(){
    var users = this.playerlist.map(sock => [sock.username, sock.id])
    return users
  }
  get onlynames(){
    let onlynames = this.socketlist.map(sock => sock.username)
    return onlynames
  }
  get playerlist(){
    var testman = this.socketlist.filter(sock => sock.playing)
    return testman

  }
  get host(){
    return this.socketlist[0] ? this.socketlist[0].id
    : null
  }
  broadcast(message, payload){
    this.nsp.emit(message, payload)
  }
  tellhost(message, payload){
    if (!this.host){
      return
    }
    this.nsp.to(this.host).emit(message, payload)
  }
  addUser(sock){
    sock.join('playing')
    sock.playing = true
    sock.rights = {'left':false,'rotate':false,'right':false}



  }
  describeLobby(){
    this.sendOptions()
    this.sendUsers()
    this.tellhost('takehost')
    this.broadcast('takecode', {roomcode:this.roomcode, roomname:this.name})
  }
  sendOptions(){
    this.broadcast('takemode', {mode:this.modeindex, jumpins:this.jumpins})
  }
  sendUsers(){
    this.broadcast('takeplayers', {namelist:this.userlist})

  }
  sendControls(){
    let controlinfo = this.playerlist.map(usr => [usr.id, usr.rights])
    this.broadcast('takeControls', {info:controlinfo})
  }
  sendView(){
    this.broadcast('takeView', {viewmode:this.gamemode})
  }
  sendStats(){
    this.broadcast('takestats', {levelstat:this.level, linescleared:this.linescleared, penalties:this.penalties})
  }
  shufflecontrols(){
    newcontrols(this.playerlist)
    this.sendControls()


  }
  sendPiece(){
    let piecetype = this.piecebag.pop()
    this.broadcast('takepiece', {piecetype:piecetype})
    this.piecebag = fillbag(this.piecebag)
  }


  lowerPiece(){
    this.dropinterval = setInterval(() => {
      this.broadcast('takemove', {move:'down'})
    }, this.droprate)
  }
  prepGame(){
    let firstpiece = Math.floor(Math.random()*7)
    this.sendView()

    this.broadcast('prepgame', {firstpiece:firstpiece})
  }
  startGame(){
    this.minplayers = this.playerlist.length

    this.piecebag = fillbag(this.piecebag)
    console.log(this.piecebag)
    this.midgame = true
    this.shufflecontrols()
  }
  endGame(){
    if (this.minplayers && this.minplayers >= 3){
      this.cansubmit = true

    }

    this.broadcast('endgame', {cansubmit:this.cansubmit})

  }
  reset(){
    this.linescleared = 0
    this.penalties = 0
    this.cansubmit = false
    this.minplayers = null
    this.piecebag = []
    this.midgame = false
    if (this.waiters.length > 0){
      this.waiters.forEach(sock => {
        this.addUser(sock)
        sock.emit('optionpage')
        this.waiters = this.waiters.filter(x => x.id != sock.id)
      })
    }
    this.describeLobby()


  }
  // shutDown(){
  //   if (this.dropinterval){
  //     clearInterval(this.dropinterval)
  //   }
  //   this.nsp.disconnectSockets(true)
  //   lobbylist = lobbylist.filter(lob => lob.roomid != this.roomid)
  //   console.log(lobbylist)
  // }
}
