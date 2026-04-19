export function playertags(users, playerid){
  var fullstring = ""
  users.forEach((item) => {
    var playstring = `
    <div class='playertag' id=${item[1]}tag>
      <div class='playername' id=${item[1]}name>${item[0]}</div>
      <div class='controltypes'>
      <div class='playercontrols' id=${item[1]}>
        <div class='control' id=${item[1]}left>&#11013;</div>
        <div style="font-weight:900" class='control' id=${item[1]}rotate>&#8634;</div>
        <div class='control' id=${item[1]}right>&#11157</div>
      </div>
      <div class='playercontrolmask' id=${item[1]}controlmask>
        <div class='controlmask'>?</div>
        <div class='controlmask'>?</div>
        <div class='controlmask'>?</div>

      </div>
      </div>

      </div>

    `
    fullstring = item[1] == playerid ? playstring + fullstring : fullstring + playstring
  });
  return fullstring

}
