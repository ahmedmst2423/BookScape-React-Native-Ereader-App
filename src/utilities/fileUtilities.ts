// fileUtilities.ts
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScopedStorage from 'react-native-scoped-storage';

// Function to copy the content:// file to a file:// URI and save it in AsyncStorage
export const copyFileToDirectory = async (contentUri: string, bookName: string): Promise<string | null> => {
  const dirPath = `${RNFS.DocumentDirectoryPath}/EPUBs`; // Directory for storing EPUBs
  const filePath = `${dirPath}/${bookName}`; // Full file path

  try {
    const dirExists = await RNFS.exists(dirPath);
    if (!dirExists) {
      await RNFS.mkdir(dirPath); // Create directory if it doesn't exist
    }

    const fileData = await ScopedStorage.readFile(contentUri, 'base64'); // Read file content as base64
    await RNFS.writeFile(filePath, fileData, 'base64'); // Write the file to the desired path

    await AsyncStorage.setItem(bookName, `file://${filePath}`); // Save file path to AsyncStorage
    return `file://${filePath}`; // Return the file URI
  } catch (error) {
    console.error('Error copying file to custom directory:', error);
    return null; // Return null on error
  }
};

// Function to find and copy the book to the documents directory
export const findBookInDirectory = async (bookName: string): Promise<string | null> => {
  try {
    // Check if the file path is already stored in AsyncStorage
    const storedFilePath = await AsyncStorage.getItem(bookName);
    if (storedFilePath) {
      return storedFilePath; // Return the stored file path
    }

    const savedUri = await AsyncStorage.getItem('scopedStorageUri');
    if (!savedUri) {
      throw new Error('No saved directory found.');
    }

    const files = await ScopedStorage.listFiles(savedUri); // List all files in the directory
    const bookFile = files.find(file => file.name === bookName); // Find the book by name

    if (bookFile && bookFile.uri) {
      // Copy the book file to the local documents directory
      const fileUri = await copyFileToDirectory(bookFile.uri, bookName);
      return fileUri; // Return the new file URI
    } else {
      throw new Error(`Book "${bookName}" not found in the selected directory.`);
    }
  } catch (error) {
    console.error('Error accessing the folder or loading the files:', error);
    return null;
  }
};
