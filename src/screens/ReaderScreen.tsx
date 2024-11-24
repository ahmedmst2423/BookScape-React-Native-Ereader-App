import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, useWindowDimensions, View, Text, Alert, LogBox } from 'react-native';
import { Reader, useReader, Themes } from '@epubjs-react-native/core';
import { ProgressBar } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { findBookInDirectory } from '../utilities/fileUtilities'; // Custom utility functions
import { useFileSystem } from '@epubjs-react-native/file-system';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import SettingsModal from '../components/SettingsModal';
import ChapterList from '../components/ChapterList';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'ReaderScreen'>;
LogBox.ignoreLogs(['Warning: ...']);  // Add specific warning text to ignore

// Disable all warnings
LogBox.ignoreAllLogs();

const ReaderScreen = () => {
  const { width, height } = useWindowDimensions();
  const route = useRoute<ReaderScreenRouteProp>();
  const { bookName,bookPath } = route.params;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [chapterListVisible,setChapterListVisible] = useState<boolean>(false);
  const { getMeta,goNext,goPrevious } = useReader(); // Hook to control the reader
  const [chapters,setChapters] = useState<any[]>([]);


  const saveMetadata = useCallback(async (uri: string, metadata:any): Promise<void> => {
 
    try {
      await AsyncStorage.setItem(`metadata_${uri}`, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }, []);

  useEffect(() => {
    const loadBook = async () => {
      setLoading(true);
      try {
        const uri = await findBookInDirectory(bookName);
        if (uri) {
          setFileUri(uri);
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

  const handleGestureEvent = (event: any) => {
    'worklet';
    const { translationX, translationY } = event.nativeEvent;

    if (translationY < -100) {
      // Detect swipe up
      setModalVisible(true); // Show the modal
    } else if (translationY > 100) {
      // Detect swipe down
      setChapterListVisible(true); // Show the modal
    } 

  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading && (
        <View style={{ padding: 20 }}>
          <ProgressBar indeterminate color="blue" style={{ height: 10 }} />
          <Text style={{ marginTop: 10 }}>Loading EPUB file...</Text>
        </View>
      )}

      {!loading && fileUri && (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PanGestureHandler onGestureEvent={handleGestureEvent}>
            <View style={{ flex: 1 }}>
              <Reader
                
                src={fileUri}
                width={width}
                height={height}
                fileSystem={useFileSystem}
               
                onReady={()=>{ 
                  const metaData = getMeta();
                  saveMetadata(bookPath,metaData)}}
                 
                
  
                defaultTheme={Themes.DARK} // Initial theme
              />
            </View>
          </PanGestureHandler>

          {/* Modal for changing font, theme, and chapters */}
          <SettingsModal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}/>
            <ChapterList
            visible = {chapterListVisible}
            onDismiss={()=>setChapterListVisible(false)}
           
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

export default ReaderScreen;
