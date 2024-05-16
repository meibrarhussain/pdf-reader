// pages/index.js

import React, { useState } from 'react';
import { pdfToImages, OCRImages } from '../src/utils/pdfUtils';

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [textData, setTextData] = useState('');

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
  };

  const extractTextFromPdf = async () => {
    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const images = await pdfToImages(typedArray, {
        onStart: () => console.log('Started converting PDF to images...'),
        onProgress: (progress) => console.log(`Converted ${progress.current}/${progress.total} pages`),
      });
  
      const extractedText = await OCRImages(images, {
        onStart: () => console.log('Started OCR processing...'),
        onProgress: (progress) => console.log(`Processed ${progress.current}/${progress.total} images`),
      });
  
      setTextData(JSON.stringify(extractedText, null, 2));
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
