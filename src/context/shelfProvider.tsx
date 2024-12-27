import { StyleSheet } from 'react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShelfContext = createContext<any>(null);

export default function ShelfProvider({ children }: { children: React.ReactNode }) {
  const [finishedShelf, setFinishedShelf] = useState<any[]>([]);
  const [favouritesShelf, setFavouriteShelf] = useState<any[]>([]);

  // Fetch shelves from AsyncStorage
  useEffect(() => {
    const fetchShelves = async () => {
      try {
        const [finished, favourites] = await Promise.all([
          AsyncStorage.getItem('finished-shelf'),
          AsyncStorage.getItem('favourites-shelf'),
        ]);

        setFinishedShelf(finished ? JSON.parse(finished) : []);
        setFavouriteShelf(favourites ? JSON.parse(favourites) : []);
      } catch (error) {
        console.error(`Error fetching shelves: ${error}`);
      }
    };

    fetchShelves();
  }, []);

  // Add a book to Finished Shelf
  const addToFinishedShelf = async (item: any) => {
    if (!item?.filePath) return;

    // Check if the book already exists
    const alreadyExists = finishedShelf.some(book => book.filePath === item.filePath);
    if (alreadyExists) return;

    const updatedFinished = [...finishedShelf, item];

    try {
      await AsyncStorage.setItem('finished-shelf', JSON.stringify(updatedFinished));
      setFinishedShelf(updatedFinished);
    } catch (error) {
      console.error(`Error updating Finished Shelf: ${error}`);
    }
  };

  // Add a book to Favourites Shelf
  const addToFavouritesShelf = async (item: any) => {
    if (!item?.filePath){
      console.log("Not removed!! No file path found");
      return;
    }

    // Check if the book already exists
    const alreadyExists = favouritesShelf.some(book => book.filePath === item.filePath);
    if (alreadyExists) return;

    const updatedFavourites = [...favouritesShelf, item];

    try {
      await AsyncStorage.setItem('favourites-shelf', JSON.stringify(updatedFavourites));
      setFavouriteShelf(updatedFavourites);
    } catch (error) {
      console.error(`Error updating Favourites Shelf: ${error}`);
    }
  };

  // Remove a book from a specific shelf
  const removeFromShelf = async (item: any, shelf: 'favourites' | 'finished') => {
    if (!item?.filePath){
      console.log("Not removed!! No file path found");
      return;
    }
    const currentShelf = shelf === 'favourites' ? favouritesShelf : finishedShelf;
    const updatedShelf = currentShelf.filter(book => book.filePath !== item.filePath);

    try {
      await AsyncStorage.setItem(`${shelf}-shelf`, JSON.stringify(updatedShelf));

      if (shelf === 'favourites') setFavouriteShelf(updatedShelf);
      else setFinishedShelf(updatedShelf);
    } catch (error) {
      console.error(`Error removing from ${shelf} shelf: ${error}`);
    }
  };

  return (
    <ShelfContext.Provider
      value={{
        finishedShelf,
        favouritesShelf,
        addToFinishedShelf,
        addToFavouritesShelf,
        removeFromFavouritesShelf: (item: any) => removeFromShelf(item, 'favourites'),
        removeFromFinishedShelf: (item: any) => removeFromShelf(item, 'finished'),
      }}
    >
      {children}
    </ShelfContext.Provider>
  );
}

export const useShelfContext = () => {
  const context = useContext(ShelfContext);
  if (!context) throw new Error('useShelfContext must be used within a ShelfProvider');
  return context;
};
