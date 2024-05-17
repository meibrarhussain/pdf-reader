// pages/index.js

import React, { useState } from 'react';
import { pdfToTextAndImages, OCRImages } from '../src/utils/pdfUtils';

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [textData, setTextData] = useState('');
  const [loading, setLoading] = useState(false); // State to manage loading spinner

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
  };

  const extractTextFromPdf = async () => {
    setLoading(true); // Show loader spinner animation
    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const { textData, images } = await pdfToTextAndImages(typedArray, {
        onStart: () => console.log('Started extracting text and images from PDF...'),
      });

      let extractedText = textData;
      if (images.length > 0) {
        const ocrTexts = await OCRImages(images, {
          onStart: () => console.log('Started OCR processing...'),
          onProgress: (progress) => console.log(`Processed ${progress.current}/${progress.total} images`),
        });
        Object.keys(ocrTexts).forEach((index) => {
          extractedText += `\nImage ${index}:\n${ocrTexts[index]}\n`; // Add OCR text to the extracted text
        });
      }

      setTextData(extractedText);
      sendTextDataToFlask(extractedText); // Send extracted text data to Flask server
    };
    reader.readAsArrayBuffer(pdfFile);
  };

  const sendTextDataToFlask = async (extractedText) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/menu?menu_text=${encodeURIComponent(extractedText)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Data received from Flask server:', data);
        setTextData(JSON.stringify(data)); // Update textData state with received data
      } else {
        console.error('Failed to send text data to Flask server');
      }
    } catch (error) {
      console.error('Error sending text data to Flask server:', error);
    } finally {
      setLoading(false); // Hide loader spinner animation
    }
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      {pdfFile && (
        <>
          <button onClick={extractTextFromPdf}>Extract Text</button>
          {loading ? (
            <div className="loader"></div> // Loader spinner animation
          ) : (
            <pre>{textData}</pre> // Display received data
          )}
        </>
      )}
      <style jsx>{`
        .loader {
          border: 16px solid #f3f3f3;
          border-radius: 50%;
          border-top: 16px solid #3498db;
          width: 120px;
          height: 120px;
          animation: spin 2s linear infinite;
          margin: 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
