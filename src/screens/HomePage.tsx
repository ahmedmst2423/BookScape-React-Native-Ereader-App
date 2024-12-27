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
  MD3Colors,
  MD3DarkTheme,
  Snackbar,
  Dialog,
  Portal,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScopedStorage from 'react-native-scoped-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { FileMetadata, MetadataCache } from '../utilities/interfaces';
import { useShelfContext } from '../context/shelfProvider';

interface BookItemProps {
  file: ScopedStorage.FileType;
  metadata: FileMetadata | undefined;
  onPress: () => void;
  onDeleteBook: (uri: string, fileName: string) => void;
}

const BookItem = React.memo(({ file, metadata, onPress, onDeleteBook }: BookItemProps) => {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const theme = useTheme();
  const shelfProp = { ...metadata, filePath: file.uri, fileName: file.name };

  const {
    finishedShelf,
    favouritesShelf,
    addToFinishedShelf,
    addToFavouritesShelf,
    removeFromFinishedShelf,
    removeFromFavouritesShelf,
  } = useShelfContext();

  useEffect(() => {
    setIsFinished(
      finishedShelf.some(
        (book:any) => book.filePath === file.uri && book.fileName === file.name
      )
    );
    setIsFavourite(
      favouritesShelf.some(
        (book:any) => book.filePath === file.uri && book.fileName === file.name
      )
    );
  }, []);

  const handleFinishedToggle = () => {
    if (isFinished) {
      removeFromFinishedShelf(shelfProp);
    } else {
      addToFinishedShelf(shelfProp);
    }
    setIsFinished(!isFinished);
  };

  const handleFavouriteToggle = () => {
    if (isFavourite) {
      removeFromFavouritesShelf(shelfProp);
    } else {
      addToFavouritesShelf(shelfProp);
    }
    setIsFavourite(!isFavourite);
  };

  return (
    <>
      <Card mode="elevated" style={styles.card} onPress={onPress}>
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
              <ProgressBar progress={(metadata?.progress || 0) / 100} color={MD3Colors.error50} />
            </View>
            <View style={styles.actions}>
              <IconButton
                icon={isFinished ? "check" : "check-outline"}
                size={20}
                iconColor={isFinished ? MD3Colors.error50 : undefined}
                onPress={handleFinishedToggle}
              />
              <IconButton
                icon={isFavourite ? "star" : "star-outline"}
                size={20}
                iconColor={isFavourite ? MD3Colors.error50 : undefined}
                onPress={handleFavouriteToggle}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => setDeleteDialogVisible(true)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Book</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete "{metadata?.title || file.name}"? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={() => {
                setDeleteDialogVisible(false);
                onDeleteBook(file.uri, file.name);
              }}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
});

const HomeScreen = () => {
  const [epubFiles, setEpubFiles] = useState<ScopedStorage.FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<MetadataCache>({});
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList, 'HomeScreen'>>();
  const theme = useTheme();
  const { removeFromFinishedShelf, removeFromFavouritesShelf } = useShelfContext();

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
        setFileMetadata((prev) => ({
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

      await Promise.all(epubFilesList.map((file) => loadFileMetadata(file)));
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

  const handleDeleteBook = useCallback(async (uri: string, fileName: string) => {
    try {
      await ScopedStorage.deleteFile(uri);
      setEpubFiles((prev) => prev.filter((file) => file.uri !== uri));
      const bookDetails = { filePath: uri, fileName };
      removeFromFinishedShelf(bookDetails);
      removeFromFavouritesShelf(bookDetails);
      setSnackbarMessage(`Deleted ${fileName}`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error deleting file:', error);
      setSnackbarMessage('Failed to delete file');
      setSnackbarVisible(true);
    }
  }, [removeFromFinishedShelf, removeFromFavouritesShelf]);

  const renderBookCard = useCallback(
    ({ item: file }: { item: ScopedStorage.FileType }) => (
      <BookItem
        file={file}
        metadata={fileMetadata[file.uri]}
        onPress={() => openReader(file.uri, file.name)}
        onDeleteBook={handleDeleteBook}
      />
    ),
    [fileMetadata, openReader, handleDeleteBook]
  );

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
        icon="folder"
        style={styles.fab}
        onPress={() => {/* Add function to select directory */}}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
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
    color: MD3DarkTheme.colors.onSecondary,
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
  snackbar: {
    marginBottom: 80,
  },
});

export default HomeScreen;
