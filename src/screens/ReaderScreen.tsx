import React, { useEffect, useState } from 'react';
import { SafeAreaView, useWindowDimensions, View, Text, Alert } from 'react-native';
import { Reader, Themes } from '@epubjs-react-native/core';
import { ProgressBar } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import RNFS from 'react-native-fs'; // For file system operations
import * as ScopedStorage from 'react-native-scoped-storage'; // To handle content:// URIs
import { useFileSystem } from '@epubjs-react-native/file-system';

// Define the route param type
type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'ReaderScreen'>;

const ReaderScreen = () => {
  const { width, height } = useWindowDimensions();
  const route = useRoute<ReaderScreenRouteProp>();
  const { bookPath } = route.params; // Get the contentUri (bookPath)

  const [loading, setLoading] = useState(true); // Loading state
  const [fileUri, setFileUri] = useState<string | null>(null); // The converted file URI

  // Function to copy the content:// file to a file:// URI
  const copyContentUriToFile = async (contentUri: string) => {
    try {
      // Generate a temporary file path to store the file
      const fileName = contentUri.split('/').pop() || 'temp.epub';
      const tempPath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

      // Use ScopedStorage.readFile to read the content from the content:// URI
      const fileData = await ScopedStorage.readFile(contentUri, 'base64');

      if (fileData) {
        // Write the base64 file data to the tempPath
        await RNFS.writeFile(tempPath, fileData, 'base64');
        return `file://${tempPath}`; // Return the file:// URI
      } else {
        throw new Error('Failed to read the file from the content URI.');
      }
    } catch (error) {
      console.error('Error copying content URI to file:', error);
      Alert.alert('Error', 'There was an issue copying the file.');
      return null;
    }
  };

  useEffect(() => {
    // If bookPath exists, copy it to a file:// URI
    const convertUri = async () => {
      if (bookPath.startsWith('content://')) {
        const fileUri = await copyContentUriToFile(bookPath);
        setFileUri(fileUri); // Set the file URI once the copy is done
        setLoading(false); // Stop the loader
      } else {
        setFileUri(bookPath); // If it's already a file:// URI, just use it
        setLoading(false); // Stop the loader
      }
    };

    convertUri();
  }, [bookPath]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Show loader while loading is true */}
      {loading && (
        <View style={{ padding: 20 }}>
          <ProgressBar indeterminate color="blue" style={{ height: 10 }} />
          <Text style={{ marginTop: 10 }}>Loading EPUB file...</Text>
        </View>
      )}

      {/* Display the reader only when loading is false and fileUri is available */}
      {!loading && fileUri && (
        <Reader
        fileSystem={useFileSystem}
          src={fileUri} // Pass the file:// URI to the reader
          width={width}
          height={height}
          onReady={() => {
            console.log('Book ready');
          }}
          onLocationChange={(location) => console.log('Current Location:', location)}
          defaultTheme={Themes.DARK}
          onDisplayError={(error) => {
            console.error('Error loading the EPUB:', error);
            Alert.alert('Error', 'There was an issue loading the EPUB file.');
          }}
        />
      )}

      {/* If there's no fileUri and loading is false, show a message */}
      {!fileUri && !loading && (
        <View style={{ padding: 20 }}>
          <Text>No EPUB file available. Please provide a valid book path.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ReaderScreen;
