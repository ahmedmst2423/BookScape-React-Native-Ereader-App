import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { BottomNavigation, PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Add AsyncStorage
import HomeScreen from './src/screens/HomePage';
import BookShelf from './src/screens/BookShelf';
import ReaderScreen from './src/screens/ReaderScreen';
import * as ScopedStorage from 'react-native-scoped-storage';
import { ReaderProvider } from '@epubjs-react-native/core';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import ChapterList from './src/components/ChapterList';
import BookScanner from './src/screens/BookScanner';
import BookStoreMap from './src/screens/BookStoreMap';
import ScannedDetails from './src/screens/ScannedDetails';
// Ignore specific warning messages:
LogBox.ignoreLogs([
  'Warning: ...', // Example warning to suppress
  'Require cycle:', // Example warning to suppress
]);

// Suppress all yellow box warnings in development mode


export type RootStackParamList = {
  HomeScreen: undefined;
  BottomTabs: undefined;
  ReaderScreen: { bookPath: string; bookName: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const BottomTabs = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'Home', title: 'Home', focusedIcon: 'book', unfocusedIcon: 'book-outline' },
    { key: 'Shelf', title: 'Shelf', focusedIcon: 'bookshelf' },
    { key: 'BookScanner', title: 'Book Scanner', focusedIcon: 'camera' },
    {key:'BookStoreMap', title:'Book Stores Nearby', focusedIcon:'map'}
  ]);

  const HomeScreenRoute = () => <HomeScreen />;
  const ShelfRoute = () => <BookShelf />;
  const ScannerRoute = ()=><BookScanner/>
  const mapRoute = ()=><BookStoreMap/>

  const renderScene = BottomNavigation.SceneMap({
    Home: HomeScreenRoute,
    Shelf: ShelfRoute,
    BookScanner:ScannerRoute,
    BookStoreMap:mapRoute
    
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{
       maxHeight:100,
       minHeight:50, // Adjust the height to your preference
        // Optional: Change the background color
      }}
    />
  );
};

const App = () => {
  const [storagePermissionGranted, setStoragePermissionGranted] = useState(false);

  // Function to request storage permission and store URI in AsyncStorage
  const requestStoragePermission = async () => {
    try {
      const dir = await ScopedStorage.openDocumentTree(true);
      if (dir) {
        await AsyncStorage.setItem('scopedStorageUri', dir.uri); // Store the directory URI
        setStoragePermissionGranted(true); // Set permission status to true
      } else {
        throw new Error('Directory access was denied');
      }
    } catch (err) {
      Alert.alert('Error', 'Error accessing the folder or loading the files');
      console.error('Error accessing the folder or loading the files:', err);
    }
  };

  // Function to check if directory URI is already saved in AsyncStorage
  const checkForSavedDirectory = async () => {
    try {
      const savedUri = await AsyncStorage.getItem('scopedStorageUri');
      if (savedUri) {
        setStoragePermissionGranted(true); // Set permission to true if URI is found
        console.log('Found saved directory URI:', savedUri);
      } else {
        requestStoragePermission(); // Request permission if no URI found
      }
    } catch (err) {
      console.error('Error checking saved directory URI:', err);
    }
  };

  useEffect(() => {
    checkForSavedDirectory(); // Check for the saved directory when the app starts
  }, []);

  return (
  

    <ReaderProvider>
    <PaperProvider theme={MD3DarkTheme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="BottomTabs">
          <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ReaderScreen" component={ReaderScreen} options={{ headerShown:false }} />
          {/* <Stack.Screen name="ScannedDetails" component={ScannedDetails} options={{ headerShown:false }} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
    </ReaderProvider>
  );
};

export default App;
