#include "Arduino.h"
#include "heltec.h"
#include "BluetoothSerial.h"

#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

#define PIN_SDA 4
#define PIN_SCL 15
#define OLED_RST 16
#define i2c_address 0x68

//with usage of library and examples from https://github.com/HelTecAutomation/Heltec_ESP32
//assembled by Daniel MacRae for Gait Movement Tracking SENG/BME 499 Project summer 2020.

Adafruit_MPU6050 mpu;
BluetoothSerial SerialBT;

void mpu_setup() {
  Serial.begin(115200);
  while (!Serial)
    delay(10); // will pause Zero, Leonardo, etc until serial console opens

  // Try to initialize!
  if (!mpu.begin(i2c_address)) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("Board 2 left arm");

  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
  Serial.print("Accelerometer range set to: ");
  switch (mpu.getAccelerometerRange()) {
  case MPU6050_RANGE_2_G:
    Serial.println("+-2G");
    break;
  case MPU6050_RANGE_4_G:
    Serial.println("+-4G");
    break;
  case MPU6050_RANGE_8_G:
    Serial.println("+-8G");
    break;
  case MPU6050_RANGE_16_G:
    Serial.println("+-16G");
    break;
  }
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  Serial.print("Gyro range set to: ");
  switch (mpu.getGyroRange()) {
  case MPU6050_RANGE_250_DEG:
    Serial.println("+- 250 deg/s");
    break;
  case MPU6050_RANGE_500_DEG:
    Serial.println("+- 500 deg/s");
    break;
  case MPU6050_RANGE_1000_DEG:
    Serial.println("+- 1000 deg/s");
    break;
  case MPU6050_RANGE_2000_DEG:
    Serial.println("+- 2000 deg/s");
    break;
  }

  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  Serial.print("Filter bandwidth set to: ");
  switch (mpu.getFilterBandwidth()) {
  case MPU6050_BAND_260_HZ:
    Serial.println("260 Hz");
    break;
  case MPU6050_BAND_184_HZ:
    Serial.println("184 Hz");
    break;
  case MPU6050_BAND_94_HZ:
    Serial.println("94 Hz");
    break;
  case MPU6050_BAND_44_HZ:
    Serial.println("44 Hz");
    break;
  case MPU6050_BAND_21_HZ:
    Serial.println("21 Hz");
    break;
  case MPU6050_BAND_10_HZ:
    Serial.println("10 Hz");
    break;
  case MPU6050_BAND_5_HZ:
    Serial.println("5 Hz");
    break;
  }

  Serial.println("");
  delay(100);
}

void mpu_read() {
  //NOTE TO READER: library has gyro and accelerometers interchanged for some reason.
  //calling gyro results in accelerometer readings......
  /* Get new sensor events with the readings */
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  //print out readings in csv format.
  Serial.print(g.gyro.x);
  Serial.print(",");
  Serial.print(g.gyro.y);
  Serial.print(",");
  Serial.print(g.gyro.z);

  Serial.println("");

}

void setup() {
  //init the display
  Heltec.begin(true /*DisplayEnable Enable*/, false /*LoRa Disable*/, true /*Serial Enable*/);
  Heltec.display->setContrast(255);
  Heltec.display->clear();
  //setup the MPU6050
  mpu_setup();
  SerialBT.begin("499ArmMonitoring");
}

void printBuffer(void) {
  // Initialize the log buffer
  // allocate memory to store 8 lines of text and 30 chars per line.
  Heltec.display->setLogBuffer(3, 30);

  //get an event to read out to the display.
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  Heltec.display->clear();
  Heltec.display->println(g.gyro.x);
  Heltec.display->println(g.gyro.y);
  Heltec.display->println(g.gyro.z);
  Heltec.display->drawLogBuffer(0, 0);
  Heltec.display->display();

  SerialBT.print(g.gyro.x);
  SerialBT.print(",");
  SerialBT.print(g.gyro.y);
  SerialBT.print(",");
  SerialBT.println(g.gyro.z);
}

//frequency in mHz for reading.
int read_frequency = 100;

void loop() {
  delay(read_frequency);
  printBuffer();
  mpu_read();
}
