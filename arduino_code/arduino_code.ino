#include <Keypad.h>

const byte ROWS = 4; 
const byte COLS = 4; 

char hexaKeys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

byte rowPins[ROWS] = {7, 6, 5, 4}; 
byte colPins[COLS] = {3, 2, 1, 0}; 

int ledPin = 13;
bool ledStatus = true;

Keypad customKeypad = Keypad(makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS); 

void setup(){
  Serial.begin(2000000);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, HIGH);
}
  
void loop(){
  char customKey = customKeypad.getKey();
  
  if (customKey){
    Serial.println(customKey);
  }

  if (Serial.available() > 0) {
    // lê do buffer o dado recebido:
    char lido = Serial.read();
    // Caso lido tenha sido 'a' ou 97
    if (lido == 98) {
      desligaLED();
      // Desliga lampada
     }
     // Caso tenha sido 'b'
     else if (lido == 97) {
      acendeLED();
     }

  }
}

void acendeLED () {
  ledStatus = true;
  digitalWrite(ledPin, LOW);
}
void desligaLED () {
  ledStatus = false;
  digitalWrite(ledPin, HIGH);
}
