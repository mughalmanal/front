import React, { useEffect, useState } from "react";
import axios from "axios";

const backendURL = "https://back-8.onrender.com/api/invoice/view";

function ViewInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const res = await axios.get(backendURL);
    setInvoices(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this invoice?")) {
      await axios.delete(`https://back-8.onrender.com/api/invoice/${id}`);
      fetchInvoices();
    }
  };

  const printInvoice = (invoice) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Invoice ${invoice.invoiceNumber}</title><style>
        body { font-family: 'Segoe UI'; padding: 20px; color: #333; }
        h1 { color: #1d4ed8; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .section { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #ddd; }
        th { background-color: #f0f8ff; }
        .total { font-size: 1.2rem; font-weight: bold; text-align: right; color: #1d4ed8; }
      </style></head><body>
        <h1>Invoice: ${invoice.invoiceNumber}</h1>
        <div class="section">
          <strong>Client:</strong> ${invoice.clientName}<br/>
          <strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}
        </div>
        <div class="section">
          <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${invoice.items.map(i =>
                `<tr>
                  <td>${i.name}</td>
                  <td>${i.quantity}</td>
                  <td>PKR ${i.price}</td>
                  <td>PKR ${i.quantity * i.price}</td>
                </tr>`
              ).join("")}
            </tbody>
          </table>
        </div>
        <div class="total">Grand Total: PKR ${invoice.totalAmount}</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const filtered = invoices.filter(inv => {
    const query = search.toLowerCase();
    const matchesSearch =
      inv.clientName?.toLowerCase().includes(query) ||
      inv.invoiceNumber?.toLowerCase().includes(query);

    const invoiceDate = new Date(inv.createdAt);
    const inDateRange =
      (!startDate || new Date(startDate) <= invoiceDate) &&
      (!endDate || invoiceDate <= new Date(endDate));

    return matchesSearch && inDateRange;
  });

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-bold text-blue-900">Invoices</h2>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-1 rounded w-64"
          placeholder="Search by client or number"
        />
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button onClick={() => { setStartDate(""); setEndDate(""); }} className="text-sm text-red-600 underline">
          Clear Filters
        </button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-2">Invoice #</th>
            <th className="p-2">Client</th>
            <th className="p-2">Date</th>
            <th className="p-2">Total</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((inv) => (
            <tr key={inv._id} className="border-t">
              <td className="p-2">{inv.invoiceNumber}</td>
              <td className="p-2">{inv.clientName}</td>
              <td className="p-2">{new Date(inv.createdAt).toLocaleDateString()}</td>
              <td className="p-2">PKR {inv.totalAmount}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => printInvoice(inv)}
                  className="px-2 py-1 text-blue-600 border rounded"
                >
                  🖨️ Print
                </button>
                <button
                  onClick={() => handleDelete(inv._id)}
                  className="px-2 py-1 text-red-600 border rounded"
                >
                  ❌ Delete
                </button>
                {/* You can add Edit button here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="mt-4 text-center text-gray-500">No invoices found.</div>
      )}
    </div>
  );
}

export default ViewInvoices;
