// const robot = require('robotjs')
// import { playAudio } from '../audios/player'

class Action {
  constructor (name, payload, repeat = false, times = 0, delay = 500) {
    this.intent = false
    this.name = name
    this.payload = payload
    this.repeat = repeat
    this.times = times
    this.delay = 500
    this.type = 'generic'
  }

  do () {
    throw new Error('No action defined')
  }
}

// function pressKey (payload) {
//   if (payload.modifier) {
//     robot.keyTap(payload.key, payload.modifier)
//   } else {
//     robot.keyTap(payload.key)
//   }
// }

// function doAction (action) {
//   if (!action || !('intent' in action)) {
//     console.log('No intent defined')
//     return
//   }
//   if (action.intent === 'sound') {
//     playAudio(action.payload)
//   }
//   if (action.intent === 'key') {
//     pressKey(action.payload)
//   }
//   if (action.intent === 'keys') {
//     for (const key in action.payload) { pressKey(action.payload[key]) }
//   }
// }

export default Action
