import React, { useEffect, useState } from "react";
import axios from "axios";

const UploadASN = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [asnFiles, setAsnFiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const backendURL = "https://back-7-9sog.onrender.com";

  // Fetch uploaded ASN files
  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/asn/all`);
      setAsnFiles(res.data);
    } catch (err) {
      console.error("Error fetching ASN files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Upload Handler
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("asnFile", selectedFile);

    try {
      setUploading(true);
      setMessage("Uploading...");
      await axios.post(`${backendURL}/api/asn/upload`, formData);
      setMessage("✅ Uploaded successfully!");
      setSelectedFile(null);
      document.getElementById("asn-file").value = "";
      fetchFiles(); // Refresh list
    } catch (err) {
      setMessage("❌ Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setMessage("");
    document.getElementById("asn-file").value = "";
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(asnFiles.map((file) => file._id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePrint = () => {
    if (selectedIds.length === 0) return alert("Please select at least one file.");
    selectedIds.forEach((id) => {
      const file = asnFiles.find((f) => f._id === id);
      if (file) {
        window.open(`${backendURL}/uploads/asn/${file.filename}`, "_blank");
      }
    });
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
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-700">
            <p><strong>Selected File:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        {message && <div className="text-sm text-blue-800 font-medium">{message}</div>}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={uploading}
            className={`px-5 py-2 rounded text-white transition ${
              uploading ? "bg-blue-300" : "bg-blue-900 hover:bg-blue-800"
            }`}
          >
            {uploading ? "Uploading..." : "Upload"}
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

      <hr className="my-6" />

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-blue-900">Uploaded ASN Files</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">
            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="mr-2" />
            Select All
          </label>
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 transition"
          >
            Print Selected
          </button>
        </div>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 text-blue-900">
            <tr>
              <th className="p-2 text-left">Select</th>
              <th className="p-2 text-left">Filename</th>
              <th className="p-2 text-left">Uploaded</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {asnFiles.map((file) => (
              <tr key={file._id} className="border-t hover:bg-blue-50">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(file._id)}
                    onChange={() => toggleSelect(file._id)}
                  />
                </td>
                <td className="p-2">{file.originalname}</td>
                <td className="p-2">{new Date(file.uploadDate).toLocaleString()}</td>
                <td className="p-2">
                  <a
                    href={`${backendURL}/uploads/asn/${file.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View/Download
                  </a>
                </td>
              </tr>
            ))}
            {asnFiles.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">No files uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadASN;
