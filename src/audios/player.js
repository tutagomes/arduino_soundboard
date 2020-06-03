// eslint-disable-next-line no-undef
// const opts = {}
// var player = require('play-sound')(opts)
var path = require('path')

var playing
function playAudio (audio = false) {
  if (playing) {
    playing.pause()
  }
  if (audio) {
    const audioFolder = path.join('statics', 'audios', audio)
    playing = new Audio(audioFolder)
    playing.play()
    // player.play(audio, function (err) {
    //   if (err) console.log(err)
    // })
  }
}
function pauseAudio () {
  if (playing) {
    playing.pause()
  }
}

export { playAudio, pauseAudio }
