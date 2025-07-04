import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ViewReceipts = () => {
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [printData, setPrintData] = useState([]);
  const [showPrint, setShowPrint] = useState(false);

  const backendURL = "https://back-7-9sog.onrender.com";

  const fetchReceipts = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/receipts`);
      setReceipts(res.data);
    } catch (err) {
      console.error("Error fetching receipts", err);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filtered = receipts.filter((r) =>
    r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = (type) => {
    if (type === "CSV") {
      const headers = ["Receipt #", "Shipment #", "Supplier", "Date", "Status"];
      const rows = filtered.map((r) => [
        r.receiptNumber,
        r.shipmentNumber,
        r.supplier,
        r.date,
        r.status,
      ]);

      let csv = headers.join(",") + "\n";
      rows.forEach((row) => {
        csv += row.join(",") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "receipts.csv";
      link.click();
    }

    if (type === "PDF") {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Receipts - ASIF AND BROTHERS", 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [["Receipt #", "Shipment #", "Supplier", "Date", "Status"]],
        body: filtered.map((r) => [
          r.receiptNumber,
          r.shipmentNumber,
          r.supplier,
          r.date,
          r.status,
        ]),
      });
      doc.save("receipts.pdf");
    }
  };

  const handlePrint = (receipt) => {
    setPrintData(receipt);
    setShowPrint(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-900">View Receipts</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("PDF")}
            className="bg-blue-900 text-white px-4 py-1.5 rounded hover:bg-blue-800 text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={() => handleExport("CSV")}
            className="bg-blue-100 text-blue-900 px-4 py-1.5 rounded hover:bg-blue-200 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search receipts..."
        className="mb-4 w-full border rounded px-4 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full text-sm border border-gray-200">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-2 text-left">Receipt #</th>
            <th className="p-2 text-left">Shipment #</th>
            <th className="p-2 text-left">Supplier</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((receipt) => (
            <React.Fragment key={receipt._id}>
              <tr className="border-t border-gray-200">
                <td className="p-2">{receipt.receiptNumber}</td>
                <td className="p-2">{receipt.shipmentNumber}</td>
                <td className="p-2">{receipt.supplier}</td>
                <td className="p-2">{receipt.date}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      receipt.status === "Received"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {receipt.status}
                  </span>
                </td>
                <td className="p-2 flex gap-3">
                  <button
                    onClick={() =>
                      setExpandedRow(expandedRow === receipt._id ? null : receipt._id)
                    }
                    className="text-blue-900 underline text-sm"
                  >
                    {expandedRow === receipt._id ? "Hide Items" : "View Items"}
                  </button>
                  <button
                    onClick={() => handlePrint(receipt)}
                    className="text-green-800 underline text-sm"
                  >
                    Print
                  </button>
                </td>
              </tr>
              {expandedRow === receipt._id && (
                <tr className="bg-blue-50">
                  <td colSpan="6" className="p-4">
                    <strong>Items:</strong>
                    <ul className="list-disc pl-5 mt-2 text-sm text-blue-800">
                      {receipt.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name} – Qty: {item.qty}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Printable view */}
      {showPrint && (
        <div style={{ display: "block" }} className="print-preview">
          <style>
            {`
              @media print {
                body * {
                  visibility: hidden;
                }
                .print-preview, .print-preview * {
                  visibility: visible;
                }
                .print-preview {
                  position: absolute;
                  left: 0;
                  top: 0;
                  padding: 40px;
                  font-family: 'Segoe UI', sans-serif;
                  width: 100%;
                }
              }
            `}
          </style>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-900">ASIF AND BROTHERS</h1>
            <p className="text-sm text-gray-600">Receipt Summary</p>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          <table className="w-full text-sm border-collapse mb-6">
            <tbody>
              <tr>
                <td className="font-semibold">Receipt #</td>
                <td>{printData.receiptNumber}</td>
              </tr>
              <tr>
                <td className="font-semibold">Shipment #</td>
                <td>{printData.shipmentNumber}</td>
              </tr>
              <tr>
                <td className="font-semibold">Supplier</td>
                <td>{printData.supplier}</td>
              </tr>
              <tr>
                <td className="font-semibold">Date</td>
                <td>{printData.date}</td>
              </tr>
              <tr>
                <td className="font-semibold">Status</td>
                <td>{printData.status}</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-lg font-bold text-blue-900 mb-2">Items</h3>
          <table className="w-full text-sm border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {printData.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-right mt-6 text-sm text-gray-600">
            Printed on: {new Date().toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewReceipts;
