import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";

const backendURL = "https://back-8.onrender.com/api/payments";

function PaymentEntries() {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    payer: "",
    amount: "",
    method: "Cash",
    date: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(backendURL);
      setPayments(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(backendURL, form);
      setPayments([res.data, ...payments]);
      setForm({ payer: "", amount: "", method: "Cash", date: "", notes: "" });
    } catch (err) {
      console.error("Add error", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendURL}/${id}`);
      setPayments(payments.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleEdit = (payment) => {
    setEditingId(payment._id);
    setEditForm(payment);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`${backendURL}/${editingId}`, editForm);
      setPayments(payments.map((p) => (p._id === editingId ? res.data : p)));
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error("Edit error", err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const filtered = payments.filter((p) =>
    p.payer.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(paginated.map((p) => p._id));
  const clearSelection = () => setSelectedIds([]);

  const printPayments = () => {
    const printData = payments.filter((p) => selectedIds.includes(p._id));
    const doc = new jsPDF();
    doc.text("Payment Entries", 14, 10);
    doc.autoTable({
      head: [["Payer", "Amount", "Method", "Date", "Notes"]],
      body: printData.map((p) => [p.payer, p.amount, p.method, p.date, p.notes]),
    });
    doc.save("payments.pdf");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Payment Entries</h2>

      {/* Form */}
      <form onSubmit={handleAddPayment} className="grid md:grid-cols-3 gap-4 mb-6">
        <input name="payer" value={form.payer} onChange={handleChange} placeholder="Payer" className="p-2 border rounded" required />
        <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount (PKR)" className="p-2 border rounded" required />
        <select name="method" value={form.method} onChange={handleChange} className="p-2 border rounded">
          <option>Cash</option>
          <option>Bank Transfer</option>
          <option>Cheque</option>
          <option>Other</option>
        </select>
        <input name="date" type="date" value={form.date} onChange={handleChange} className="p-2 border rounded" required />
        <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="p-2 border rounded col-span-2" />
        <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 col-span-3">Add Payment</button>
      </form>

      {/* Tools */}
      <div className="flex justify-between items-center mb-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-72"
        />
        <div className="space-x-3">
          <button onClick={selectAll} className="text-sm text-blue-800 hover:underline">Select All</button>
          <button onClick={clearSelection} className="text-sm text-gray-700 hover:underline">Clear</button>
          <button onClick={printPayments} className="text-sm text-green-700 hover:underline">Print Selected</button>
          <CSVLink data={payments} filename="payments.csv" className="text-sm text-indigo-700 hover:underline">Export CSV</CSVLink>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-2">✔</th>
              <th className="p-2">Payer</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Method</th>
              <th className="p-2">Date</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) =>
              editingId === p._id ? (
                <tr key={p._id} className="border-t">
                  <td className="p-2">✏️</td>
                  <td><input name="payer" value={editForm.payer} onChange={handleEditChange} className="border p-1 rounded" /></td>
                  <td><input name="amount" type="number" value={editForm.amount} onChange={handleEditChange} className="border p-1 rounded" /></td>
                  <td>
                    <select name="method" value={editForm.method} onChange={handleEditChange} className="border p-1 rounded">
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Cheque</option>
                      <option>Other</option>
                    </select>
                  </td>
                  <td><input name="date" type="date" value={editForm.date} onChange={handleEditChange} className="border p-1 rounded" /></td>
                  <td><input name="notes" value={editForm.notes} onChange={handleEditChange} className="border p-1 rounded" /></td>
                  <td>
                    <button onClick={handleSaveEdit} className="text-green-600 hover:underline mr-2">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => toggleSelect(p._id)} />
                  </td>
                  <td className="p-2">{p.payer}</td>
                  <td className="p-2">PKR {p.amount}</td>
                  <td className="p-2">{p.method}</td>
                  <td className="p-2">{p.date}</td>
                  <td className="p-2">{p.notes}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="text-blue-700 hover:underline">Previous</button>
        <span className="text-gray-600">Page {page}</span>
        <button disabled={page * pageSize >= filtered.length} onClick={() => setPage(page + 1)} className="text-blue-700 hover:underline">Next</button>
      </div>
    </div>
  );
}

export default PaymentEntries;
