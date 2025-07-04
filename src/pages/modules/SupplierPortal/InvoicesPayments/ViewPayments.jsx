import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const ViewPayments = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Get JWT token from localStorage (or wherever you store it)
  const token = localStorage.getItem("token");

  // Fetch payments from backend
  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("https://back-7-9sog.onrender.com/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data);
    } catch (err) {
      setError("Failed to load payments.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments by client name or reference
  const filtered = payments.filter(
    (p) =>
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase())
  );

  // Delete payment by ID
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment?")) return;
    setError("");
    try {
      await axios.delete(`https://back-7-9sog.onrender.com/api/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments((prev) => prev.filter((p) => p._id !== id));
      setSuccess("Payment deleted.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("Failed to delete payment.");
      console.error(err);
    }
  };

  // Export payments PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Payments Report", 14, 14);
    autoTable(doc, {
      head: [["Client Name", "Reference", "Date", "Amount", "Method", "Remarks"]],
      body: filtered.map((p) => [
        p.clientName,
        p.reference,
        new Date(p.date).toLocaleDateString(),
        p.amount,
        p.method,
        p.remarks || "-",
      ]),
    });
    doc.save("payments.pdf");
  };

  // Export payments CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(
      filtered.map((p) => ({
        ClientName: p.clientName,
        Reference: p.reference,
        Date: p.date,
        Amount: p.amount,
        Method: p.method,
        Remarks: p.remarks || "",
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "payments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle input changes in edit modal
  const handleEditChange = (e) => {
    setEditing({ ...editing, [e.target.name]: e.target.value });
  };

  // Save edited payment to backend
  const handleSaveEdit = async () => {
    if (!editing) return;
    setError("");
    setSuccess("");
    try {
      const { _id, clientName, reference, date, amount, method, remarks } = editing;
      await axios.put(
        `https://back-7-9sog.onrender.com/api/payments/${_id}`,
        { clientName, reference, date, amount, method, remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments((prev) =>
        prev.map((p) => (p._id === _id ? editing : p))
      );
      setSuccess("Payment updated.");
      setEditing(null);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("Failed to update payment.");
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Payments</h2>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by client or reference"
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
        <p className="text-blue-700 font-semibold text-center">Loading payments...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-blue-100 rounded-md shadow">
            <thead className="bg-blue-100 text-blue-900 font-semibold">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount (PKR)</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="px-4 py-2">{p.clientName}</td>
                    <td className="px-4 py-2">{p.reference}</td>
                    <td className="px-4 py-2">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{p.amount}</td>
                    <td className="px-4 py-2">{p.method}</td>
                    <td className="px-4 py-2">{p.remarks}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="text-blue-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-xl">
            <h3 className="text-xl font-bold mb-4 text-blue-800">Edit Payment</h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                name="clientName"
                value={editing.clientName}
                onChange={handleEditChange}
                placeholder="Client Name"
                className="border p-2 rounded"
              />
              <input
                name="reference"
                value={editing.reference}
                onChange={handleEditChange}
                placeholder="Reference"
                className="border p-2 rounded"
              />
              <input
                name="date"
                type="date"
                value={editing.date?.slice(0, 10)}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />
              <input
                name="amount"
                type="number"
                value={editing.amount}
                onChange={handleEditChange}
                placeholder="Amount"
                className="border p-2 rounded"
              />
              <input
                name="method"
                value={editing.method}
                onChange={handleEditChange}
                placeholder="Method"
                className="border p-2 rounded"
              />
              <input
                name="remarks"
                value={editing.remarks}
                onChange={handleEditChange}
                placeholder="Remarks"
                className="border p-2 rounded"
              />
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setEditing(null)}
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

export default ViewPayments;
