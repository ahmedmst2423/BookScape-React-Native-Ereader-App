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
  