import React, { useEffect, useState } from 'react';
import { SafeAreaView, useWindowDimensions, View, Text, Alert } from 'react-native';
import { Reader, Themes } from '@epubjs-react-native/core';
import { ProgressBar } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScopedStorage from 'react-native-scoped-storage';
import { useFileSystem } from '@epubjs-react-native/file-system';
import { RootStackParamList } from '../../App';
import RNFS from 'react-native-fs'; // Import RNFS

type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'ReaderScreen'>;

const ReaderScreen = () => {
  const { width, height } = useWindowDimensions();
  const route = useRoute<ReaderScreenRouteProp>();
  const { bookName } = route.params; // Use the bookName only

  const [loading, setLoading] = useState(true);
  const [fileUri, setFileUri] = useState<string | null>(null);

  // Function to copy the content:// file to a file:// URI using ScopedStorage and save in AsyncStorage
  const copyFileToDirectory = async (contentUri: string, bookName: string) => {
    const dirPath = `${RNFS.DocumentDirectoryPath}/EPUBs`; // Directory for storing EPUBs
    const filePath = `${dirPath}/${bookName}`; // Full file path

    return RNFS.exists(dirPath)
      .then((dirExists) => {
        if (!dirExists) {
          return RNFS.mkdir(dirPath); // Create directory if it doesn't exist
        }
        return Promise.resolve(); // Return a resolved promise if the directory already exists
      })
      .then(() => {
        // Use ScopedStorage.readFile to read the content in base64
        return ScopedStorage.readFile(contentUri, 'base64');
      })
      .then((fileData) => {
        // Write the base64 file data to the tempPath
        return RNFS.writeFile(filePath, fileData, 'base64');
      })
      .then(async () => {
        await AsyncStorage.setItem(bookName, `file://${filePath}`); // Save path to AsyncStorage
        return `file://${filePath}`; // Return the file:// URI
      })
      .catch((error) => {
        console.error('Error copying file to custom directory:', error);
        return null; // Handle error
      });
  };

  const findBookInDirectory = async () => {
    try {
      // First, check if the file path is already stored in AsyncStorage
      const storedFilePath = await AsyncStorage.getItem(bookName);
      if (storedFilePath) {
        setFileUri(storedFilePath); // If file path is found, use it
        setLoading(false);
        return;
      }

      const savedUri = await AsyncStorage.getItem('scopedStorageUri');
      if (!savedUri) {
        Alert.alert('Error', 'No saved directory found.');
        setLoading(false);
        return;
      }

      const files = await ScopedStorage.listFiles(savedUri); // List all files in the directory
      const bookFile = files.find(file => file.name === bookName); // Find the book by name

      if (bookFile && bookFile.uri) {
        // Found the book, now copy it to the documents directory
        const fileUri = await copyFileToDirectory(bookFile.uri, bookName);
        setFileUri(fileUri); // Set the file URI for the reader
        setLoading(false);
      } else {
        Alert.alert('Error', `Book "${bookName}" not found in the selected directory.`);
        setLoading(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Error accessing the folder or loading the files');
      console.error('Error accessing the folder or loading the files:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Find the book in the saved directory when the component mounts
    findBookInDirectory();
  }, [bookName]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading && (
        <View style={{ padding: 20 }}>
          <ProgressBar indeterminate color="blue" style={{ height: 10 }} />
          <Text style={{ marginTop: 10 }}>Loading EPUB file...</Text>
        </View>
      )}

      {!loading && fileUri && (
        <Reader
          fileSystem={useFileSystem}
          src={fileUri}
          width={width}
          height={height}
          defaultTheme={Themes.DARK}
          onReady={() => console.log('Book ready')}
          onDisplayError={(error) => {
            console.error('Error loading the EPUB:', error);
            Alert.alert('Error', 'There was an issue loading the EPUB file.');
          }}
        />
      )}

      {!fileUri && !loading && (
        <View style={{ padding: 20 }}>
          <Text>No EPUB file available. Please provide a valid book path.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ReaderScreen;
