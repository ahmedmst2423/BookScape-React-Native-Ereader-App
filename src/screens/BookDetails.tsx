import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Image, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Text, Divider, Chip, ActivityIndicator, MD3Colors } from 'react-native-paper';
import searchBookFromOCR, { BookSearchResult } from '../utilities/searchBook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const BookDetailsScreen = ({ route }: any) => {
  const { ocrText } = route.params;
  const [bookData, setBookData] = useState<BookSearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      try {
        const response = await searchBookFromOCR(ocrText);
        if (response) {
          setBookData(response);
          if (response.data?.title) {
            await AsyncStorage.setItem(response.data.title, JSON.stringify(response));
          } else if (response.data?.isbn) {
            await AsyncStorage.setItem(response.data.isbn, JSON.stringify(response));
          }
        }
      } catch (error) {
        console.log(`error: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MD3Colors.primary50} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Finding your book...
        </Text>
      </View>
    );
  }

  if (!bookData?.success || !bookData.data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {bookData?.error || 'Unable to find book details'}
        </Text>
      </View>
    );
  }

  const {
    title,
    author,
    publishDate,
    publisher,
    isbn,
    pages,
    subjects,
    coverUrl,
    description,
  } = bookData.data;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.headerContainer}>
          <View style={styles.coverContainer}>
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderCover}>
                <Text style={styles.placeholderText}>No Cover Available</Text>
              </View>
            )}
          </View>

          <View style={styles.headerInfo}>
            <Title style={styles.title}>{title}</Title>
            <Text style={styles.author}>by {author}</Text>
          </View>
        </View>

        <Card.Content>
          <View style={styles.infoBox}>
            {publisher && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Publisher</Text>
                <Text style={styles.infoValue}>{publisher}</Text>
              </View>
            )}

            {publishDate && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Published</Text>
                <Text style={styles.infoValue}>{publishDate}</Text>
              </View>
            )}

            {pages && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Pages</Text>
                <Text style={styles.infoValue}>{pages}</Text>
              </View>
            )}

            {isbn && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>ISBN</Text>
                <Text style={styles.infoValue}>{isbn}</Text>
              </View>
            )}
          </View>

          {description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this Book</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          )}

          {subjects && subjects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subjects</Text>
              <View style={styles.subjectsContainer}>
                {subjects.map((subject: string, index: number) => (
                  <Chip
                    key={index}
                    style={styles.chip}
                    textStyle={styles.chipText}
                    mode="outlined"
                  >
                    {subject}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#f0f2f5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  coverImage: {
    width: width * 0.5,
    height: width * 0.75,
    borderRadius: 8,
    elevation: 4,
  },
  placeholderCover: {
    width: width * 0.5,
    height: width * 0.75,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#adb5bd',
    textAlign: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4a4a4a',
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chip: {
    margin: 4,
    backgroundColor: '#f0f2f5',
  },
  chipText: {
    fontSize: 12,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    color: MD3Colors.primary50,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BookDetailsScreen;