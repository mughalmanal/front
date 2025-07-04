import React, { useState } from "react";

const UploadASN = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    console.log("Uploading:", selectedFile);
    // Later: upload to your backend via FormData
  };

  const handleReset = () => {
    setSelectedFile(null);
    document.getElementById("asn-file").value = "";
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Upload ASN Document</h2>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label htmlFor="asn-file" className="block text-sm font-medium text-blue-900 mb-1">
            Select ASN File (PDF, Excel, etc.)
          </label>
          <input
            type="file"
            id="asn-file"
            accept=".pdf,.xlsx,.xls"
            onChange={handleFileChange}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-700">
            <p><strong>Selected File:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-blue-900 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadASN;
