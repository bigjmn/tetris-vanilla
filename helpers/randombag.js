const randomize = (arr) => {

  for (let i=arr.length-1; i>0; i--){
    let j = Math.floor(Math.random()*(i+1));
    let t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

module.exports = function(arr){
  if (arr.length >= 5){
    return arr
  }
  let unmixed = Array.from(Array(7).keys())
  let mixed = randomize(unmixed)
  return [...mixed, ...arr]
}
