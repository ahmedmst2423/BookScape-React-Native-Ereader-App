import React, { useCallback } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Modal, Portal, List, TouchableRipple, Button, MD3DarkTheme } from 'react-native-paper';
import { useReader } from '@epubjs-react-native/core';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ChapterListProps = {
  visible: boolean;
  onDismiss: () => void;
  bookUri: string;
};

const ChapterList: React.FC<ChapterListProps> = ({ bookUri, visible, onDismiss }) => {
  const { toc, goToLocation } = useReader(); // Access reader's Table of Contents (toc) and goToLocation method

  // Save the current location to AsyncStorage
  const saveLocation = useCallback(async (location: string): Promise<void> => {
    try {
      const metadataKey = `metadata_${bookUri}`;
      const savedMetadata = await AsyncStorage.getItem(metadataKey);
      const metadata = savedMetadata ? JSON.parse(savedMetadata) : {};

      await AsyncStorage.setItem(
        metadataKey,
        JSON.stringify({
          ...metadata,
          currentLocation: location,
        })
      );
    } catch (error) {
      console.error('Error saving location:', error);
    }
  }, [bookUri]);

  // Render each chapter item or Accordion for chapters with subitems
  const renderChapterItem = ({ item }: { item: any }) => {
    // Check if there are subitems
    if (item.subitems && item.subitems.length > 0) {
      // Render Accordion for chapters with subitems
      return (
        <List.Accordion
          title={item.label.trim()}
          left={() => <List.Icon icon="folder" />} // Icon for the main chapter with sub-chapters
        >
          {/* Use a FlatList to render subitems inside the accordion */}
          <View style={{ flexGrow: 1 }}>
            <FlatList
              data={item.subitems}
              keyExtractor={(subitem, index) => subitem.id || index.toString()}
              renderItem={({ item: subitem }) => (
                <TouchableRipple
                  onPress={async () => {
                    await saveLocation(subitem.href); // Save the selected location
                    goToLocation(subitem.href); // Navigate to sub-chapter on press
                    onDismiss(); // Close modal after selection
                  }}
                  rippleColor="rgba(0, 0, 0, .32)"
                >
                  <List.Item
                    title={subitem.label.trim()} // Sub-chapter title
                    left={() => <List.Icon icon="subdirectory-arrow-right" />} // Icon for each sub-chapter
                  />
                </TouchableRipple>
              )}
            />
          </View>
        </List.Accordion>
      );
    }

    // Render normal List.Item for chapters without subitems
    return (
      <TouchableRipple
        onPress={async () => {
          await saveLocation(item.href); // Save the selected location
          goToLocation(item.href);
          onDismiss();
        }}
        rippleColor="rgba(0, 0, 0, .32)"
      >
        <List.Item
          title={item.label.trim()}
          left={() => <List.Icon icon="book-outline" />} // Icon for each chapter
        />
      </TouchableRipple>
    );
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <View style={styles.container}>
          <GestureHandlerRootView>
            <ScrollView style={{ flexGrow: 1 }}>
              <FlatList
                data={toc} // Use toc directly from useReader
                keyExtractor={(item) => item.id} // Use the id for a unique key
                renderItem={renderChapterItem} // Render chapters and sub-chapters
              />
            </ScrollView>
          </GestureHandlerRootView>
          <Button onPress={onDismiss} mode="contained" style={styles.closeButton}>
            Close
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: MD3DarkTheme.colors.background,
    padding: 20,
    margin: 20,
    borderRadius: 8,
    height: '80%', // Explicitly setting the height of the modal
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  closeButton: {
    marginTop: 20,
  },
});

export default ChapterList;
