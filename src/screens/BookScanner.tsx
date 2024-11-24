import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  CameraPosition,
} from 'react-native-vision-camera';

const BookScanner = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isActive, setIsActive] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');
  const [flash, setFlash] = useState('off');
  const device = useCameraDevice(cameraPosition);
  const camera = React.useRef<Camera>(null);

  useEffect(() => {
    const getPermission = async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    };
    getPermission();
  }, [hasPermission, requestPermission]);

  const onFlipCamera = useCallback(() => {
    setCameraPosition(position => position === 'back' ? 'front' : 'back');
  }, []);

  const onFlashToggle = useCallback(() => {
    setFlash(currentFlash => {
      switch (currentFlash) {
        case 'off': return 'on';
        case 'on': return 'auto';
        default: return 'off';
      }
    });
  }, []);

  const onTakeSnapshot = useCallback(async () => {
    try {
      if (camera.current) {
        const snapshot = await camera.current.takePhoto();
        console.log('Snapshot taken:', snapshot.path);
        Alert.alert('Success', 'Snapshot captured successfully!');
      }
    } catch (error) {
      console.error('Failed to take snapshot:', error);
      Alert.alert('Error', 'Failed to take snapshot');
    }
  }, [flash]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        {/* Wrapping headlineSmall text in Text component */}
        <Text style={styles.statusText}>Camera permission is required</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        {/* Wrapping headlineSmall text in Text component */}
        <Text style={styles.statusText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        enableZoomGesture
        photo={true}
        video={false}
        audio={false}
      />
      
      <View style={styles.controlsContainer}>
        <View style={styles.topControls}>
          <IconButton
            icon={flash === 'off' ? 'flash-off' : flash === 'on' ? 'flash' : 'flash-auto'}
            iconColor="white"
            size={24}
            onPress={onFlashToggle}
          />
        </View>
        
        <View style={styles.bottomControls}>
          <IconButton
            icon="camera-flip"
            iconColor="white"
            size={24}
            onPress={onFlipCamera}
          />
          <TouchableOpacity
            style={styles.captureButton}
            onPress={onTakeSnapshot}
          />
          <View style={{ width: 48 }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default BookScanner;