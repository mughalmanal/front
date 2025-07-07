import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";

const backendURL = "https://back-8.onrender.com/api/stock-out"; // Change to your backend URL

function StockOut() {
  const [stockOutList, setStockOutList] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    productName: "",
    quantity: "",
    recipient: "",
    date: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Date filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch data from backend with filters
  const fetchStockOut = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await axios.get(backendURL, { params });
      setStockOutList(res.data);
    } catch (err) {
      setError("Failed to load stock out entries.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStockOut();
  }, [search, dateFrom, dateTo]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!form.productName || !form.quantity || !form.date) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(backendURL, {
        productName: form.productName,
        quantity: Number(form.quantity),
        recipient: form.recipient,
        date: form.date,
        notes: form.notes,
      });
      setStockOutList([res.data, ...stockOutList]);
      setForm({ productName: "", quantity: "", recipient: "", date: "", notes: "" });
    } catch (err) {
      setError("Failed to add stock out entry.");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      setLoading(true);
      await axios.delete(`${backendURL}/${id}`);
      setStockOutList(stockOutList.filter((entry) => entry._id !== id));
    } catch (err) {
      setError("Failed to delete entry.");
    }
    setLoading(false);
  };

  const handleSaveEdit = async () => {
    if (!editForm.productName || !editForm.quantity || !editForm.date) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(`${backendURL}/${editingId}`, {
        productName: editForm.productName,
        quantity: Number(editForm.quantity),
        recipient: editForm.recipient,
        date: editForm.date,
        notes: editForm.notes,
      });
      setStockOutList(
        stockOutList.map((entry) => (entry._id === editingId ? res.data : entry))
      );
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      setError("Failed to update entry.");
    }
    setLoading(false);
  };

  // Pagination slice
  const paginated = stockOutList.slice((page - 1) * pageSize, page * pageSize);

  // CSV export data
  const csvData = stockOutList.map((entry) => ({
    Product: entry.productName,
    Quantity: entry.quantity,
    Recipient: entry.recipient,
    Date: entry.date,
    Notes: entry.notes,
  }));

  // Fancy PDF print with jsPDF
  const printReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor("#0c4a6e");
    doc.text("Stock Out Report", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor("#555");
    if (dateFrom) doc.text(`From: ${dateFrom}`, 14, 28);
    if (dateTo) doc.text(`To: ${dateTo}`, 50, 28);

    const columns = ["Product", "Quantity", "Recipient", "Date", "Notes"];
    const rows = paginated.map((entry) => [
      entry.productName,
      entry.quantity.toString(),
      entry.recipient || "",
      entry.date,
      entry.notes || "",
    ]);

    doc.autoTable({
      startY: 35,
      head: [columns],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: "#0c4a6e", textColor: "#fff" },
      alternateRowStyles: { fillColor: "#f1f1f1" },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    });

    doc.setDrawColor("#0c4a6e");
    doc.setLineWidth(0.5);
    doc.line(14, 10, 196, 10); // top line
    doc.line(14, doc.internal.pageSize.height - 10, 196, doc.internal.pageSize.height - 10); // bottom line

    doc.save("stock_out_report.pdf");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Stock Out</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {loading && <p className="text-gray-600 mb-3">Loading...</p>}

      {/* Add Entry Form */}
      <form onSubmit={handleAddEntry} className="grid md:grid-cols-3 gap-4 mb-6">
        <input
          name="productName"
          value={form.productName}
          onChange={handleChange}
          placeholder="Product Name"
          className="p-2 border rounded"
          required
        />
        <input
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          min="1"
          className="p-2 border rounded"
          required
        />
        <input
          name="recipient"
          value={form.recipient}
          onChange={handleChange}
          placeholder="Recipient / Destination"
          className="p-2 border rounded"
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes"
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-900 text-white rounded px-4 py-2 hover:bg-blue-800 col-span-1"
        >
          Add Entry
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by product or recipient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-1 px-2 border rounded text-sm w-64"
        />
        <label>
          From:{" "}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border rounded p-1"
          />
        </label>
        <label>
          To:{" "}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border rounded p-1"
          />
        </label>
        <button
          onClick={() => {
            setSearch("");
            setDateFrom("");
            setDateTo("");
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-2">Product</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Recipient</th>
              <th className="p-2">Date</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((entry) =>
                editingId === entry._id ? (
                  <tr key={entry._id} className="border-t hover:bg-gray-50">
                    <td className="p-1">
                      <input
                        className="border p-1 rounded"
                        name="productName"
                        value={editForm.productName}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        className="border p-1 rounded"
                        name="quantity"
                        type="number"
                        min="1"
                        value={editForm.quantity}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        className="border p-1 rounded"
                        name="recipient"
                        value={editForm.recipient}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        className="border p-1 rounded"
                        name="date"
                        type="date"
                        value={editForm.date}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        className="border p-1 rounded"
                        name="notes"
                        value={editForm.notes}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="text-green-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={entry._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{entry.productName}</td>
                    <td className="p-2">{entry.quantity}</td>
                    <td className="p-2">{entry.recipient}</td>
                    <td className="p-2">{entry.date}</td>
                    <td className="p-2">{entry.notes}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(entry._id);
                          setEditForm(entry);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No stock out records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="text-blue-700 hover:underline"
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {page} of {Math.ceil(stockOutList.length / pageSize)}
        </span>
        <button
          disabled={page * pageSize >= stockOutList.length}
          onClick={() => setPage(page + 1)}
          className="text-blue-700 hover:underline"
        >
          Next
        </button>
      </div>

      {/* Export & Print */}
      <div className="mt-4 space-x-4">
        <CSVLink
          data={csvData}
          filename={`stock_out_report.csv`}
          className="text-indigo-700 hover:underline"
        >
          Export CSV
        </CSVLink>
        <button onClick={printReport} className="text-green-700 hover:underline">
          Print PDF
        </button>
      </div>
    </div>
  );
}

export default StockOut;
