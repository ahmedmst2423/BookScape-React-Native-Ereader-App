import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNFS from 'react-native-fs';

// Supabase Client Setup
const SUPABASE_URL = 'https://ptgzoccrdneugwgrnvzh.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Z3pvY2NyZG5ldWd3Z3JudnpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwODM0ODMsImV4cCI6MjA0OTY1OTQ4M30.qLZB0szFc2myokxfnRjceSwYPw2LshlQ6MYArNNWokY'; // Replace with your Supabase API Key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    detectSessionInUrl: false,
  },
});

export const uploadFile = async (filePath: string, fileName: string): Promise<string | null> => {
  try {
    // Read the file as a base64 string
    const fileContent = await RNFS.readFile(filePath, 'base64');

    // Convert base64 to Blob
    const blob = await fetch(`data:image/jpeg;base64,${fileContent}`).then(r => r.blob());

    // Upload the file to the 'uploads' bucket
    const { data, error } = await supabase.storage.from('OCR Files').upload(fileName, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false, // Prevent overwriting existing files
    });

    if (error) {
      console.error('Supabase Upload Error:', error.message);
      return null;
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage.from('OCR Files').getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    console.log('Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error during file upload:', error);
    return null;
  }
};