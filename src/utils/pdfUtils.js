// src/utils/pdfUtils.js

import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

const pdfToTextAndImages = async (pdf, options) => {
  const doc = await pdfjsLib.getDocument(pdf).promise;
  const totalPages = doc.numPages;

  let textData = '';
  let images = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join('\n');
    textData += pageText + '\n'; // Concatenate text from all pages

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const viewport = page.getViewport({ scale: options.scale || 1 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
    images.push(canvas.toDataURL('image/png')); // Store image data from all pages
  }

  return { textData, images };
};

const OCRImages = async (imageUrls, options) => {
  options.onStart && options.onStart({ current: 0, total: imageUrls.length });
  const progress = { total: imageUrls.length, current: 0 };

  const texts = await Promise.all(
    imageUrls.map(
      async imageUrl =>
        await Tesseract.recognize(imageUrl, 'eng').then(({ data: { text } }) => {
          progress.current += 1;
          options.onProgress && options.onProgress(progress);
          return text;
        })
    )
  );

  return texts.reduce((acc, text, index) => {
    return { ...acc, [index + 1]: text };
  }, {});
};

export { pdfToTextAndImages, OCRImages };
