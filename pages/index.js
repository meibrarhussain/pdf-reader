import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setText(data.text);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <h1>PDF Text Extractor</h1>
      <input type="file" onChange={handleFileChange} />
      {file && (
        <div>
          <h2>Uploaded File: {file.name}</h2>
          <div>
            <h3>Extracted Text:</h3>
            <pre>{text}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
