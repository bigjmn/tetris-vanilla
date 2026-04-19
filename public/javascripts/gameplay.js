function overlap(active, board){
  if (!board){
    return false
  }
  for (var i=0;i<4;i++){
    let blockcheck = active[i]
    for (let j=0; j<board[blockcheck[1]].length; j++){
      if (board[blockcheck[1]][j][0] == blockcheck[0]){
        console.log('overlap')
        return true
      }
    }


  }
  return false;
}

//check if a given pos ray would be out of range
function outofrange(arr){
  for (var i = 0; i<arr.length;i++){
    let blockcheck = arr[i];
    if (blockcheck[0]<0 || blockcheck[0] >= 10
        || blockcheck[1] >= 19 || blockcheck[1] <0){
          console.log('out of range')
          return true;
        }

  }
  return false;
}
function invalid(arr, board){
  return (outofrange(arr) || overlap(arr, board))
}
function rotate_block(block,pivot){
  let b_x = block[0],
      b_y = block[1],
      piv_x = pivot[0],
      piv_y = pivot[1];


  var norm_x = b_x - piv_x;
  var norm_y = b_y - piv_y;

  var turn_x = -norm_y;
  var turn_y = norm_x;

  return [turn_x+piv_x,turn_y+piv_y];

}

function Piece(position, color, can){
  this.position = position;
  this.color = color
  this.setting = false
  this.can = can

  this.redraw = () => {
    let ctx = this.can.getContext('2d')
    let blocksize = this.can.width/10
    for (let i=0; i<4; i++){
      ctx.fillStyle = this.color
      ctx.fillRect(this.position[i][0]*blocksize, (this.position[i][1]-1)*blocksize, blocksize, blocksize)
      ctx.strokeRect(this.position[i][0]*blocksize, (this.position[i][1]-1)*blocksize, blocksize, blocksize)

    }
  }

  this.pushtoboard = (board) => {

    for (var i=0; i<4; i++){
      let xtoload = this.position[i][0]
      let ytoload = this.position[i][1]

      board.board[ytoload].push([xtoload, this.color])

    }
  }
  this.left = (board) => {
    let newpos = this.position.map(x => [x[0]-1, x[1]])
    this.position = invalid(newpos, board) ? this.position : newpos
  }
  this.right = (board) => {
    let newpos = this.position.map(x => [x[0]+1, x[1]])
    this.position = invalid(newpos, board) ? this.position : newpos
  }
  this.rotate = (board) => {
    let newpos = this.position.map(x => rotate_block(x, this.position[0]))
    this.position = invalid(newpos, board) ? this.position : newpos
  }
  this.down = (board) => {
    let newpos = this.position.map(x => [x[0], x[1]+1])
    if (invalid(newpos, board)){
      this.setting = true;
      return
    }
    this.position = newpos

  }
  this.autodrop = (board) => {
    var k=0
    while (!this.setting){
      this.down(board)
      k++
      console.log(k)
    }
  }

  this.move = (board, m) => {
    if (this.setting){
      console.log('busy setting')
      return
    }
    switch (m) {
      case 'rotate': this.rotate(board); return;
      case 'left': this.left(board); return;
      case 'right': this.right(board); return;
      case 'down': this.down(board); return;
      case 'autodrop': this.autodrop(board); return;
      default: return;
    }
  }


}

export function makepiece(x, can){
  switch (x) {
    case 0:
      return new Piece([[6,0],[5,0],[7,0],[8,0]], 'lightblue', can)
    case 1:
      return new Piece([[6,0],[5,0],[7,0],[6,1]], 'orange', can)
    case 2:
      return new Piece([[5,1],[6,1],[5,0],[4,0]], 'lightgreen', can)
    case 3:
      return new Piece([[5,1],[4,1],[5,0],[6,0]], 'yellow', can)
    case 4:
      return new Piece([[5,0],[4,0],[6,0],[4,1]], 'blue', can)
    case 5:
      return new Piece([[5,0],[4,0],[6,0],[6,1]], 'violet', can)
    case 6:
      let squareboy = new Piece([[5,0],[5,1],[6,0],[6,1]], 'red', can)
      squareboy.rotate = (board) => {
        return
      };
      return squareboy



  }
}

export function makepreview(x){
  let prevarray;
  let prevcolor;
  switch (x) {
  case 0:
  prevarray = [[.5,1.5], [1.5,1.5],[2.5,1.5],[3.5,1.5]]
  prevcolor = "lightblue";


    break;
  case 1:
  prevarray = [[1,2],[2,2],[3,2],[2,1]]
  prevcolor = "orange";
    break;
  case 2:
  prevarray = [[1,1],[2,1],[2,2],[3,2]]
  prevcolor = "lightgreen";
    break;
  case 3:
  prevarray = [[1,2],[2,2],[2,1],[3,1]]
  prevcolor = "yellow";
    break;
  case 4:
  prevarray = [[1,1],[2,1],[3,1],[1,2]]
  prevcolor = "blue";
    break;
  case 5:
  prevarray = [[1,1],[2,1],[3,1],[3,2]]
  prevcolor = "violet";
    break;
  case 6:
  prevarray = [[1.5, 1], [2.5,1],[1.5,2],[2.5,2]]
  prevcolor = "red";
    break;
  default:
  return
}
return {prevarray, prevcolor}
}
