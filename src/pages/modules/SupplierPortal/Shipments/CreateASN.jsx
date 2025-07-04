import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const CreateASN = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    asnNumber: "",
    poNumber: "",
    shipmentDate: "",
    carrierName: "",
    trackingNumber: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate form before submit
  const validateForm = () => {
    if (!formData.asnNumber.trim()) {
      alert("ASN Number is required");
      return false;
    }
    if (!formData.poNumber.trim()) {
      alert("PO Number is required");
      return false;
    }
    if (!formData.shipmentDate) {
      alert("Shipment Date is required");
      return false;
    }
    return true;
  };

  // Submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://back-7-9sog.onrender.com/api/asns",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("ASN submitted successfully!");
      setFormData({
        asnNumber: "",
        poNumber: "",
        shipmentDate: "",
        carrierName: "",
        trackingNumber: "",
        notes: "",
      });
      if (onSubmitSuccess) onSubmitSuccess(); // callback to refresh list or other actions
    } catch (error) {
      console.error("Error submitting ASN:", error);
      alert("Failed to submit ASN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form data
  const handleReset = () => {
    setFormData({
      asnNumber: "",
      poNumber: "",
      shipmentDate: "",
      carrierName: "",
      trackingNumber: "",
      notes: "",
    });
  };

  // Export current form data to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("ASN Details", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Field", "Value"]],
      body: Object.entries(formData).map(([key, val]) => [
        key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        val || "-",
      ]),
    });
    doc.save(`ASN_${formData.asnNumber || "data"}.pdf`);
  };

  // Export current form data to CSV
  const exportToCSV = () => {
    const csv = Papa.unparse([formData]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `ASN_${formData.asnNumber || "data"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print current form data
  const printASN = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>ASN Print</title>");
    printWindow.document.write(
      `<style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background-color: #004aad; color: white; }
      </style>`
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h2>ASN Details</h2>");
    printWindow.document.write("<table>");
    printWindow.document.write("<thead><tr><th>Field</th><th>Value</th></tr></thead>");
    printWindow.document.write("<tbody>");
    Object.entries(formData).forEach(([key, val]) => {
      printWindow.document.write(
        `<tr><td>${key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())}</td><td>${val || "-"}</td></tr>`
      );
    });
    printWindow.document.write("</tbody></table>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">
        Create ASN (Advanced Shipment Notice)
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label
            htmlFor="asnNumber"
            className="block text-sm font-medium text-blue-900 mb-1"
          >
            ASN Number <span className="text-red-600">*</span>
          </label>
          <input
            id="asnNumber"
            name="asnNumber"
            type="text"
            value={formData.asnNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="poNumber"
            className="block text-sm font-medium text-blue-900 mb-1"
          >
            PO Number <span className="text-red-600">*</span>
          </label>
          <input
            id="poNumber"
            name="poNumber"
            type="text"
            value={formData.poNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="shipmentDate"
            className="block text-sm font-medium text-blue-900 mb-1"
          >
            Shipment Date <span className="text-red-600">*</span>
          </label>
          <input
            id="shipmentDate"
            name="shipmentDate"
            type="date"
            value={formData.shipmentDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="carrierName"
            className="block text-sm font-medium text-blue-900 mb-1"
          >
            Carrier Name
          </label>
          <input
            id="carrierName"
            name="carrierName"
            type="text"
            value={formData.carrierName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="trackingNumber"
            className="block text-sm font-medium text-blue-900 mb-1"
          >
            Tracking Number
          </label>
          <input
            id="trackingNumber"
            name="trackingNumber"
            type="text"
            value={formData.trackingNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-blue-900 mb-1"
          >
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex flex-wrap gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-900 text-white px-5 py-2 rounded hover:bg-blue-800 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit ASN"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded hover:bg-gray-300 transition"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={exportToPDF}
            className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
          >
            Export to PDF
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
          >
            Export to CSV
          </button>
          <button
            type="button"
            onClick={printASN}
            className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
          >
            Print ASN
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateASN;
