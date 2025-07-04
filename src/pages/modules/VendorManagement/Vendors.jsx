import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    gst: "",
    address: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const printRef = useRef();
  const backendURL = "https://back-7-9sog.onrender.com";

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/vendors`);
      setVendors(res.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleAddVendor = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.company)
      return alert("Name, company, and phone are required.");

    try {
      const res = await axios.post(`${backendURL}/api/vendors`, form);
      setVendors([res.data, ...vendors]);
      setForm({
        name: "",
        company: "",
        phone: "",
        email: "",
        gst: "",
        address: "",
      });
    } catch (err) {
      console.error("Error adding vendor:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendURL}/api/vendors/${id}`);
      setVendors(vendors.filter((v) => v._id !== id));
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } catch (err) {
      console.error("Error deleting vendor:", err);
    }
  };

  const handleEdit = (vendor) => {
    setEditingId(vendor._id);
    setEditForm(vendor);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`${backendURL}/api/vendors/${editingId}`, editForm);
      setVendors(vendors.map((v) => (v._id === editingId ? res.data : v)));
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error("Error updating vendor:", err);
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((v) => v._id));
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=900,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Vendors</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { color: #0a2e5c; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; border: 1px solid #ccc; }
            th { background: #e2e8f0; }
            tr:nth-child(even) { background: #f9fafb; }
          </style>
        </head>
        <body>
          <h2>Vendor List</h2>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.company.toLowerCase().includes(search.toLowerCase())
  );

  const vendorsToPrint = selectedIds.length > 0
    ? vendors.filter((v) => selectedIds.includes(v._id))
    : vendors;

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Vendor Management</h2>

      {/* Form */}
      <form onSubmit={handleAddVendor} className="grid md:grid-cols-3 gap-4 mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="p-2 border rounded" required />
        <input name="company" value={form.company} onChange={handleChange} placeholder="Company Name" className="p-2 border rounded" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="p-2 border rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded" />
        <input name="gst" value={form.gst} onChange={handleChange} placeholder="GST / CNIC" className="p-2 border rounded" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="p-2 border rounded col-span-2" />
        <button type="submit" className="bg-blue-900 text-white rounded px-4 py-2 hover:bg-blue-800 col-span-1">
          Add Vendor
        </button>
      </form>

      {/* Top Actions */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={handlePrint}
          className="bg-blue-900 text-white px-4 py-1.5 text-sm rounded hover:bg-blue-800"
        >
          Print {selectedIds.length > 0 ? "Selected" : "All"}
        </button>

        <input
          type="text"
          placeholder="Search by name or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-1 px-2 border rounded text-sm w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-blue-800 py-4">Loading vendors...</div>
        ) : (
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="p-2">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                  />
                </th>
                <th className="p-2">Name</th>
                <th className="p-2">Company</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Email</th>
                <th className="p-2">GST / CNIC</th>
                <th className="p-2">Address</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((v) => (
                  <tr key={v._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(v._id)}
                        onChange={() => handleSelect(v._id)}
                      />
                    </td>
                    {editingId === v._id ? (
                      <>
                        <td className="p-1"><input className="border p-1 rounded" name="name" value={editForm.name} onChange={handleEditChange} /></td>
                        <td className="p-1"><input className="border p-1 rounded" name="company" value={editForm.company} onChange={handleEditChange} /></td>
                        <td className="p-1"><input className="border p-1 rounded" name="phone" value={editForm.phone} onChange={handleEditChange} /></td>
                        <td className="p-1"><input className="border p-1 rounded" name="email" value={editForm.email} onChange={handleEditChange} /></td>
                        <td className="p-1"><input className="border p-1 rounded" name="gst" value={editForm.gst} onChange={handleEditChange} /></td>
                        <td className="p-1"><input className="border p-1 rounded" name="address" value={editForm.address} onChange={handleEditChange} /></td>
                        <td className="p-2 space-x-2">
                          <button onClick={handleSaveEdit} className="text-green-600 hover:underline">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-600 hover:underline">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{v.name}</td>
                        <td className="p-2">{v.company}</td>
                        <td className="p-2">{v.phone}</td>
                        <td className="p-2">{v.email}</td>
                        <td className="p-2">{v.gst}</td>
                        <td className="p-2">{v.address}</td>
                        <td className="p-2 space-x-2">
                          <button onClick={() => handleEdit(v)} className="text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => handleDelete(v._id)} className="text-red-600 hover:underline">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">No vendors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Hidden printable area */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Company</th><th>Phone</th>
                <th>Email</th><th>GST / CNIC</th><th>Address</th>
              </tr>
            </thead>
            <tbody>
              {vendorsToPrint.map((v) => (
                <tr key={v._id}>
                  <td>{v.name}</td>
                  <td>{v.company}</td>
                  <td>{v.phone}</td>
                  <td>{v.email}</td>
                  <td>{v.gst}</td>
                  <td>{v.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Vendors;
