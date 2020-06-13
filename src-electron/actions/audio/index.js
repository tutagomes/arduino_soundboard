// eslint-disable-next-line no-undef
// const opts = {}
// var player = require('play-sound')(opts)
import Action from '../index'
// eslint-disable-next-line no-undef
// eslint-disable-next-line no-unused-vars
var player = require('play-sound')()

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
  if (playing) {
    playing.kill()
  }
  if (audio) {
    var audioFolder = ''
    if (process.env.DEV) {
      audioFolder = path.join(__statics, 'audios', audio)
    } else {
      audioFolder = path.join(process.resourcesPath, 'src/statics/audios', audio)
    }
    playing = player.play(audioFolder, function (err) {
      if (err && !playing.killed) throw err
    })
  }
}

export { playAudio, AudioAction }
