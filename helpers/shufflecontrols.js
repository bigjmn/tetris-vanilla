const PIECES_WEIGHT = 1.5 
const CONTROL_VERSION = "alpha"
function newcontrolsalpha(socketlist){
  var usernum = socketlist.length
  socketlist.forEach((item, i) => {
    item.rights['right'] = Math.random() < .5/usernum
    item.rights['left'] = Math.random() < .5/usernum
    item.rights['rotate'] = Math.random() < .5/usernum
  });
  ['right', 'left', 'rotate'].forEach((item, i) => {
    if (Math.random() < .9){
      socketlist[Math.floor(usernum*Math.random())].rights[item] = true;

    }
    
  });



}

function newcontrolsbeta(socketlist){
  var usernum = socketlist.length
  socketlist.forEach((item, i) => {
    item.rights['right'] = Math.random() < PIECES_WEIGHT/usernum
    item.rights['left'] = Math.random() < PIECES_WEIGHT/usernum
    item.rights['rotate'] = Math.random() < PIECES_WEIGHT/usernum
  });
  



}

module.exports = function newcontrols(socketlist){
  if (CONTROL_VERSION === "alpha"){
    newcontrolsalpha(socketlist)
  } else {
    newcontrolsbeta(socketlist)
  }
}