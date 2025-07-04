import React, { useState } from "react";

function Vendors() {
  const [vendors, setVendors] = useState([]);
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleAddVendor = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.company)
      return alert("Name, company, and phone are required.");

    const newVendor = { ...form, id: Date.now().toString() };
    setVendors([newVendor, ...vendors]);
    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      gst: "",
      address: "",
    });
  };

  const handleDelete = (id) =>
    setVendors(vendors.filter((v) => v.id !== id));

  const handleEdit = (vendor) => {
    setEditingId(vendor.id);
    setEditForm(vendor);
  };

  const handleSaveEdit = () => {
    setVendors(
      vendors.map((v) => (v.id === editingId ? { ...editForm } : v))
    );
    setEditingId(null);
    setEditForm({});
  };

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.company.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Search */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-blue-800">Vendor List</h3>
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
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
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
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  {editingId === v.id ? (
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
                        <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">No vendors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Vendors;
