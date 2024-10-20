import React, { useEffect, useState } from 'react';
import { SafeAreaView, useWindowDimensions, View, Text, Alert } from 'react-native';
import { Reader, useReader, Themes } from '@epubjs-react-native/core';
import { ProgressBar } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { findBookInDirectory } from '../utilities/fileUtilities'; // Custom utility functions
import { useFileSystem } from '@epubjs-react-native/file-system';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import SettingsModal from '../components/SettingsModal';
import ChapterList from '../components/ChapterList';

type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'ReaderScreen'>;

const ReaderScreen = () => {
  const { width, height } = useWindowDimensions();
  const route = useRoute<ReaderScreenRouteProp>();
  const { bookName } = route.params;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [chapterListVisible,setChapterListVisible] = useState<boolean>(false);
  const { goToLocation,getLocations,changeFontFamily, changeTheme } = useReader(); // Hook to control the reader
  const [chapters,setChapters] = useState<any[]>([])

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
    if (event.nativeEvent.translationY < -100) { // Detect swipe up
      setModalVisible(true); // Show the modal
    }
    else if (event.nativeEvent.translationY > 100) { // Detect swipe down
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
                waitForLocationsReady = {true}
                onLocationsReady={()=>{setChapters((prevState)=>getLocations())}} 
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
