export class BLEDevice {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.rxCharacteristic = null;
    this.txCharacteristic = null;
    this.NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    this.RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
    this.TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
  }

  async connect() {
    try {
      // Request device with NUS service
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            services: [this.NUS_SERVICE_UUID],
          },
        ],
      });

      // Connect to GATT server
      this.server = await this.device.gatt.connect();

      // Get NUS service
      this.service = await this.server.getPrimaryService(this.NUS_SERVICE_UUID);

      // Get characteristics
      this.rxCharacteristic = await this.service.getCharacteristic(this.RX_CHARACTERISTIC_UUID);
      this.txCharacteristic = await this.service.getCharacteristic(this.TX_CHARACTERISTIC_UUID);

      // Start notifications
      await this.txCharacteristic.startNotifications();

      return true;
    } catch (error) {
      console.error('BLE Connection Error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.service = null;
    this.rxCharacteristic = null;
    this.txCharacteristic = null;
  }

  async send(data) {
    if (!this.rxCharacteristic) {
      throw new Error('Device not connected');
    }

    const encoder = new TextEncoder();
    await this.rxCharacteristic.writeValue(encoder.encode(data));
  }

  onReceive(callback) {
    if (!this.txCharacteristic) {
      throw new Error('Device not connected');
    }

    this.txCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
      const decoder = new TextDecoder();
      const value = decoder.decode(event.target.value);
      callback(value);
    });
  }

  isConnected() {
    return this.device && this.device.gatt.connected;
  }

  getDeviceName() {
    return this.device ? this.device.name : null;
  }
}
