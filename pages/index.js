// pages/index.js

import React, { useState } from 'react';
import { pdfToTextAndImages, OCRImages } from '../src/utils/pdfUtils';

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [textData, setTextData] = useState('');

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
  };

  const extractTextFromPdf = async () => {
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
    };
    reader.readAsArrayBuffer(pdfFile);
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      {pdfFile && (
        <>
          <button onClick={extractTextFromPdf}>Extract Text</button>
          <pre>{textData}</pre>
        </>
      )}
    </div>
  );
}
