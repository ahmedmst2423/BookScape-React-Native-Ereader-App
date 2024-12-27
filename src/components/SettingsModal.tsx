import React, { useEffect, useState } from 'react';
import { Modal, Portal, Text, RadioButton, Switch, Divider, IconButton, useTheme, MD3DarkTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useReader } from '@epubjs-react-native/core';
import darkTheme from '../styles/darkTheme';
import lightTheme from '../styles/lightTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsModal: React.FC<{ visible: boolean; onDismiss: () => void }> = ({ visible, onDismiss }) => {
  const { changeFontFamily, changeFontSize, changeTheme } = useReader();
  const [selectedFont, setSelectedFont] = useState<string>('default');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState<number>(16);

  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem('font-size');
        if (savedFontSize) {
          const size = parseInt(savedFontSize, 10);
          setFontSize(size);
          changeFontSize(`${size}px`);
        }
      } catch (error) {
        console.error('Error loading font size:', error);
      }
    };
    loadFontSize();
  }, []);

  const handleFontChange = (newFont: string) => {
    setSelectedFont(newFont);
    changeFontFamily(newFont);
  };

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    changeTheme(newTheme === 'dark' ? darkTheme : lightTheme);
  };

  const updateFontSize = async (newSize: number) => {
    try {
      setFontSize(newSize);
      changeFontSize(`${newSize}px`);
      await AsyncStorage.setItem('font-size', newSize.toString());
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  const increaseFontSize = () => {
    updateFontSize(fontSize + 1);
  };

  const decreaseFontSize = () => {
    const newSize = fontSize > 10 ? fontSize - 1 : 10;
    updateFontSize(newSize);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Reader Settings</Text>

        <Text style={styles.subtitle}>Select Font</Text>
        <RadioButton.Group onValueChange={handleFontChange} value={selectedFont}>
          
          <RadioButton.Item disabled={false} label="Serif" value="serif" />
          <RadioButton.Item label="Sans-serif" value="sans-serif" />
        </RadioButton.Group>

        <Divider style={styles.divider} />

        <View style={styles.switchContainer}>
          <Text style={styles.subtitle}>Dark Theme</Text>
          <Switch value={theme === 'dark'} onValueChange={handleThemeChange} />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.fontSizeContainer}>
          <Text variant="titleMedium" style={styles.fontSizeText}>Font Size</Text>
          <IconButton icon="minus" size={20} onPress={decreaseFontSize} />
          <Text style={styles.fontSizeText}>{fontSize}</Text>
          <IconButton icon="plus" size={20} onPress={increaseFontSize} />
        </View>

        <Divider style={styles.divider} />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: MD3DarkTheme.colors.background,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  divider: {
    marginVertical: 10,
  },
  fontSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  fontSizeText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
});

export default SettingsModal;