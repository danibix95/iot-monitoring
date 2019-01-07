//Json and Sensor Libraries
#include <ArduinoJson.h>
#include "DHT.h"
#include <Wire.h>
#include <Digital_Light_TSL2561.h>
#define DHTPIN 2     
#define DHTTYPE DHT11   // DHT 11 

//Variable definitions
DHT dht(DHTPIN, DHTTYPE);
int loud;
float th;
float hum;
float temp;
float light;
int mode;
char rxChar= 0;        
boolean isOn = false;
boolean newData = false;
boolean anomaly = false;

// Functions
void printHelp(void) {
    Serial.println("--- Command list: ---");
    Serial.println("? -> Print this HELP");  
    Serial.println("1 -> On  \"activate\"");
    Serial.println("2 -> Off \"deactivate\"");  
}
 
//------------------------------ loop ------------------------------
void senseEnv() {
    if (Serial.available()) {       
        rxChar = Serial.read();            
        Serial.flush();                    
  
        switch (rxChar) {
            case '1':
            	if (isOn == false){        
                     isOn=true;
                     mode=1;
                      Serial.println("Sensing On!!");
            	}
                else Serial.println("Sensing flag is already On!");
                break;

            case '0':
            	if (isOn=true) {       
                   isOn=false;
                   mode=2;
                      Serial.println("Sensing Off!!");
            	}
                else Serial.println("Sensing is already Off!");
                break;
            
            case 'a':
            case 'A':                          
            	if (anomaly == false) {      
                    anomaly=true;
                    Serial.println("Anomaly Detected!!");
                    mode=3;
            	}
                // else Serial.println("Anomaly flag is already On!");
                break;

            case 'k':
            case 'K':                          
            	if (anomaly == true)  {      
                    anomaly=false;
                    mode=4;
                    Serial.println("Anomaly Solved!!");
            	}
                break;
                
            case '?':                         
                printHelp();                   
                break;
                
            default:                           
                Serial.print("'");
                Serial.print((char)rxChar);
                Serial.println("' is not a command!");
        }   
    }
}

void analogWrite25k(int pin, int value) {
    switch (pin) {
        case 9:
            OCR1A = value;
            break;
        case 10:
            OCR1B = value;
            break;
        default:
            // no other pin will work
            break;
    }
}

void actAnomaly() {
    if (anomaly) {    
        analogWrite25k(10, 320);
    }
    else{
        analogWrite25k(10, 0);
    }
}                 

void setup() {
    // Fan configuration
    // Configure Timer 1 for PWM @ 25 kHz.
    TCCR1A = 0;           // undo the configuration done by...
    TCCR1B = 0;           // ...the Arduino core library
    TCNT1  = 0;           // reset timer
    TCCR1A = _BV(COM1A1)  // non-inverted PWM on ch. A
           | _BV(COM1B1)  // same on ch; B
           | _BV(WGM11);  // mode 10: ph. correct PWM, TOP = ICR1
    TCCR1B = _BV(WGM13)   // ditto
           | _BV(CS10);   // prescaler = 1
    ICR1   = 320;         // TOP = 320

    // Set the PWM pins as output.
    pinMode( 9, OUTPUT);
    pinMode(10, OUTPUT);
    
    pinMode(LED_BUILTIN, OUTPUT);
    Wire.begin();
    dht.begin();
    Serial.begin(9600);
    TSL2561.init();
    
    Serial.println("<Arduino is ready>");
    Serial.flush(); // Clear receive buffer.
    printHelp();
}

void loop() {    
    senseEnv();
    if (isOn) {
        actAnomaly();
        hum = dht.readHumidity();
        temp = dht.readTemperature();
        loud = analogRead(0);
        light=TSL2561.readVisibleLux();
        loud = map(loud, 0, 1023, -48, 66);

        const int capacity = JSON_ARRAY_SIZE(4) + 4 * JSON_OBJECT_SIZE(2);
        StaticJsonBuffer<capacity> jb;
        JsonArray& sensorData = jb.createArray();

        JsonObject& obj1 = sensorData.createNestedObject();
        obj1["key"] = "Humidity";
        obj1["value"] = hum;
        JsonObject& obj2 = sensorData.createNestedObject();
        obj2["key"] = "Temperature";
        obj2["value"] = temp;
        JsonObject& obj3 = sensorData.createNestedObject();
        obj3["key"] = "Loudness";
        obj3["value"] = loud;
        JsonObject& obj4 = sensorData.createNestedObject();
        obj4["key"] = "Light";
        obj4["value"] = light;
   
        sensorData.printTo(Serial);
        Serial.println();
        delay(1000);
    }
}


 





