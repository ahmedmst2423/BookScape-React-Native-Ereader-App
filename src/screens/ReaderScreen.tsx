import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, useWindowDimensions, View, Alert, LogBox, StyleSheet } from 'react-native';
import { Reader, useReader, Themes, ePubCfi } from '@epubjs-react-native/core';
import { ProgressBar, Text } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { findBookInDirectory } from '../utilities/fileUtilities';
import { useFileSystem } from '@epubjs-react-native/file-system';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import SettingsModal from '../components/SettingsModal';
import ChapterList from '../components/ChapterList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import darkTheme from '../styles/darkTheme';

type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'ReaderScreen'>;
LogBox.ignoreAllLogs();

const ReaderScreen = ({ folderName }: any) => {
  const { width, height } = useWindowDimensions();
  const route = useRoute<ReaderScreenRouteProp>();
  const { bookName, bookPath } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [chapterListVisible, setChapterListVisible] = useState<boolean>(false);
  const { getMeta, getCurrentLocation, getLocations, progress, changeFontSize, goToLocation } = useReader();
  const [currentLoc, setCurrentLoc] = useState<any>(null);
  const [totalLocs, setTotalLocs] = useState<number>(0);
  const [fontSize,setFontSize] = useState<number>(16);
  const [savedLocation, setSavedLocation] = useState<string | null>(null);

  const saveMetadata = useCallback(async (uri: string, metadata: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(`metadata_${uri}`, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }, []);

  const loadSavedLocation = async () => {
    try {
      const savedMetadata = await AsyncStorage.getItem(`metadata_${bookPath}`);
      if (savedMetadata) {
        const metadata = JSON.parse(savedMetadata);
        if (metadata.currentLocation) {
          setSavedLocation(metadata.currentLocation);
          return metadata.currentLocation;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading saved location:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadBook = async () => {
      setLoading(true);
      try {
        const uri = await findBookInDirectory(bookName);
        if (uri) {
          setFileUri(uri);
          await loadSavedLocation();
        } else {
          Alert.alert('Error', `Failed to load the book: ${bookName}`);
        }
      } catch (error) {
        Alert.alert('Error', 'There was an error loading the book.');
      } finally {
        setLoading(false);
      }
    };

   


    loadBook();
    
  }, [bookName]);

  useEffect(()=>{
    const loadFontSize = async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem('font-size');
        if (savedFontSize) {
          const size = parseInt(savedFontSize, 10);
          setFontSize(size);
         
          
        }
      } catch (error) {
        console.error('Error loading font size:', error);
      }
    };
    loadFontSize();
    
  },[])

  const handleGestureEvent = (event: any) => {
    'worklet';
    const { translationY } = event.nativeEvent;
    if (translationY < -100) {
      setModalVisible(true);
    } else if (translationY > 100) {
      setChapterListVisible(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!loading && fileUri && (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PanGestureHandler onGestureEvent={handleGestureEvent}>
            <View style={{ flex: 1 }}>
              <Reader
                src={fileUri}
                width={width}
                height={height - 30}
                fileSystem={useFileSystem}
                waitForLocationsReady={true}
                onReady={async () => {
                  const metaData = getMeta();
                  const locations = getLocations();
                  const currentLocation = getCurrentLocation();
                  const savedLoc = await loadSavedLocation();
                  
                  if (savedLoc) {
                    console.log("Going to saved Location");
                    goToLocation(savedLoc);
                  }
                  
                  setTotalLocs(locations?.length || 0);
                  saveMetadata(bookPath, {
                    ...metaData,
                    currentLocation: savedLoc || currentLocation?.start?.cfi || locations[0],
                    totalLocations: locations?.length || 0,
                    locations: locations
                  });
                }}
                onLocationChange={() => {
                  const location = getCurrentLocation();
                  const locations = getLocations();
                  const metaData = getMeta();
                  setCurrentLoc(location);
                  setTotalLocs(locations?.length || 0);
                  
                  saveMetadata(bookPath, {
                    ...metaData,
                    currentLocation: location?.start?.cfi,
                    totalLocations: locations?.length || 0,
                    progress: progress,
                    locations: locations
                  });
                }}
                defaultTheme={darkTheme}
              />
              <View style={styles.progressContainer}>
                <Text variant="bodySmall" style={styles.progressText}>
                  {Math.round((progress || 0))}%
                </Text>
              </View>
            </View>
          </PanGestureHandler>

          <SettingsModal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
          />
          <ChapterList
            bookUri={bookPath}
            visible={chapterListVisible}
            onDismiss={() => setChapterListVisible(false)}
          />
        </GestureHandlerRootView>
      )}

      {!fileUri && !loading && (
        <View style={{ padding: 20 }}>
          <Text>No EPUB file available. Please provide a valid book path.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  progressText: {
    color: 'grey',
  }
});

export default ReaderScreen;