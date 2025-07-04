import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const ViewInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Get auth token from localStorage
  const token = localStorage.getItem("token");

  // Fetch invoices from backend
  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("https://back-7-9sog.onrender.com/api/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(res.data);
    } catch (err) {
      setError("Failed to load invoices.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Delete invoice API call
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    setError("");
    try {
      await axios.delete(`https://back-7-9sog.onrender.com/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Invoice deleted.");
      setInvoices((prev) => prev.filter((i) => i._id !== id));
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("Failed to delete invoice.");
      console.error(err);
    }
  };

  // Export filtered invoices to PDF
  const handleExportPDF = () => {
    const filtered = filterInvoices();
    const doc = new jsPDF();
    doc.text("Invoices Report", 14, 14);
    autoTable(doc, {
      head: [["Client Name", "Invoice #", "Date", "Amount", "Description"]],
      body: filtered.map((i) => [
        i.clientName,
        i.invoiceNumber,
        new Date(i.date).toLocaleDateString(),
        i.amount,
        i.description || "-",
      ]),
    });
    doc.save("invoices.pdf");
  };

  // Export filtered invoices to CSV
  const handleExportCSV = () => {
    const filtered = filterInvoices();
    const csv = Papa.unparse(
      filtered.map((i) => ({
        ClientName: i.clientName,
        InvoiceNumber: i.invoiceNumber,
        Date: i.date,
        Amount: i.amount,
        Description: i.description || "",
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter invoices by search input
  const filterInvoices = () => {
    return invoices.filter(
      (i) =>
        i.clientName.toLowerCase().includes(search.toLowerCase()) ||
        i.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Handle edits locally
  const handleEditChange = (e) => {
    setEditingInvoice({ ...editingInvoice, [e.target.name]: e.target.value });
  };

  // Save edited invoice to backend
  const handleSaveEdit = async () => {
    if (!editingInvoice) return;
    setError("");
    setSuccess("");
    try {
      const { _id, clientName, invoiceNumber, date, amount, description } = editingInvoice;
      await axios.put(
        `https://back-7-9sog.onrender.com/api/invoices/${_id}`,
        { clientName, invoiceNumber, date, amount, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvoices((prev) =>
        prev.map((inv) => (inv._id === _id ? editingInvoice : inv))
      );
      setSuccess("Invoice updated.");
      setEditingInvoice(null);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("Failed to update invoice.");
      console.error(err);
    }
  };

  const filtered = filterInvoices();

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Invoices & Payments</h2>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by client or invoice #"
          className="w-full sm:w-1/2 px-4 py-2 border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            disabled={loading || filtered.length === 0}
            className="bg-blue-900 text-white px-4 py-2 rounded-md shadow hover:bg-blue-800 disabled:opacity-50"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            disabled={loading || filtered.length === 0}
            className="bg-blue-100 text-blue-900 px-4 py-2 rounded-md shadow hover:bg-blue-200 disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-blue-700 font-semibold text-center">Loading invoices...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-blue-100 rounded-md shadow">
            <thead className="bg-blue-100 text-blue-900 font-semibold">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount (PKR)</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((i) => (
                  <tr key={i._id} className="border-t">
                    <td className="px-4 py-2">{i.clientName}</td>
                    <td className="px-4 py-2">{i.invoiceNumber}</td>
                    <td className="px-4 py-2">{new Date(i.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{i.amount}</td>
                    <td className="px-4 py-2">{i.description}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => setEditingInvoice(i)}
                        className="text-blue-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(i._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-400">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-xl">
            <h3 className="text-xl font-bold mb-4 text-blue-800">Edit Invoice</h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                name="clientName"
                value={editingInvoice.clientName}
                onChange={handleEditChange}
                placeholder="Client Name"
                className="border p-2 rounded"
              />
              <input
                name="invoiceNumber"
                value={editingInvoice.invoiceNumber}
                onChange={handleEditChange}
                placeholder="Invoice #"
                className="border p-2 rounded"
              />
              <input
                name="date"
                type="date"
                value={editingInvoice.date.slice(0, 10)}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />
              <input
                name="amount"
                type="number"
                value={editingInvoice.amount}
                onChange={handleEditChange}
                placeholder="Amount"
                className="border p-2 rounded"
              />
              <textarea
                name="description"
                value={editingInvoice.description}
                onChange={handleEditChange}
                placeholder="Description"
                className="col-span-2 border p-2 rounded"
              />
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setEditingInvoice(null)}
                className="text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {success && <p className="text-green-600 mt-4">{success}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
};

export default ViewInvoices;
