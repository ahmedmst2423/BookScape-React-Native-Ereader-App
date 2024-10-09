import React, { useState, useEffect } from 'react';
import { SafeAreaView, useWindowDimensions, Button, Alert, View, Text } from 'react-native';
import { Reader, ReaderProvider,Themes,useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/file-system'; // For bare RN projects
import * as ScopedStorage from 'react-native-scoped-storage';
import RNFS from 'react-native-fs'; // For file system access
import { ProgressBar,MD3DarkTheme } from 'react-native-paper';
import { Theme } from '@react-navigation/native';
interface ReaderScreenProps {
  folderName: string; // The path to the folder containing the EPUB file

}

const ReaderScreen: React.FC<ReaderScreenProps> = ({ folderName }) => {
  const { width, height } = useWindowDimensions();
  const [fileUri, setFileUri] = useState<string | null>(null); // Initialize as null
  const [loading, setLoading] = useState(true);
  const { changeFontSize } = useReader();
  
  useEffect(() => {
    if (folderName) {
      setFileUri(folderName);
      console.log(`File found at ${folderName}`);
    } else {
      Alert.alert('File Not Found');
    }
  }, [folderName]);
  
  console.log('Rendering Reader with fileUri:', fileUri); // Log the fileUri being used
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {fileUri ? (
        <Reader
          src={fileUri}
          width={width}
          height={height}
          fileSystem={useFileSystem}
          enableSelection={true}
          onLocationChange={(location) => console.log('Current Location:', location)}
          enableSwipe={true}
          
        />
      ) : (
        <Text>No file loaded.</Text> // Add a fallback message
      )}
    </SafeAreaView>
  );
};

export default ReaderScreen;

  
  




