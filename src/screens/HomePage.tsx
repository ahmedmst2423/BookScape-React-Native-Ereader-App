import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Add AsyncStorage
import * as ScopedStorage from 'react-native-scoped-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

const HomeScreen = () => {
  const [epubFiles, setEpubFiles] = useState<ScopedStorage.FileType[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NavigationProp<RootStackParamList, 'HomeScreen'>>();

  // Function to read EPUB files from the selected directory
  const readEpubFiles = async () => {
    setLoading(true);
    try {
      // Get the stored directory URI from AsyncStorage
      const storedUri = await AsyncStorage.getItem('scopedStorageUri');
      if (!storedUri) {
        throw new Error('No directory URI found');
      }

      const files = await ScopedStorage.listFiles(storedUri); // Get list of files in the directory
      const epubFilesList = files.filter((file) => file.name.endsWith('.epub')); // Filter for .epub files
      setEpubFiles(epubFilesList); // Store EPUB files in state
      setLoading(false); // Stop loading once files are set
    } catch (err) {
      Alert.alert('Error', 'Error loading the files');
      console.error('Error loading the files:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Read EPUB files when the component mounts
    readEpubFiles();
  }, []);

  // Function to navigate to the ReaderScreen and pass the file's content URI directly
  const openReader = (contentUri: string, fileName: string) => {
    try {
      // Navigate to the ReaderScreen with the contentUri directly
      navigation.navigate('ReaderScreen', { bookPath: contentUri, bookName: fileName });
    } catch (error) {
      console.error('Failed to open book:', error);
      Alert.alert('Error', 'There was an issue opening the book.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        {/* Show loading indicator */}
        {loading && (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator animating={true} color="blue" />
            <Text>Loading EPUB files...</Text>
          </View>
        )}

        {/* Display EPUB files as cards */}
        {!loading && epubFiles.length > 0 && (
          epubFiles.map((file, index) => (
            <Card key={index} style={{ marginBottom: 10 }} onPress={() => openReader(file.uri, file.name)}>
              <Card.Content>
                <Text variant="titleMedium">{file.name}</Text>
              </Card.Content>
            </Card>
          ))
        )}

        {/* Show a message if no EPUB files found */}
        {!loading && epubFiles.length === 0 && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text>No EPUB files found. Please select a directory containing EPUB files.</Text>
            <Button mode="contained" onPress={readEpubFiles} style={{ marginTop: 10 }}>
              Reload Files
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
