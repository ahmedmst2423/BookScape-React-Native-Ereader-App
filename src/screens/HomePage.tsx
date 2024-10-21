import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Image, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScopedStorage from 'react-native-scoped-storage';
import { useReader } from '@epubjs-react-native/core'; // UseReader to get metadata
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

const HomeScreen = () => {
  const [epubFiles, setEpubFiles] = useState<ScopedStorage.FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileMetadata, setFileMetadata] = useState<{ [key: string]: any }>({});
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'HomeScreen'>>();
  const { getMeta } = useReader(); // To access metadata

  // Load saved metadata from AsyncStorage
  const loadSavedMetadata = async (uri: string) => {
    try {
      const savedMetadata = await AsyncStorage.getItem(`metadata_${uri}`);
      return savedMetadata ? JSON.parse(savedMetadata) : null;
    } catch (error) {
      console.error('Error loading saved metadata:', error);
      return null;
    }
  };

  // Save metadata to AsyncStorage
  const saveMetadata = async (uri: string, metadata: any) => {
    try {
      await AsyncStorage.setItem(`metadata_${uri}`, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  };

  // Load metadata for a specific EPUB file
  const loadFileMetadata = async (file: ScopedStorage.FileType) => {
    // First, check if metadata is already saved in AsyncStorage
    const savedMetadata = await loadSavedMetadata(file.uri);

    if (savedMetadata) {
      // If metadata is saved, use it
      setFileMetadata((prevMetadata) => ({
        ...prevMetadata,
        [file.uri]: savedMetadata,
      }));
    } else {
      // If no saved metadata, load the book into memory and extract metadata
      try {
        const metadata = await getMeta(); // Extract metadata using useReader
        const metaToSave = {
          title: metadata.title || 'Unknown Title',
          author: metadata.author || 'Unknown Author',
          coverUrl: metadata.cover || '',
        };

        // Save the metadata locally for future use
        await saveMetadata(file.uri, metaToSave);

        // Set metadata to state
        setFileMetadata((prevMetadata) => ({
          ...prevMetadata,
          [file.uri]: metaToSave,
        }));
      } catch (error) {
        console.error(`Error loading metadata for ${file.name}:`, error);
      }
    }
  };

  // Load EPUB files from directory
  const readEpubFiles = async () => {
    setLoading(true);
    try {
      const storedUri = await AsyncStorage.getItem('scopedStorageUri');
      if (!storedUri) {
        throw new Error('No directory URI found');
      }
      const files = await ScopedStorage.listFiles(storedUri);
      const epubFilesList = files.filter((file) => file.name.endsWith('.epub'));
      setEpubFiles(epubFilesList);

      // Load metadata for each file
      epubFilesList.forEach((file) => loadFileMetadata(file));

      setLoading(false);
    } catch (error) {
      console.error('Error loading files:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    readEpubFiles();
  }, []);

  // Navigate to ReaderScreen with the selected book
  const openReader = (contentUri: string, fileName: string) => {
    navigation.navigate('ReaderScreen', { bookPath: contentUri, bookName: fileName });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        {loading && (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator animating={true} color="blue" />
            <Text>Loading EPUB files...</Text>
          </View>
        )}

        {!loading && epubFiles.length > 0 && (
          epubFiles.map((file, index) => {
            const metadata = fileMetadata[file.uri];
            return (
              <Card key={index} style={styles.card} onPress={() => openReader(file.uri, file.name)}>
                <View style={styles.cardContent}>
                  {metadata?.coverUrl ? (
                    <Image source={{ uri: metadata.coverUrl }} style={styles.coverImage} />
                  ) : (
                    <View style={styles.coverImagePlaceholder}>
                      <Text>No Cover</Text>
                    </View>
                  )}
                  <View style={styles.textContent}>
                    <Text variant="titleMedium">{metadata?.title || file.name}</Text>
                    <Text variant="bodyMedium">Author: {metadata?.author || 'Unknown'}</Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}

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

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  coverImage: { width: 100, height: 150, marginRight: 10 },
  coverImagePlaceholder: { width: 100, height: 150, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', marginRight: 10 },
  textContent: { flex: 1 },
});

export default HomeScreen;
