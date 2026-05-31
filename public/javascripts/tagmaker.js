export function playertags(users, playerid){
  var fullstring = ""
  users.forEach((item) => {
    var playstring = `
    <div class='playertag' id=${item[1]}tag>
      <div class='playername' id=${item[1]}name>${item[0]}</div>
      <div class='controltypes'>
        <div class='controls-left'>
          <div class='playercontrols' id=${item[1]}>
            <div class='control' id=${item[1]}left>&#11013;</div>
            <div style="font-weight:900" class='control' id=${item[1]}rotate>&#8634;</div>
            <div class='control' id=${item[1]}right>&#11157;</div>
          </div>
          <div class='playercontrolmask' id=${item[1]}controlmask>
            <div class='controlmask' data-move='left'>?</div>
            <div class='controlmask' data-move='rotate'>?</div>
            <div class='controlmask' data-move='right'>?</div>
          </div>
        </div>
        <div class='controls-divider'></div>
        <div class='controls-right'>
          <div class='dropcontrol' data-move='down'>&#11015;</div>
          <div class='dropcontrol' data-move='autodrop'>&#11015;&#11015;</div>
        </div>
      </div>
    </div>
    `
    fullstring = item[1] == playerid ? playstring + fullstring : fullstring + playstring
  });
  return fullstring

}
