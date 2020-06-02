const SerialPort = require('serialport');

const port = new SerialPort('/dev/cu.usbmodem14101', { baudRate: 2000000 });

const Readline = SerialPort.parsers.Readline;

const parser = port.pipe(new Readline('\n'));

var player = require('play-sound')(opts = {})

// const fs = require('fs');
// const portAudio = require('naudiodon');
const robot = require("robotjs");


function dec2bin(dec){
  return (dec >>> 0).toString(2);
}

function playAudio (key) {
  let sound = 'rapaz.mp3'
  let intent = 'sound'
  switch (key) {
    case 'A':
      sound = 'rapaz.mp3'
      break;
    case 'B':
      sound = 'badumtss.wav'
      break;
    case 'C':
      // Type "Hello World".
      // robot.typeString("Hello World");
      // Press enter.
      robot.keyTap("c", "command");
      intent = 'key'
      break;
    case 'D':
      // Type "Hello World".
      // robot.typeString("Hello World");
      // Press enter.
      robot.keyTap("v", "command");
      intent = 'key'
      break;
    default:
      // sound = 'oloquinho.wav'
      break;
  }

  if (intent === 'sound') {
    player.play(sound, function(err){
      if (err) throw err
    })
  }
}



// Read the port data
port.on("open", () => {
  console.log('serial port open');
});
parser.on('data', async data =>{
  console.log(data)
  console.log(data[0] === 'A')
  // Create an instance of AudioIO with outOptions (defaults are as below), which will return a WritableStream
  playAudio(data[0])
  // Create a stream to pipe into the AudioOutput
  // Note that this does not strip the WAV header so a click will be heard at the beginning
  
});
