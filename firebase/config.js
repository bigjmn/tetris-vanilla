const firebase = require('firebase')
const firebaseConfig = {
  apiKey: "AIzaSyCoDbignhA4nJQ0LxPmjMRSZyrwBfAg32M",
  authDomain: "tetris-scores-67b12.firebaseapp.com",
  projectId: "tetris-scores-67b12",
  storageBucket: "tetris-scores-67b12.appspot.com",
  messagingSenderId: "542989848872",
  appId: "1:542989848872:web:6dccc93d8afb455690c01d",
  measurementId: "G-T0CR2BJLF1"
};
firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()

const padtable = (arr) => {
  var emptyteam = {name:'empty',mode:'-',lines:'-',size:'-'}
  let empties = Array(5).fill(emptyteam)
  return [...arr, ...empties].slice(0,5)

}

exports.writeStats = function(stats){
  db.collection('leaders').add(stats)
  .then(docRef => {
    console.log(`stats added with id ${docRef.id}`)
  })
  .catch(error => {
    console.log(error.message)
  })
}

exports.writeFeedback = async function(feed){
  let feedres = await db.collection('feedback').add({feed})
  .then(docRef => {
    console.log(`feedback added with id ${docRef.id}`)
    return 'feedback sent'
  })
  .catch(error => {
    console.log(error.message)
    return 'something went wrong'

  })
}

exports.overallLeaders = async function(){
  console.log('getting leaders')

  let alldocs = await db.collection('leaders').where('size','==',1).orderBy('lines', 'desc').limit(5)
  .get()
  .then(snap => {
    let mydocs = []
    snap.forEach(doc => {
      console.log(doc.data())
      mydocs.push(doc.data())
    })
    return mydocs
  })
  .then(tosort => {
    return tosort.sort(function (a,b){
      return b.lines-a.lines
    })
  })
  .then(tofill => {
    return padtable(tofill)

  })
  .catch(error => console.log(error.message))
  return alldocs


}

exports.getLeaders = async function(teamsize, gamemode){
  console.log('filtered leaders')

  let alldocs = await db.collection('leaders').where('size','>=',teamsize)
  .get()
  .then(snap => {
    let mydocs = []
    snap.forEach(doc => {
      if (gamemode == 'any' || doc.data().mode==gamemode){
        mydocs.push(doc.data())

      }
    })
    console.log(mydocs)
    return mydocs
  })
  .then(tosort => {
    return tosort.sort(function (a,b){
      return b.lines-a.lines
    })
  })
  .then(tofill => {
    return padtable(tofill)

  })


  .catch(error => console.log(error.message))
  return alldocs


}
