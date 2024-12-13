
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';



// Supabase Client Setup
const SUPABASE_URL = 'https://ptgzoccrdneugwgrnvzh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Z3pvY2NyZG5ldWd3Z3JudnpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwODM0ODMsImV4cCI6MjA0OTY1OTQ4M30.qLZB0szFc2myokxfnRjceSwYPw2LshlQ6MYArNNWokY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    detectSessionInUrl: false,
  },
});

export const uploadFile = async (base64String:string, fileName:string) => {
  try {
    const binaryData = Uint8Array.from(atob(base64String), char => char.charCodeAt(0));

    const { data, error } = await supabase.storage.from('OCR Files').upload(fileName, binaryData.buffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.error('Supabase Upload Error:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from('OCR Files').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error during file upload:', error);
    return null;
  }
};