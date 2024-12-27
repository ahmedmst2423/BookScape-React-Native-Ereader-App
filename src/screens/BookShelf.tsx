import React, { useCallback, useMemo } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  Surface,
  useTheme,
  Avatar,
  IconButton,
  List,
  ProgressBar,
  MD3Colors,
} from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useShelfContext } from '../context/shelfProvider';
import { RootStackParamList } from '../../App';
import { ScrollView } from 'react-native-gesture-handler';

const BookShelf = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const {
    finishedShelf,
    favouritesShelf,
    removeFromFavouritesShelf,
    removeFromFinishedShelf
  } = useShelfContext();

  const openReader = useCallback((contentUri: string, fileName: string) => {
    if (!contentUri || !fileName) return;
    navigation.navigate('ReaderScreen', { bookPath: contentUri, bookName: fileName });
  }, [navigation]);

  const renderBookCard = useCallback((item: any, removeFunction: (item: any) => void) => {
    if (!item) return null;

    return (
      <Card mode="elevated" style={styles.card} onPress={() => openReader(item.filePath, item.fileName)}>
        <Card.Content style={styles.cardContent}>
          {item?.cover ? (
            <Card.Cover source={{ uri: item.cover }} style={styles.coverImage} />
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
            <Text variant="titleMedium" numberOfLines={2}>{item?.title || 'Unknown Title'}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
              {item?.author || 'Unknown Author'}
            </Text>
            <View>
              <ProgressBar progress={((item?.progress) || 0)/100} color={MD3Colors.error50} />
            </View>
            <View style={styles.actions}>
              <IconButton icon="delete" size={20} onPress={() => removeFunction(item)} />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }, [theme.colors, openReader]);

  const EmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Avatar.Icon size={80} icon="bookshelf" style={{ backgroundColor: theme.colors.surfaceVariant }} />
      <Text variant="headlineSmall" style={styles.emptyText}>No Books in Shelves</Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        Add books to your shelves
      </Text>
    </View>
  ), [theme.colors]);

  if (!Array.isArray(finishedShelf) && !Array.isArray(favouritesShelf)) {
    return EmptyComponent;
  }

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView>

      <List.AccordionGroup>
        <List.Accordion
          id="finished"
          title="Finished Books"
          left={props => <List.Icon {...props} icon="book-check" />}
          >
          {Array.isArray(finishedShelf) && finishedShelf.length > 0 ? (
              finishedShelf.map(item => (
                  <List.Item
                  key={item?.filePath || Math.random()}
                  title={() => renderBookCard(item, removeFromFinishedShelf)}
                  />
                ))
            ) : (
                <List.Item title="No finished books" />
            )}
        </List.Accordion>

        <List.Accordion
          id="favourites"
          title="Favourite Books"
          left={props => <List.Icon {...props} icon="star" />}
          >
          {Array.isArray(favouritesShelf) && favouritesShelf.length > 0 ? (
              favouritesShelf.map(item => (
                  <List.Item
                  key={item?.filePath || Math.random()}
                  title={() => renderBookCard(item, removeFromFavouritesShelf)}
                  />
                ))
            ) : (
                <List.Item title="No favourite books" />
            )}
        </List.Accordion>
      </List.AccordionGroup>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default BookShelf;