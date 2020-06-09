// eslint-disable-next-line no-undef
// const opts = {}
// var player = require('play-sound')(opts)
import Action from '../index'
// eslint-disable-next-line no-undef
const opts = {}
var player = require('play-sound')(opts)

var path = require('path')

class AudioAction extends Action {
  constructor (name, payload, repeat = false, times = 0, delay = 500) {
    super(name, payload, repeat, times, delay)
    this.intent = name
    this.payload = payload
    this.type = 'sound'
  }

  do () {
    playAudio(this.payload)
  }

  stop () {
    playAudio()
  }
}

var playing

function playAudio (audio = false) {
  console.log(playing)

  if (playing) {
    playing.kill()
  }
  if (audio) {
    const audioFolder = path.join(__dirname, 'audios', audio)
    console.log(audioFolder)
    playing = player.play(audioFolder, function (err) {
      if (err && !err.killed) throw err
    })
  }
}

export { playAudio, AudioAction }
