// Import the Google Cloud client libraries
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient();

 const useGoogleCloudOCR = async (imageUri:any) => {
  try {
    // Check if imageUri is a valid GCS URL or not (e.g., 'gs://my-bucket/my-image.jpg')
    if (!imageUri.startsWith('gs://')) {
      console.error('Invalid GCS URL');
      return null;
    }

    // Perform text detection on the GCS image file
    const [result] = await client.textDetection(imageUri);
    const detections = result.textAnnotations;
    
    // Check if text was detected and return the detected text
    if (detections.length > 0) {
      console.log('Text detected:', detections[0].description);
      return detections[0].description;
    } else {
      console.log('No text detected in the image');
      return null;
    }
  } catch (error) {
    console.error('Error during OCR processing:', error);
    return null;
  }
};

export default useGoogleCloudOCR;

