"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestResumePage() {
  const [resumeUrl, setResumeUrl] = useState("");
  const [normalizedUrl, setNormalizedUrl] = useState("");
  const [testUrls, setTestUrls] = useState([
    "https://drive.google.com/file/d/1abc123def456/view",
    "https://drive.google.com/open?id=1abc123def456",
    "https://docs.google.com/document/d/1abc123def456/edit",
    "https://drive.google.com/drive/folders/1abc123def456",
    "https://example.com/resume.pdf"
  ]);

  // Function to normalize resume URLs, especially Google Drive links
  const normalizeResumeUrl = (url: string): string => {
    try {
      // Check if it's a Google Drive URL
      if (url.includes('drive.google.com')) {
        // Format 1: https://drive.google.com/file/d/FILE_ID/view
        let fileIdMatch = url.match(/\/file\/d\/([^\/]+)/);
        
        // Format 2: https://drive.google.com/open?id=FILE_ID
        if (!fileIdMatch) {
          fileIdMatch = url.match(/[?&]id=([^&]+)/);
        }
        
        // Format 3: https://docs.google.com/document/d/FILE_ID/edit
        if (!fileIdMatch) {
          fileIdMatch = url.match(/\/document\/d\/([^\/]+)/);
        }
        
        // If we found a file ID, construct a properly formatted URL
        if (fileIdMatch && fileIdMatch[1]) {
          const fileId = fileIdMatch[1];
          console.log("Extracted Google Drive file ID:", fileId);
          
          // If it's a document link
          if (url.includes('docs.google.com/document')) {
            return `https://docs.google.com/document/d/${fileId}/view`;
          }
          
          // Default to file viewer
          return `https://drive.google.com/file/d/${fileId}/view`;
        }
        
        // For Google Drive folders
        if (url.includes('/folders/')) {
          console.log("Google Drive folder link detected, preserving as is");
          return url;
        }
      }
      
      // Not a recognized Google Drive format or already properly formatted
      return url;
    } catch (error) {
      console.error("Error normalizing URL:", error);
      // Return original URL if there's any error in processing
      return url;
    }
  };

  const handleNormalizeUrl = () => {
    setNormalizedUrl(normalizeResumeUrl(resumeUrl));
  };

  const handleOpenUrl = () => {
    const urlToOpen = normalizedUrl || normalizeResumeUrl(resumeUrl);
    if (urlToOpen) {
      window.open(urlToOpen, "_blank");
    }
  };

  const handleTestUrl = (url: string) => {
    setResumeUrl(url);
    setNormalizedUrl(normalizeResumeUrl(url));
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Resume URL Tester</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Custom URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Enter resume URL"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleNormalizeUrl}>Normalize</Button>
            <Button onClick={handleOpenUrl}>Open URL</Button>
          </div>
          
          {normalizedUrl && (
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="font-semibold">Normalized URL:</p>
              <p className="break-all text-blue-600">{normalizedUrl}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Example URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {testUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{url}</p>
                </div>
                <Button variant="outline" onClick={() => handleTestUrl(url)}>
                  Test
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 