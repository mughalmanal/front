import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";

const backendURL = "https://back-8.onrender.com/api/stockin"; // update with your backend URL

function StockIn() {
  const [stockInList, setStockInList] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    productName: "",
    quantity: "",
    supplier: "",
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

  // Date filter for search
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch entries from backend (with optional search & date filter)
  const fetchStockIn = async () => {
    setLoading(true);
    setError("");
    try {
      // Build query params for search and date filtering
      const params = {};
      if (search) params.search = search;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await axios.get(backendURL, { params });
      setStockInList(res.data);
    } catch (err) {
      setError("Failed to load stock in entries.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStockIn();
  }, [search, dateFrom, dateTo]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  // Add new stock-in entry (POST)
  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!form.productName || !form.quantity || !form.date) {
      alert("Please fill required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(backendURL, {
        productName: form.productName,
        quantity: Number(form.quantity),
        supplier: form.supplier,
        date: form.date,
        notes: form.notes,
      });
      setStockInList([res.data, ...stockInList]);
      setForm({ productName: "", quantity: "", supplier: "", date: "", notes: "" });
    } catch (err) {
      setError("Failed to add entry.");
    }
    setLoading(false);
  };

  // Delete stock-in entry (DELETE)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this entry?")) return;
    try {
      setLoading(true);
      await axios.delete(`${backendURL}/${id}`);
      setStockInList(stockInList.filter((entry) => entry._id !== id));
    } catch (err) {
      setError("Failed to delete entry.");
    }
    setLoading(false);
  };

  // Save edit (PUT)
  const handleSaveEdit = async () => {
    if (!editForm.productName || !editForm.quantity || !editForm.date) {
      alert("Please fill required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(`${backendURL}/${editingId}`, {
        productName: editForm.productName,
        quantity: Number(editForm.quantity),
        supplier: editForm.supplier,
        date: editForm.date,
        notes: editForm.notes,
      });
      setStockInList(
        stockInList.map((entry) =>
          entry._id === editingId ? res.data : entry
        )
      );
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      setError("Failed to update entry.");
    }
    setLoading(false);
  };

  // Pagination slice
  const paginated = stockInList.slice((page - 1) * pageSize, page * pageSize);

  // CSV export data
  const csvData = stockInList.map((entry) => ({
    Product: entry.productName,
    Quantity: entry.quantity,
    Supplier: entry.supplier,
    Date: entry.date,
    Notes: entry.notes,
  }));

  // Print PDF report
  const printReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor("#0c4a6e");
    doc.text("Stock In Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor("#444");
    if (dateFrom) doc.text(`From: ${dateFrom}`, 14, 30);
    if (dateTo) doc.text(`To: ${dateTo}`, 14, 36);

    const tableColumn = ["Product", "Quantity", "Supplier", "Date", "Notes"];
    const tableRows = paginated.map((entry) => [
      entry.productName,
      entry.quantity.toString(),
      entry.supplier || "",
      entry.date,
      entry.notes || "",
    ]);

    doc.autoTable({
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: "#0c4a6e" },
      alternateRowStyles: { fillColor: "#f6f6f6" },
    });

    doc.save("stock_in_report.pdf");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Stock In</h2>

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
          className="p-2 border rounded"
          required
          min="1"
        />
        <input
          name="supplier"
          value={form.supplier}
          onChange={handleChange}
          placeholder="Supplier"
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
          placeholder="Search by product or supplier..."
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
              <th className="p-2">Supplier</th>
              <th className="p-2">Date</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((entry) => (
                <tr key={entry._id} className="border-t hover:bg-gray-50">
                  {editingId === entry._id ? (
                    <>
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
                          name="supplier"
                          value={editForm.supplier}
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
                    </>
                  ) : (
                    <>
                      <td className="p-2">{entry.productName}</td>
                      <td className="p-2">{entry.quantity}</td>
                      <td className="p-2">{entry.supplier}</td>
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
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No stock in records found.
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
          Page {page} of {Math.ceil(stockInList.length / pageSize)}
        </span>
        <button
          disabled={page * pageSize >= stockInList.length}
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
          filename={`stock_in_report.csv`}
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

export default StockIn;
