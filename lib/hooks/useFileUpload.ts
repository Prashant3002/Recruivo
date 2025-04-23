import { useState } from 'react';

interface FileUploadOptions {
  // Configuration options for the upload
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
}

interface FileUploadReturn {
  // State values
  isUploading: boolean;
  error: string | null;
  progress: number;
  
  // File selection validation
  validateFile: (file: File) => { valid: boolean; error?: string };
  
  // Upload function (simulated for this demo)
  uploadFile: (file: File, path?: string) => Promise<{ url: string; fileName: string; fileSize: number; contentType: string }>;
}

/**
 * A custom hook to handle file uploads
 * This hook handles the client-side validation and upload preparation
 */
export function useFileUpload(options?: FileUploadOptions): FileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const defaultOptions: FileUploadOptions = {
    acceptedFileTypes: ['application/pdf'],
    maxSizeMB: 10, // 10MB max by default
    ...options
  };
  
  // Validate if a file meets the requirements
  const validateFile = (file: File) => {
    setError(null);
    
    // Check file type
    if (defaultOptions.acceptedFileTypes && defaultOptions.acceptedFileTypes.length > 0) {
      if (!defaultOptions.acceptedFileTypes.includes(file.type)) {
        const error = `File type not accepted. Please upload ${defaultOptions.acceptedFileTypes.join(', ')}`;
        setError(error);
        return { valid: false, error };
      }
    }
    
    // Check file size
    if (defaultOptions.maxSizeMB) {
      const maxSizeBytes = defaultOptions.maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const error = `File size too large. Maximum size is ${defaultOptions.maxSizeMB}MB`;
        setError(error);
        return { valid: false, error };
      }
    }
    
    return { valid: true };
  };
  
  // Handle file upload process
  const uploadFile = async (file: File, path = 'resumes'): Promise<{ url: string; fileName: string; fileSize: number; contentType: string }> => {
    console.log(`Starting file upload validation: ${file.name} (${file.size} bytes, ${file.type})`);
    const validation = validateFile(file);
    if (!validation.valid) {
      console.error(`File validation failed: ${validation.error}`);
      throw new Error(validation.error);
    }
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      console.log(`Preparing file for upload: ${file.name}`);
      
      // Simulate incremental progress
      const updateProgress = () => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          return newProgress;
        });
      };
      
      // Start progress updates
      const intervalId = setInterval(updateProgress, 300);
      
      // This is the actual file data that will be sent to the server
      // The server will handle the actual Google Drive upload
      const fileData = {
        url: URL.createObjectURL(file), // This is just a temporary local URL for reference
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type
      };
      
      // Clear the interval after file is ready
      clearInterval(intervalId);
      setProgress(100);
      
      console.log(`File prepared for upload: ${file.name}`);
      return fileData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during upload';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    isUploading,
    error,
    progress,
    validateFile,
    uploadFile
  };
} 