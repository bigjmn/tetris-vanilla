
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var shortid = require('shortid')
var _ = require('lodash')
var Lobby = require('./Lobby')
var session = require('express-session');

const {writeFeedback, getLeaders} = require('./firebase/config.js')



var app = express();

const server = require("http").createServer(app);
const port = process.env.PORT || 3000;
var bodyParser = require('body-parser');

var socketio = require('socket.io')
var io = socketio(server)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: "Shh, its a secret!"}));
const middlewares = require('./middlewares/middlewares.js')
var lobbylist = require('./middlewares/lobbylist')

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

app.get('/', (req, res) => {

  let errmessage = req.session.errmessage ? req.session.errmessage : ''
  let userfill = req.session.username? req.session.username : ''
  req.session.errmessage = null;
  res.render('index', {errmessage:errmessage, userfill:userfill})
})


app.get('/leaderboard', (req, res) => {
  const leaders = getLeaders(3, 'any')
  .then(response => {
    console.log(response)
    res.render('leaderboard', {leaders:response, sizefill:3, modefill:'any'})

  })
})
app.post('/leaderboard', (req, res) => {
  let p = req.body.maxplayers*1
  let m = req.body.gamemode
  console.log(p)
  console.log(m)
  const leaders = getLeaders(p, m)
  .then(response => {
    console.log(response)
    res.render('leaderboard', {leaders:response, sizefill:p, modefill:m})
  })



})

app.get('/about', (req, res) => {
  res.render('about')
})

app.post('/about', (req, res) => {
  let feedback = req.body.feedback
  const feedres = writeFeedback(feedback)
  .then((formres) => {
    res.render('about', {sentmess: 'feedback sent!'})
  })
  .catch(error => {
    res.render('error')
  })
})

app.get('/darules', (req, res) => {
  res.render('darules')
})


app.get('/create', (req, res) => {
  let errmessage = req.session.errmessage ? req.session.errmessage : ''
  let userfill = req.session.username? req.session.username : ''
  req.session.errmessage = null;
  res.render('createform', {errmessage:errmessage, userfill:userfill})

})
app.get('/join', (req, res) => {
  let errmessage = req.session.errmessage ? req.session.errmessage : ''
  let userfill = req.session.username ? req.session.username : ''
  let codefill = req.session.roomcode ? req.session.roomcode : ''
  req.session.roomcode = null
  req.session.errmessage = null;
  res.render('joinform', {errmessage:errmessage, userfill:userfill, codefill:codefill})
})
app.post('/create', (req, res) => {
  let roomname = req.body.roomname
  req.session.username = req.body.username
  req.session.auth = true
  console.log(roomname)
  let roomid = shortid.generate()
  let urlpath = '/game/'+roomid
  var roomcode = require('./helpers/makecode.js')(4)
  while (lobbylist.find(lob => lob.roomcode == roomcode)){
    roomcode = require('./helpers/makecode.js')(4)
  }
  var nsp = io.of(urlpath)
  // nsp.on('connection', (socket) => {
  //
  //   require('./controllers/main')(nsp, socket)
  // })
  var newlobby = new Lobby(roomname, nsp, urlpath, roomid, roomcode)
  newlobby.nsp.on('connection', (socket) => {
    require('./controllers/main')(newlobby, socket)
  })
  lobbylist.push(newlobby)
  res.redirect(urlpath)

})
app.post('/join', ...middlewares)

// app.post('/join', function(req, res, next){
//   let roomcode = req.body.roomcode
//   let foundlobby = lobbylist.find(lob => lob.roomcode == roomcode)
//   if (foundlobby){
//     if (!foundlobby.midgame || foundlobby.jumpins){
//       res.redirect(foundlobby.urlpath)
//     }
//     else{
//       res.redirect('/', {errmessage:"sorry, they seem to be mid-game"})
//     }
//   }
//   else{
//     req.session.errmessage = 'sorry'
//     res.redirect('/')
//
//   }
//
//
// }, function(req,res,next){
//
//   res.render('index')
//
// })

app.get('/game/:roomid', (req, res) => {
  let foundlobby = lobbylist.find(lob => lob.roomid == req.params.roomid)
  if (!foundlobby){
    res.redirect('/')
    return
  }
  if (req.session.auth && req.session.username){
    let userfill = req.session.username
    req.session.username = null
    res.render('gameroom', {username:userfill})
    return
  }
  req.session.roomcode = foundlobby.roomcode
  res.redirect('/join')

})

server.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
