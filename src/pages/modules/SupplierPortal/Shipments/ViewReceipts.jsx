import React, { useState } from "react";

const dummyReceipts = [
  {
    id: 1,
    receiptNumber: "RCPT-001",
    shipmentNumber: "SHIP-789",
    date: "2025-07-04",
    supplier: "Textile Co.",
    status: "Received",
    items: [
      { name: "Kurti", qty: 10 },
      { name: "Shalwar", qty: 15 },
    ],
  },
  {
    id: 2,
    receiptNumber: "RCPT-002",
    shipmentNumber: "SHIP-790",
    date: "2025-07-03",
    supplier: "Lawn World",
    status: "Pending",
    items: [
      { name: "Dupatta", qty: 20 },
    ],
  },
];

const ViewReceipts = () => {
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  const filtered = dummyReceipts.filter((r) =>
    r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = (type) => {
    alert(`Exporting as ${type}... (to be implemented)`);
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
            <React.Fragment key={receipt.id}>
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
                <td className="p-2">
                  <button
                    onClick={() =>
                      setExpandedRow(expandedRow === receipt.id ? null : receipt.id)
                    }
                    className="text-blue-900 underline text-sm"
                  >
                    {expandedRow === receipt.id ? "Hide Items" : "View Items"}
                  </button>
                </td>
              </tr>
              {expandedRow === receipt.id && (
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
    </div>
  );
};

export default ViewReceipts;
