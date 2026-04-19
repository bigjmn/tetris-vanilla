function SoundEffect(src){
  let newaudio = new Audio()
  newaudio.src = src
  newaudio.toggle = function(){
    newaudio.currentTime = 0
    newaudio.play()
  }
  return newaudio
}

export function Soundboard(){
  this.muted = false;
  this.clicksound = SoundEffect('../sounds/piecemove.wav')
  this.baddrop = SoundEffect('../sounds/baddrop.mp3')
  this.settingpiece = SoundEffect('../sounds/settingpiece.mp3')
  this.clearline = SoundEffect('../sounds/clear.wav')
  this.soundoff = function(soundtype){
    if (this.muted){
      return
    }
    switch (soundtype) {
      case 'click':
      this.clicksound.toggle()
      break;

      case 'set':
      this.settingpiece.toggle()
      break;

      case 'badauto':
      this.baddrop.toggle()
      break;

      case 'clear':
      this.clearline.toggle()
      break;

      default:
      break;



    }
  }
}
