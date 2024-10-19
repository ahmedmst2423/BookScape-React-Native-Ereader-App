import * as ScopedStorage from 'react-native-scoped-storage';

const useScopedFileSystem = () => {
  return {
    // Fetch the content from content:// URI as base64
    async readFile(path: string) {
      if (path.startsWith('content://')) {
        try {
          const fileData = await ScopedStorage.readFile(path, 'base64');
          return fileData; // Return the base64 content
        } catch (error) {
          console.error('Error reading file from scoped storage:', error);
          return null;
        }
      } else {
        throw new Error("Invalid URI format");
      }
    },
  };
};
