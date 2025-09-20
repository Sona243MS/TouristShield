import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { Platform, PermissionsAndroid } from 'react-native';

class BLEManager {
  private static _instance: BLEManager;
  public manager: BleManager;
  private connectedDevice?: Device;

  private constructor() {
    this.manager = new BleManager();
  }

  static getInstance() {
    if (!BLEManager._instance) BLEManager._instance = new BLEManager();
    return BLEManager._instance;
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return granted;
    }
    return true;
  }

  startScan(onFound: (device: Device) => void, filterName?: string) {
    this.manager.startDeviceScan(null, { allowDuplicates: false }, (err, device) => {
      if (err) return console.warn('BLE Scan error', err);
      if (!device) return;
      if (!filterName || (device.name && device.name.includes(filterName))) {
        onFound(device);
      }
    });
  }

  stopScan() {
    this.manager.stopDeviceScan();
  }

  async connect(deviceId: string) {
    const d = await this.manager.connectToDevice(deviceId, { requestMTU: 256 });
    await d.discoverAllServicesAndCharacteristics();
    this.connectedDevice = d;
    return d;
  }

  async readCharacteristic(serviceUUID: string, charUUID: string) {
    if (!this.connectedDevice) throw new Error('Not connected');
    const c = await this.connectedDevice.readCharacteristicForService(serviceUUID, charUUID);
    const decoded = Buffer.from(c.value!, 'base64').toString();
    return decoded;
  }

  async subscribeCharacteristic(serviceUUID: string, charUUID: string, onChange: (value: string) => void) {
    if (!this.connectedDevice) throw new Error('Not connected');
    const sub = this.connectedDevice.monitorCharacteristicForService(serviceUUID, charUUID, (err, characteristic) => {
      if (err) return console.warn('monitor err', err);
      const val = characteristic?.value ? Buffer.from(characteristic.value, 'base64').toString() : '';
      onChange(val);
    });
    return sub; // unsubscribe with sub.remove()
  }

  async disconnect() {
    if (!this.connectedDevice) return;
    await this.manager.cancelDeviceConnection(this.connectedDevice.id);
    this.connectedDevice = undefined;
  }
}

export default BLEManager.getInstance();
