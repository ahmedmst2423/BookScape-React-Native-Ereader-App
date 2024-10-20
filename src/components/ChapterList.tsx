import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Modal, Portal, List, TouchableRipple, Button } from 'react-native-paper';
import { useReader } from '@epubjs-react-native/core';

type ChapterListProps = {
  visible: boolean;
  onDismiss: () => void;
};

const ChapterList: React.FC<ChapterListProps> = ({ visible, onDismiss }) => {
  const { toc, goToLocation } = useReader(); // Access reader's Table of Contents (toc) and goToLocation method

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
          <FlatList
            data={item.subitems}
            keyExtractor={(subitem, index) => subitem.id || index.toString()}
            renderItem={({ item: subitem }) => (
              <TouchableRipple
                onPress={() => {
                  goToLocation(subitem.href); // Navigate to sub-chapter on press
                  onDismiss(); // Close modal after selection
                }}
                rippleColor="rgba(0, 0, 0, .32)"
              >
                <List.Item
                  title={subitem.label.trim()} // Sub-chapter title
                  description={subitem.href} // Optional description
                  left={() => <List.Icon icon="subdirectory-arrow-right" />} // Icon for each sub-chapter
                />
              </TouchableRipple>
            )}
          />
        </List.Accordion>
      );
    }

    // Render normal List.Item for chapters without subitems
    return (
      <TouchableRipple
        onPress={() => {
          goToLocation(item.href); // Navigate to chapter on press
          onDismiss(); // Close modal after selection
        }}
        rippleColor="rgba(0, 0, 0, .32)"
      >
        <List.Item
          title={item.label.trim()} // Chapter title
          description={item.href} // Optional description
          left={() => <List.Icon icon="book-outline" />} // Icon for each chapter
        />
      </TouchableRipple>
    );
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <View style={styles.container}>
          <FlatList
            data={toc} // Use toc directly from useReader
            keyExtractor={(item) => item.id} // Use the id for a unique key
            renderItem={renderChapterItem} // Render chapters and sub-chapters
          />
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
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  container: {
    flex: 1,
  },
  closeButton: {
    marginTop: 20,
  },
});

export default ChapterList;
