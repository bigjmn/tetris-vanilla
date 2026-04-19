var lobbylist = require('./lobbylist')
var express = require('express')
var router = express.Router()

const attachUsername = (req, res, next) => {
  req.session.username = req.body.username
  next()
}

const roomExists = (req, res, next) => {
  let foundlobby = lobbylist.find(lob => lob.roomcode == req.body.roomcode.toUpperCase())
  if (foundlobby){
    req.body.lobby = foundlobby
    next()
  }
  else{
    req.session.errmessage = 'Lobby Not Found'
    res.redirect('/join')
  }
}

const roomBusy = (req, res, next) => {
  if (!req.body.lobby.midgame || req.body.lobby.jumpins){
    next()
  }
  else{
    req.session.errmessage = "Sorry, they're mid-game!"
    res.redirect('/join')
  }
}
const nameTaken = (req, res, next) => {
  let taken = req.body.lobby.userlist.find(x => x[0] == req.session.username)
  if (!taken){
    next()
  }
  else{
    req.session.errmessage = 'Someone on the team has that username!'
    req.session.username = null
    res.redirect('/join')
  }
}
const confirmJoin = (req, res, next) => {
  req.session.auth = true
  res.redirect(req.body.lobby.urlpath)
}
router.post('/', attachUsername, roomExists, roomBusy, nameTaken, confirmJoin)

// module.exports = router
module.exports = [attachUsername, roomExists, roomBusy, nameTaken, confirmJoin]
