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
  const { bookPath, bookName } = route.params; // Get the contentUri (bookPath)

  const [loading, setLoading] = useState(true); // Loading state
  const [fileUri, setFileUri] = useState<string | null>(null); // The converted file URI

  // Function to copy the content:// file to a file:// URI
  const copyFileToTemp = async (contentUri: string) => {
    try {
      const tempPath = `${RNFS.TemporaryDirectoryPath}/${bookName}`; // Path to save the file in the temp directory
      await RNFS.copyFile(contentUri, tempPath); // Copy the file from contentUri to tempPath
      return `file:/${tempPath}`; // Return the file:// path
    } catch (error) {
      console.error('Failed to copy file to temp directory', error);
      return null;
    }
  };

  useEffect(() => {
    // If bookPath exists, copy it to a file:// URI
    const convertUri = async () => {
      if (bookPath.startsWith('content://')) {
        const fileUri = await copyFileToTemp(bookPath);
        console.log(`Book Path:${bookPath} `);
        console.log(`File URI: ${fileUri}`)
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
