import multiparty from 'multiparty';
import pdfParse from 'pdf-parse';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing form data' });
      return;
    }

    const pdfFile = files.file[0];
    if (!pdfFile || pdfFile.headers['content-type'] !== 'application/pdf') {
      res.status(400).json({ error: 'Please upload a valid PDF file' });
      return;
    }

    const data = fs.readFileSync(pdfFile.path);
    const parsedText = await parsePDF(data);

    res.status(200).json({ text: parsedText });
  });
}

const parsePDF = async (data) => {
  const result = await pdfParse(data);
  return result.text;
};
