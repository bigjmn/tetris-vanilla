const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
export {wait}

function oldmaskControls(mode, id) {
  $('.playercontrols').hide()
  $('.playercontrolmask').hide()
  switch (mode){
    case 'Classic Mode':
    $('.playercontrols').show()
    break;

    case 'Self View':
    $('.playercontrolmask').show()
    $('#'+id+'controlmask').hide()
    $('#'+id).show()
    break;

    case 'Buddy View':
    $('.playercontrols').show()
    $('#'+id).hide()
    $('#'+id+'controlmask').show()
    break;

    default:

  }
}


export function maskControls(mode, id) {
  $('.playercontrols').css('display', 'none')
  $('.playercontrolmask').css('display', 'none')
  switch (mode){
    case 'Classic Mode':
    $('.playercontrols').css('display', 'block')
    break;

    case 'Self View':
    $('.playercontrolmask').css('display', 'block')
    $('#'+id+'controlmask').css('display', 'none')
    $('#'+id).css('display', 'block')
    break;

    case 'Buddy View':
    $('.playercontrols').css('display', 'block')
    $('#'+id).css('display', 'none')
    $('#'+id+'controlmask').css('display', 'block')
    break;

    default:

  }
}
