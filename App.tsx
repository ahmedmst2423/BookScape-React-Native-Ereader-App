import { useEffect, useState } from "react";
import { Appbar, PaperProvider, BottomNavigation, Text } from 'react-native-paper';
import { LogBox, SafeAreaView ,Alert,PermissionsAndroid,Platform} from 'react-native';
import HomeScreen from "./src/screens/HomePage";
import BookShelf from "./src/screens/BookShelf";
import ReaderScreen from "./src/screens/ReaderScreen";
import { check, requestMultiple, PERMISSIONS, RESULTS ,request} from 'react-native-permissions';
import { ReaderProvider } from "@epubjs-react-native/core";
import RNFS from 'react-native-fs';
import * as ScopedStorage from 'react-native-scoped-storage';




/*
const App = () => {
  // Define routes
  const HomeScreenRoute = () => <HomeScreen />;
  const ShelfRoute = () => <BookShelf />;
  useEffect(() => {
    LogBox.ignoreLogs([
      'Warning: A props object containing a "key" prop is being spread into JSX',
    ]);
  }, []);

  // Set up bottom navigation routes and index
  const [routes] = useState([
    { key: 'Home', title: 'Home', focusedIcon: 'book', unfocusedIcon: 'book-outline'  }, // Ensure valid icons
    { key: 'Shelf', title: 'Shelf', focusedIcon: 'bookshelf'}, // Fallback if "bookshelf" doesn't exist
  ]);

  const [index, setIndex] = useState(0);

  // Render the scenes associated with each route
  const renderScene = BottomNavigation.SceneMap({
    Home: HomeScreenRoute,
    Shelf: ShelfRoute,
  });

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1 }}>
        
        
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
        />
      </SafeAreaView>
    </PaperProvider>
  );
};

export default App;
*/

//Using Reader
LogBox.ignoreAllLogs(true);
const App = () => {
  const [folderPath,setFolderPath] = useState('');
  const [fileName,setFileName] = useState('book1.epub');
  const [folderAccessed,setFolderAccessed] = useState<Boolean>(false);
  const [fileUri, setFileUri] = useState<string>('');


  const copyFileToTemp = async (contentUri: string) => {
    try {
      const tempPath = `${RNFS.TemporaryDirectoryPath}/book1.epub`; // Path to save the file in the temp directory
      await RNFS.copyFile(contentUri, tempPath); // Copy the file from contentUri to tempPath
      return `file://${tempPath}`; // Return the file:// path
    } catch (error) {
      console.error('Failed to copy file to temp directory', error);
      return null;
    }
  };

  const requestPermission = async () => {
    

    if (folderAccessed) {
      // If folder has already been accessed, do not ask again
      console.log('Folder access already granted. Proceeding to load the file.');
      return;
    }

    try {
      let dir = await ScopedStorage.openDocumentTree(true); // User selects the directory
      if (!dir) {
        throw new Error('Directory access was denied');
      }

      const files = await ScopedStorage.listFiles(dir.uri);
      const epubFile = files.find(file => file.name === fileName);

      if (!epubFile) {
        throw new Error(`The EPUB file ${fileName} was not found in the selected directory.`);
      }

      // Copy the file to a temporary location and get the file:// URI
      const tempFileUri = await copyFileToTemp(epubFile.uri);

      if (tempFileUri) {
        setFileUri(tempFileUri);
        console.log('File copied to:', tempFileUri);
        setFolderAccessed(true); // Mark folder as accessed
      } else {
        throw new Error('Error copying file to temporary location');
      }
    } catch (err) {
      Alert.alert('Error', 'Error accessing the folder or loading the file');
      console.error('Error accessing the folder or loading the file:', err);
     
    }
  };

  useEffect(()=>{
    const getPermission = async ()=>{
      await requestPermission();
    }
    getPermission();
  }

  ,[])

  return (
    <PaperProvider>
    <ReaderProvider>
      {fileUri ? (
        <ReaderScreen folderName={fileUri} /> // Render ReaderScreen if fileUri is available
      ) : (
        <Text>No file loaded. Please check the directory.</Text> // Message when fileUri is not available
      )}
    </ReaderProvider>
  </PaperProvider>
  );
};

export default App;

