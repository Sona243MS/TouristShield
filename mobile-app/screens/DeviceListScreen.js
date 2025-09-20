import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
import BLEManager from '../src/services/BLEManager';

export default function DeviceListScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    BLEManager.requestPermissions();
  }, []);

  const handleScan = () => {
    setDevices([]);
    setScanning(true);
    BLEManager.startScan((device) => {
      setDevices((prev) => {
        // avoid duplicates
        if (prev.some((d) => d.id === device.id)) return prev;
        return [...prev, device];
      });
    });
    setTimeout(() => {
      BLEManager.stopScan();
      setScanning(false);
    }, 5000); // scan for 5 seconds
  };

  const handleConnect = async (deviceId) => {
    await BLEManager.connect(deviceId);
    navigation.navigate('BandDetailsScreen', { deviceId });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button
        title={scanning ? 'Scanning...' : 'Scan for Devices'}
        onPress={handleScan}
        disabled={scanning}
      />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}
            onPress={() => handleConnect(item.id)}
          >
            <Text>{item.name || 'Unknown Device'}</Text>
            <Text style={{ fontSize: 12, color: '#888' }}>{item.id}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
