import { ePubCfi, Location } from "@epubjs-react-native/core";

export interface FileMetadata {
    title: string;
    author: string;
    cover: string
    progress:string;
    location:Location | null;
  }
  
export interface MetadataCache {
    [key: string]: FileMetadata;
  }
  
export type BookDetailsParams = {
    BookDetails: {
      bookData: {
        success: boolean;
        data?: {
          title: string;
          author: string;
          publishDate?: string;
          publisher?: string;
          isbn?: string;
          pages?: number;
          subjects?: string[];
          coverUrl?: string;
          description?: string;
        };
        error?: string;
      };
    };
  };
  