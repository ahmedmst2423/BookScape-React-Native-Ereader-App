import { useEffect, useState } from "react";
import { Appbar, PaperProvider, Button, Snackbar } from 'react-native-paper'; // Import Button from React Native Paper
import { SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import RNFS from 'react-native-fs';
import * as ScopedStorage from 'react-native-scoped-storage';
import ReaderScreen from "./ReaderScreen";

const HomeScreen = () => {
  const navigation = useNavigation(); // Hook to access the navigation prop
  const [fileName, setFileName] = useState('book1.epub');
  const [fileUri, setFileUri] = useState<string>('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

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
  const ReaderScreenRoute = ()=> {return (<ReaderScreen folderName = {fileUri}></ReaderScreen>)};

  const requestPermission = async () => {
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
      } else {
        throw new Error('Error copying file to temporary location');
      }
    } catch (err) {
      Alert.alert('Error', 'Error accessing the folder or loading the file');
      console.error('Error accessing the folder or loading the file:', err);
      setSnackbarVisible(true); // Show snackbar for error
    }
  };

  useEffect(() => {
    const getPermission = async () => {
      await requestPermission();
    };
    getPermission();
  }, []);

  const navigateToReader = () => {
   
  };

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button mode="contained" onPress={()=>{
             if (fileUri) {
                navigation.navigate(ReaderScreenRoute); // Pass fileUri as a parameter
              } else {
                setSnackbarVisible(true); // Show snackbar if fileUri is not available
              }
        }} disabled={!fileUri}>
          Open Reader
        </Button>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {fileUri ? 'File is ready to read!' : 'No file found. Please check the directory.'}
        </Snackbar>
      </SafeAreaView>
    </PaperProvider>
  );
};

export default HomeScreen;
