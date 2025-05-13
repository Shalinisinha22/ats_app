import axios from 'axios';
import { Platform } from 'react-native';

const CLOUD_NAME = 'dd4fdmtmj';
const UPLOAD_PRESET = 'user_uploads';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  original_filename: string;
}

export const uploadToCloudinary = async (fileUri: string, resourceType: 'image' | 'raw'): Promise<CloudinaryResponse> => {
  try {
    const formData = new FormData();
    
    // Create file object
    const filename = fileUri.split('/').pop() || 'file';
    const match = /\.(\w+)$/.exec(filename);
    const type = resourceType === 'raw' ? 'application/pdf' : 'image/jpeg';

    const file = {
      uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
      type: type,
      name: filename,
    };

    formData.append('file', file as any);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);
    formData.append('resource_type', resourceType); // Explicitly set resource_type

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
    
    console.log('Uploading to:', url);
    console.log('File details:', { filename, type, resourceType });

    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      secure_url: response.data.secure_url,
      public_id: response.data.public_id,
      resource_type: response.data.resource_type,
      format: response.data.format || 'pdf',
      original_filename: response.data.original_filename
    };

  } catch (error: any) {
    console.error('Cloudinary upload error details:', {
      message: error.message,
      response: error.response?.data,
    });
    throw error;
  }
};

// Helper function to get viewable URL
export const getViewableUrl = (secureUrl: string, resourceType: 'image' | 'raw'): string => {
  if (resourceType === 'raw') {
    // Force PDF viewing for documents
    return `https://docs.google.com/viewer?url=${encodeURIComponent(secureUrl)}`;
  }
  return secureUrl;
};