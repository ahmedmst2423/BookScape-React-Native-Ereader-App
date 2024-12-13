import axios from 'axios';
import RNFS from 'react-native-fs';

// Define the function type
type UseUiVisionOCR = (imageUri: string, apiKey: string) => Promise<string | null>;

// Main OCR function
const useUiVisionOCR: UseUiVisionOCR = async (imageUri, apiKey) => {
  try {
    // Convert image to base64
    const base64Image: string = await convertImageToBase64(imageUri);

    // Get file extension (assuming the image URI includes an extension)
    const fileType = getFileExtension(imageUri);

    // API Request Payload
    const data: { apiKey: string; file: string; language: string; filetype: string } = {
      apiKey, // Your API key
      file: base64Image, // Base64-encoded image
      language: "eng", // Language code (e.g., 'eng' for English)
      filetype: "JPEG", // Explicitly set file type (e.g., jpg, png)
    };

    // API Endpoint
    const apiUrl: string = "https://api.ocr.space/parse/image";

    // Make POST request to the OCR API
    const response = await axios.post<OCRResponse>(apiUrl, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Handle the response
    if (response.data.IsErroredOnProcessing) {
      console.error("Error in OCR processing:", response.data.ErrorMessage);
      return null;
    }

    // Return parsed text
    return response.data.ParsedResults[0].ParsedText || null;
  } catch (error) {
    console.error("OCR API error:", error);
    return null;
  }
};

// Helper function to convert image to base64
const convertImageToBase64 = (imageUri: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    RNFS.readFile(imageUri, 'base64')
      .then((base64: string) => resolve(base64))
      .catch((error: Error) => reject(error));
  });
};

// Helper function to extract file extension
const getFileExtension = (filePath: string): string => {
  const extension = filePath.split('.').pop();
  return extension ? extension.toLowerCase() : "jpg"; // Default to jpg if no extension is found
};

// Define response types from the OCR API
interface OCRResponse {
  ParsedResults: {
    ParsedText: string;
  }[];
  IsErroredOnProcessing: boolean;
  ErrorMessage: string | null;
}

export default useUiVisionOCR;
