import axios from 'axios';

// Replace this with your actual API key from Google Cloud




interface OCRResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
      locale?: string;
    }>;
    error?: {
      message: string;
      code: number;
    };
  }>;
}

const useGoogleCloudOCR = async (imageInput: string) => {
  try {
    const API_KEY = process.env.VISION_API_KEY;
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

   
    // Determine if the input is a URL or base64
    const isUrl = imageInput.startsWith('http') || imageInput.startsWith('https');
    
    const requestBody = {
      requests: [{
        image: isUrl 
          ? { source: { imageUri: imageInput } }
          : { content: imageInput.replace(/^data:image\/\w+;base64,/, '') },
        features: [{
          type: 'TEXT_DETECTION',
          maxResults: 1
        }],
        imageContext: {
          languageHints: ['en'] // Add other languages if needed
        }
      }]
    };

    const response = await axios.post<OCRResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.data.responses[0]?.error) {
      throw new Error(response.data.responses[0].error.message);
    }

    const detections = response.data.responses[0]?.textAnnotations;
    
    if (!detections || detections.length === 0) {
      console.log('No text detected in the image');
      return null;
    }

    const detectedText = detections[0].description;
    console.log('Detected text:', detectedText);
    return detectedText;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(`OCR API Error: ${error.response?.data?.error?.message || error.message}`);
    }
    console.error('Error during text detection:', error);
    throw error;
  }
};

export default useGoogleCloudOCR;