import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import BLEManager from '../src/services/BLEManager';

const SERVICE_DEVICE_INFO = "0000180a-0000-1000-8000-00805f9b34fb";
const CHAR_BATTERY = "00002a19-0000-1000-8000-00805f9b34fb";
const SERVICE_SOS = "0000feed-0000-1000-8000-00805f9b34fb";
const CHAR_SOS_TRIGGER = "0000beef-0000-1000-8000-00805f9b34fb";

export default function BandDetailsScreen({ route }) {
  const { deviceId } = route.params;
  const [battery, setBattery] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [sub, setSub] = useState(null);

  useEffect(() => {
    // Read battery level
    BLEManager.readCharacteristic(SERVICE_DEVICE_INFO, CHAR_BATTERY)
      .then(level => setBattery(level))
      .catch(() => setBattery('Unknown'));

    // Subscribe to SOS
    const subscription = BLEManager.subscribeCharacteristic(
      SERVICE_SOS,
      CHAR_SOS_TRIGGER,
      (val) => {
        setSosActive(true);
        Alert.alert('SOS Triggered!', val);
        // TODO: Upload event to backend
      }
    );
    setSub(subscription);

    return () => {
      if (sub) sub.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Band Details</Text>
      <Text>Device ID: {deviceId}</Text>
      <Text>Battery Level: {battery}</Text>
      <Text style={{ marginTop: 16, color: sosActive ? 'red' : 'green' }}>
        {sosActive ? 'SOS ACTIVE!' : 'Normal'}
      </Text>
      {/* Add more UI for syncing events, last sync time, etc. */}
    </View>
  );
}
