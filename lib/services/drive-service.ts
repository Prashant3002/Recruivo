import { google } from 'googleapis';
import path from 'path';
import { Readable } from 'stream';
import fs from 'fs';

// Extract folder ID from the URL
function extractFolderId(folderUrl: string): string {
  // Extract folder ID from URL
  const matches = folderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
  return matches ? matches[1] : folderUrl;
}

// Convert Buffer to Readable Stream
function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null); // Signal end of data
    }
  });
  return readable;
}

// Upload file to Google Drive
export async function uploadFileToDrive(fileBuffer: Buffer, fileName: string, mimeType: string) {
  try {
    // Get credentials path from environment
    const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
    console.log(`Using key file path: ${keyFilePath}`);
    
    // Resolve the absolute path to the key file
    const resolvedKeyPath = path.resolve(process.cwd(), keyFilePath);
    console.log(`Resolved key file path: ${resolvedKeyPath}`);
    
    // Check if the key file exists
    if (!fs.existsSync(resolvedKeyPath)) {
      console.error(`Service account key file not found at: ${resolvedKeyPath}`);
      throw new Error(`Service account key file not found at: ${resolvedKeyPath}`);
    }
    
    // Create a new auth client
    const auth = new google.auth.GoogleAuth({
      keyFile: resolvedKeyPath,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    
    // Create drive client
    const drive = google.drive({ version: 'v3', auth });
    
    // Get folder ID from env and extract if it's a URL
    const folderUrl = process.env.GOOGLE_DRIVE_RESUME_FOLDER_ID || '';
    console.log(`Using folder URL: ${folderUrl}`);
    
    const folderId = extractFolderId(folderUrl);
    console.log(`Extracted folder ID: ${folderId}`);
    
    if (!folderId) {
      throw new Error('Invalid Google Drive folder ID');
    }
    
    console.log(`Uploading file to Google Drive folder: ${folderId}`);
    
    // Convert buffer to stream for Google Drive API
    const fileStream = bufferToStream(fileBuffer);
    
    // Create file in Drive
    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}-${fileName}`,
        mimeType: mimeType,
        parents: [folderId]
      },
      media: {
        mimeType: mimeType,
        body: fileStream
      }
    });
    
    console.log(`File uploaded successfully, ID: ${response.data.id}`);
    
    // Make the file accessible (anyone with the link can view)
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    // Get the file's web content link
    const fileInfo = await drive.files.get({
      fileId: response.data.id!,
      fields: 'webContentLink,webViewLink'
    });
    
    // Return both links for different uses
    return {
      id: response.data.id,
      // Direct download link
      downloadUrl: fileInfo.data.webContentLink,
      // Web view link (for PDFs and other viewable files)
      viewUrl: fileInfo.data.webViewLink
    };
  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error);
    console.error('Error details:', error.message);
    
    if (error.response) {
      console.error('Google API error response:', error.response.data);
    }
    
    throw new Error(`Failed to upload file to Google Drive: ${error.message}`);
  }
} 