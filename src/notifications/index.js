const notifier = require('node-notifier')

function notify (title, message) {
  notifier.notify({
    title: title,
    message: message,
    icon: './icone.png',
    contentImage: './icone.png',
    sound: 'Hero'
  })
}

export default notify
