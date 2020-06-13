const notifier = require('node-notifier')

function notify (title, message) {
  notifier.notify({
    title: title,
    message: message,
    icon: require('path').join(__statics, 'tray_icon.png'),
    // contentImage: require('path').join(__statics, 'tray_icon.png'),
    sound: 'Hero'
  })
}

export default notify
