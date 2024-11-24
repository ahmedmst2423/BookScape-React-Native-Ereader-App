import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView, FlatList, View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Surface,
  useTheme,
  Avatar,
  IconButton,
  Banner,
  Divider,
  FAB,
  ProgressBar,
  MD3Colors
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScopedStorage from 'react-native-scoped-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import {FileMetadata,MetadataCache} from '../utilities/interfaces'




const HomeScreen = () => {
  const [epubFiles, setEpubFiles] = useState<ScopedStorage.FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<MetadataCache>({});
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'HomeScreen'>>();
  const theme = useTheme();

  const loadSavedMetadata = useCallback(async (uri: string): Promise<FileMetadata | null> => {
    try {
      const savedMetadata = await AsyncStorage.getItem(`metadata_${uri}`);
      return savedMetadata ? JSON.parse(savedMetadata) : null;
    } catch (error) {
      console.error('Error loading saved metadata:', error);
      return null;
    }
  }, []);

 

  const loadFileMetadata = useCallback(async (file: ScopedStorage.FileType) => {
    try {
      const savedMetadata = await loadSavedMetadata(file.uri);
      if (savedMetadata) {
        setFileMetadata(prev => ({
          ...prev,
          [file.uri]: savedMetadata,
        }));
      }
    } catch (error) {
      console.error(`Error loading metadata for ${file.name}:`, error);
    }
  }, [loadSavedMetadata]);

  const readEpubFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storedUri = await AsyncStorage.getItem('scopedStorageUri');
      if (!storedUri) {
        throw new Error('No directory URI found');
      }
      const files = await ScopedStorage.listFiles(storedUri);
      const epubFilesList = files.filter((file) => file.name.toLowerCase().endsWith('.epub'));
      setEpubFiles(epubFilesList);

      // Load metadata in parallel
      await Promise.all(epubFilesList.map(file => loadFileMetadata(file)));
    } catch (error) {
      console.error('Error loading files:', error);
      setError(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [loadFileMetadata]);

  useEffect(() => {
    readEpubFiles();
  }, [readEpubFiles]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await readEpubFiles();
    setRefreshing(false);
  }, [readEpubFiles]);

  const openReader = useCallback((contentUri: string, fileName: string) => {
    navigation.navigate('ReaderScreen', { bookPath: contentUri, bookName: fileName });
  }, [navigation]);

  const renderBookCard = useCallback(({ item: file }: { item: ScopedStorage.FileType }) => {
    const metadata = fileMetadata[file.uri];
    return (
      <Card
        mode="elevated"
        style={styles.card}
        onPress={() => openReader(file.uri, file.name)}
      >
        <Card.Content style={styles.cardContent}>
          {metadata?.cover ? (
            <Card.Cover
              source={{ uri: metadata.cover }}
              style={styles.coverImage}
            />
          ) : (
            <Surface style={styles.coverImagePlaceholder} elevation={1}>
              <Avatar.Icon
                size={50}
                icon="book"
                color={theme.colors.primary}
                style={{ backgroundColor: 'transparent' }}
              />
            </Surface>
          )}
          <View style={styles.textContent}>
            <Text variant="titleMedium" numberOfLines={2}>
              {metadata?.title || file.name}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
              {metadata?.author || 'Unknown Author'}
            </Text>
            <View>
            <ProgressBar progress={0.5} color={MD3Colors.error50} />
            </View>
            <View style={styles.actions}>
              <IconButton
                icon="check"
                size={20}
                onPress={() => {/* Add book details modal */}}
              />
              <IconButton
                icon="star-outline"
                size={20}
                accessibilityLabel='Added to Favourites'
                accessibilityHint='Add to Favourites'
                onPress={() => {/* Add to favorites */}}

              
              />
              <IconButton
                icon="plus"
                size={20}
                onPress={() => {/* Add book details modal */}}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }, [fileMetadata, openReader, theme.colors]);

  const EmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Avatar.Icon size={80} icon="book-outline" style={{ backgroundColor: theme.colors.surfaceVariant }} />
      <Text variant="headlineSmall" style={styles.emptyText}>No Books Found</Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        Add some EPUB files to get started
      </Text>
      <Button
        mode="contained"
        onPress={readEpubFiles}
        style={styles.reloadButton}
      >
        Reload Files
      </Button>
    </View>
  ), [readEpubFiles, theme.colors]);

 

  return (
    <SafeAreaView style={styles.container}>
      <Banner
        visible={!!error}
        icon="alert"
        actions={[{ label: 'Retry', onPress: readEpubFiles }]}
      >
        {error}
      </Banner>

      <FlatList
        data={epubFiles}
        renderItem={renderBookCard}
        keyExtractor={(file) => file.uri}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={!loading ? EmptyComponent : null}
        ItemSeparatorComponent={Divider}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading Books...
          </Text>
        </View>
      )}

      <FAB
        icon="bell"
        style={styles.fab}
        onPress={() => {/* Add function to select directory */}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    marginVertical: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  coverImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  coverImagePlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  textContent: {
    flex: 1,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  reloadButton: {
    marginTop: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
