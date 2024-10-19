import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { BottomNavigation, PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomePage';
import BookShelf from './src/screens/BookShelf';
import ReaderScreen from './src/screens/ReaderScreen';

// Define your Stack Navigator types
export type RootStackParamList = {
  HomeScreen: undefined;
  BottomTabs:undefined;
  ReaderScreen: { bookPath: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const BottomTabs = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'Home', title: 'Home', focusedIcon: 'book', unfocusedIcon: 'book-outline' },
    { key: 'Shelf', title: 'Shelf', focusedIcon: 'bookshelf' },
  ]);

  const HomeScreenRoute = () => <HomeScreen />;
  const ShelfRoute = () => <BookShelf />;

  const renderScene = BottomNavigation.SceneMap({
    Home: HomeScreenRoute,
    Shelf: ShelfRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="BottomTabs">
          <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ReaderScreen" component={ReaderScreen} options={{ title: 'Read Book' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
