import {wait} from './utils.js'
const reducer = (prev, curr) => {
  return curr.length == 10 ? [[], ...prev] : [...prev, curr]
}
function createBoard(){
  var solids = []
  for (var i=0;i<19;i++){
    solids.push([])
  }
  return solids
}

export function Board(can, sfx){
  this.board = createBoard()
  this.can = can
  this.sfx = sfx
  this.loss = function(){
    return this.board[0].length > 0
  }
  this.drawSolids = function(){
    let ctx = this.can.getContext('2d')
    let blocksize = this.can.width/10
    for (let i=0; i<19; i++) {
      if (this.board[i].length == 0){
        continue
      }
      for (let j=0; j<this.board[i].length; j++){
        let y_cor = i-1
        let x_cor = this.board[i][j][0]
        let colfill = this.board[i][j][1]

        ctx.fillStyle = colfill
        ctx.fillRect(x_cor*blocksize, y_cor*blocksize, blocksize, blocksize)
        ctx.strokeRect(x_cor*blocksize, y_cor*blocksize, blocksize, blocksize)
      }
    }
  }

  this.turncolor = function(fullrows, color){
    let ctx = this.can.getContext('2d')
    let blocksize = this.can.width/10
    if (color == 'clear'){
      fullrows.forEach(r => {
        ctx.clearRect(0,(r-1)*blocksize,this.can.width,blocksize)
      })
      return
    }
    ctx.fillStyle = color
    fullrows.forEach(r => {
      ctx.fillRect(0,(r-1)*blocksize,this.can.width,blocksize)
    })
  }
  this.filterboys = function(fullrows, sock){
    this.board = this.board.reduce(reducer, [])
    this.drawSolids()
    sock.emit('pieceset', {linescleared:fullrows.length})
  }
  this.flashrows = function(fullrows, sock){
    this.sfx.soundoff('clear')
    for (let i=0; i<7; i++){
      setTimeout(() => {
        i == 6 ? this.filterboys(fullrows, sock)
        : i%3 == 0 ? this.turncolor(fullrows, 'white')
        : i%3 == 1 ? this.turncolor(fullrows, 'black')
        : this.drawSolids()
      }, 100+130*i)
    }
  }



  this.handleset = function(sock){
    var toclear = []
    for (let i=0; i<19; i++){
      if (this.board[i].length == 10){
        toclear.push(i)
      }
    }
    if (toclear.length == 0){
      this.sfx.soundoff('set')
      if (this.loss()){
        sock.emit('gameover')
        return
      }
      sock.emit('pieceset', {linescleared:0})
      return
    }
    this.flashrows(toclear, sock)





  }

}
