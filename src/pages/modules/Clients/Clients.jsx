import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";

const backendURL = "https://back-8.onrender.com/api/clients";

function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "Retail",
    cnic: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch from backend
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get(backendURL);
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients", err);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(backendURL, form);
      setClients([res.data, ...clients]);
      setForm({ name: "", phone: "", email: "", address: "", type: "Retail", cnic: "" });
    } catch (err) {
      console.error("Error adding client", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendURL}/${id}`);
      setClients(clients.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleEdit = (client) => {
    setEditingId(client._id);
    setEditForm(client);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`${backendURL}/${editingId}`, editForm);
      setClients(clients.map((c) => (c._id === editingId ? res.data : c)));
      setEditingId(null);
    } catch (err) {
      console.error("Edit error", err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(paginated.map((c) => c._id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const printClients = () => {
    const printData = clients.filter((c) => selectedIds.includes(c._id));
    const doc = new jsPDF();
    doc.text("Client List", 14, 10);
    doc.autoTable({
      head: [["Name", "Phone", "Email", "Type", "Address", "CNIC"]],
      body: printData.map((c) => [c.name, c.phone, c.email, c.type, c.address, c.cnic]),
    });
    doc.save("clients.pdf");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Clients Management</h2>

      {/* Add Client Form */}
      <form onSubmit={handleAddClient} className="grid md:grid-cols-3 gap-4 mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="p-2 border rounded" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="p-2 border rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="p-2 border rounded" />
        <select name="type" value={form.type} onChange={handleChange} className="p-2 border rounded">
          <option>Retail</option>
          <option>Wholesale</option>
          <option>Other</option>
        </select>
        <input name="cnic" value={form.cnic} onChange={handleChange} placeholder="CNIC / Notes" className="p-2 border rounded col-span-2" />
        <button type="submit" className="bg-blue-900 text-white rounded px-4 py-2 hover:bg-blue-800 col-span-3">Add Client</button>
      </form>

      {/* Filters & Actions */}
      <div className="flex justify-between items-center mb-3">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 px-3 border rounded text-sm w-72"
        />
        <div className="space-x-3">
          <button onClick={selectAll} className="text-sm text-blue-800 hover:underline">Select All</button>
          <button onClick={clearSelection} className="text-sm text-gray-600 hover:underline">Clear</button>
          <button onClick={printClients} className="text-sm text-green-700 hover:underline">Print Selected</button>
          <CSVLink data={clients} filename="clients.csv" className="text-sm text-indigo-700 hover:underline">Export CSV</CSVLink>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-2">✔</th>
              <th className="p-2">Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Email</th>
              <th className="p-2">Type</th>
              <th className="p-2">Address</th>
              <th className="p-2">CNIC</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c) =>
              editingId === c._id ? (
                <tr key={c._id} className="border-t">
                  <td className="p-2">✏️</td>
                  <td><input className="border p-1 rounded" name="name" value={editForm.name} onChange={handleEditChange} /></td>
                  <td><input className="border p-1 rounded" name="phone" value={editForm.phone} onChange={handleEditChange} /></td>
                  <td><input className="border p-1 rounded" name="email" value={editForm.email} onChange={handleEditChange} /></td>
                  <td>
                    <select name="type" value={editForm.type} onChange={handleEditChange} className="border p-1 rounded">
                      <option>Retail</option>
                      <option>Wholesale</option>
                      <option>Other</option>
                    </select>
                  </td>
                  <td><input className="border p-1 rounded" name="address" value={editForm.address} onChange={handleEditChange} /></td>
                  <td><input className="border p-1 rounded" name="cnic" value={editForm.cnic} onChange={handleEditChange} /></td>
                  <td>
                    <button onClick={handleSaveEdit} className="text-green-600 hover:underline mr-2">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <input type="checkbox" checked={selectedIds.includes(c._id)} onChange={() => toggleSelect(c._id)} />
                  </td>
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.phone}</td>
                  <td className="p-2">{c.email}</td>
                  <td className="p-2">{c.type}</td>
                  <td className="p-2">{c.address}</td>
                  <td className="p-2">{c.cnic}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => handleEdit(c)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:underline">Delete</button>
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

export default Clients;
