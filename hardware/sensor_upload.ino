#include <WiFi.h>
#include <FirebaseESP32.h>
#include <ModbusMaster.h>

/* ---------------- WIFI ---------------- */
#define WIFI_SSID     "Asianet Broadband"
#define WIFI_PASSWORD "Martin@123"

/* ---------------- FIREBASE ---------------- */
#define API_KEY       "AIzaSyCfYSxc-ckcIAGMR81mdz24A9MSLjrdkp4"
#define DATABASE_URL  "https://smart-agriculture-ai-2369e-default-rtdb.asia-southeast1.firebasedatabase.app/"

/* ---------------- MODBUS SENSOR ---------------- */
#define RXD2 16
#define TXD2 17
#define DE_RE 4
#define SLAVE_ID 1
#define BAUD_RATE 9600

ModbusMaster node;

/* ---------------- FIREBASE OBJECTS ---------------- */
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

/* ---------------- TIMING ---------------- */
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 5000; // 5 seconds

/* ---------------- RS485 CONTROL ---------------- */
void preTransmission() {
  digitalWrite(DE_RE, HIGH);
  delayMicroseconds(100);
}

void postTransmission() {
  delayMicroseconds(100);
  digitalWrite(DE_RE, LOW);
}

void setup() {
  Serial.begin(115200);

  /* RS485 Setup */
  pinMode(DE_RE, OUTPUT);
  digitalWrite(DE_RE, LOW);
  Serial2.begin(BAUD_RATE, SERIAL_8N1, RXD2, TXD2);

  node.begin(SLAVE_ID, Serial2);
  node.preTransmission(preTransmission);
  node.postTransmission(postTransmission);

  /* WiFi */
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");

  /* Firebase */
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  Serial.println("System Started");
}

void loop() {

  if (millis() - lastSendTime > SEND_INTERVAL) {
    lastSendTime = millis();

    uint8_t result;
    result = node.readHoldingRegisters(0x0000, 3);

    if (result != node.ku8MBSuccess) {
      Serial.println("Modbus Read Error");
      return;
    }

    /* -------- SENSOR RAW VALUES -------- */
    float moisture = node.getResponseBuffer(0) / 10.0;
    float temperature = node.getResponseBuffer(1) / 10.0;
    int ec = node.getResponseBuffer(2);

    /* -------- CALCULATIONS -------- */
    float ec_corrected = ec / (moisture / 100.0 + 0.1);

    float totalNutrients = ec_corrected * 0.5;
    float nitrogen = totalNutrients * 0.44;
    float phosphorus = totalNutrients * 0.22;
    float potassium = totalNutrients * 0.34;

    float pH_raw = 7.2
                   - (ec / 3000.0)
                   + (moisture - 25.0) * 0.015
                   - (temperature - 25.0) * 0.02;

    if (pH_raw < 4.5) pH_raw = 4.5;
    if (pH_raw > 8.5) pH_raw = 8.5;

    static float pH = 7.0;
    pH = 0.85 * pH + 0.15 * pH_raw;

    /* -------- PRINT -------- */
    Serial.println("------ SOIL PARAMETERS ------");
    Serial.println("Moisture: " + String(moisture));
    Serial.println("Temperature: " + String(temperature));
    Serial.println("pH: " + String(pH));
    Serial.println("N: " + String(nitrogen));
    Serial.println("P: " + String(phosphorus));
    Serial.println("K: " + String(potassium));
    Serial.println("-----------------------------");

    /* -------- FIREBASE JSON -------- */
    FirebaseJson json;
    json.set("moisture", moisture);
    json.set("temperature", temperature);
    json.set("pH", pH);
    json.set("nitrogen", nitrogen);
    json.set("phosphorus", phosphorus);
    json.set("potassium", potassium);
    json.set("timestamp", millis());

    if (Firebase.setJSON(fbdo, "/sensorData", json)) {
      Serial.println("✅ Data sent to Firebase");
    } else {
      Serial.println("❌ Firebase Error: " + fbdo.errorReason());
    }
  }
}