import { useEffect, useState } from "react";
import { Appbar, PaperProvider, BottomNavigation } from 'react-native-paper';
import { LogBox, SafeAreaView ,Alert,PermissionsAndroid,Platform} from 'react-native';
import HomeScreen from "./src/screens/HomePage";
import BookShelf from "./src/screens/BookShelf";
import ReaderScreen from "./src/screens/ReaderScreen";
import { check, requestMultiple, PERMISSIONS, RESULTS ,request} from 'react-native-permissions';
import { ReaderProvider } from "@epubjs-react-native/core";



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
LogBox.ignoreLogs(['Warning: ...']);
const App = () => {
  return (
    <PaperProvider>
    <ReaderProvider>
    <ReaderScreen />
    </ReaderProvider>
    </PaperProvider>
  );
};

export default App;

