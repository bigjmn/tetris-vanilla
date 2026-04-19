module.exports = function newcontrols(socketlist){
  var usernum = socketlist.length
  socketlist.forEach((item, i) => {
    item.rights['right'] = Math.random() < .5/usernum
    item.rights['left'] = Math.random() < .5/usernum
    item.rights['rotate'] = Math.random() < .5/usernum
  });
  ['right', 'left', 'rotate'].forEach((item, i) => {
    socketlist[Math.floor(usernum*Math.random())].rights[item] = true;
  });



}
