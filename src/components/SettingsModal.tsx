import React, { useState } from 'react';
import { Modal, Portal, Button, Text, RadioButton, Switch, Divider, IconButton, useTheme, MD3DarkTheme } from 'react-native-paper';
import { View, StyleSheet,Alert } from 'react-native';
import { useReader,Themes } from '@epubjs-react-native/core'; // Import the useReader hook

const SettingsModal: React.FC<{ visible: boolean; onDismiss: () => void }> = ({ visible, onDismiss }) => {
  const { changeFontFamily, changeFontSize, changeTheme, goToLocation } = useReader(); // Access reader controls
  const [selectedFont, setSelectedFont] = useState<string>('default');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState(16); // State to manage font size
  const appTheme = useTheme();
  const handleFontChange = (newFont: string) => {
    setSelectedFont(newFont);
    changeFontFamily(newFont); // Change the font using the reader's hook
  };

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    changeTheme(newTheme === 'dark' ? Themes.DARK : Themes.LIGHT); // Change the theme
  };

  const increaseFontSize = () => {
    const newSize = fontSize + 1;
    setFontSize(newSize);
    changeFontSize(`${fontSize}px`); // Increase font size
  };

  const decreaseFontSize = () => {
    const newSize = fontSize > 10 ? fontSize - 1 : 10; // Minimum font size is 10
    setFontSize(newSize);
    changeFontSize(`${fontSize}px`); // Decrease font size
  };

  const handleShowChapters = () => {
    goToLocation('chapter-1'); // Example to go to a specific chapter
    // Implement your logic to show the chapters
    Alert.alert('Chapters', 'Chapters will be listed here');
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Reader Settings</Text>

        {/* Font Selection */}
        <Text style={styles.subtitle}>Select Font</Text>
        <RadioButton.Group onValueChange={handleFontChange} value={selectedFont}>
          <RadioButton.Item label="Default" value="default" />
          <RadioButton.Item label="Serif" value="serif" />
          <RadioButton.Item label="Sans-serif" value="sans-serif" />
        </RadioButton.Group>

        <Divider style={styles.divider} />

        {/* Theme Switch */}
        <View style={styles.switchContainer}>
          <Text style={styles.subtitle}>Dark Theme</Text>
          <Switch value={theme === 'dark'} onValueChange={handleThemeChange} />
        </View>

        <Divider style={styles.divider} />

        {/* Font Size Adjuster */}
        <View style={styles.fontSizeContainer}>
        <Text variant="titleMedium" style={styles.fontSizeText}>Font Size</Text>
          <IconButton icon="minus" size={20} onPress={decreaseFontSize} />
          <Text style={styles.fontSizeText}>{fontSize}</Text>
          <IconButton icon="plus" size={20} onPress={increaseFontSize} />
        </View>

        <Divider style={styles.divider} />
        {/* Show Chapters Button
        <Button mode="contained" onPress={handleShowChapters} style={styles.button}>
          Show Chapters
        </Button> */}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:MD3DarkTheme.colors.background ,
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
  button: {
    marginTop: 20,
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
