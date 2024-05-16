// src/utils/pdfUtils.js

import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

const pdfToImages = async (pdf, options) => {
  const output = [];
  const doc = await pdfjsLib.getDocument(pdf).promise;

  options.onStart && options.onStart({ current: 0, total: doc.numPages });

  for (let i = 1; i < doc.numPages + 1; i++) {
    const canvas = document.createElement('canvas');

    const page = await doc.getPage(i);
    const context = canvas.getContext('2d');
    const viewport = page.getViewport({ scale: options.scale || 1 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    options.onProgress && options.onProgress({ current: i, total: doc.numPages });

    output.push(canvas.toDataURL('image/png'));
  }

  return output;
};

const OCRImages = async (urls, options) => {
  options.onStart && options.onStart({ current: 0, total: urls.length });
  const progress = { total: urls.length, current: 0 };

  const promises = urls.map(
    async url =>
      await Tesseract.recognize(url, 'eng').then(({ data: { text } }) => {
        progress.current += 1;
        options.onProgress && options.onProgress(progress);
        return text;
      })
  );

  const texts = await Promise.all(promises);

  return texts.reduce((acc, text, index) => {
    return { ...acc, [index + 1]: text };
  }, {});
};



export { pdfToImages, OCRImages };
