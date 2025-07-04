import React, { useState } from "react";

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleAddEntry = (e) => {
    e.preventDefault();
    const newEntry = { ...form, id: Date.now().toString() };
    setStockInList([newEntry, ...stockInList]);
    setForm({
      productName: "",
      quantity: "",
      supplier: "",
      date: "",
      notes: "",
    });
  };

  const handleDelete = (id) =>
    setStockInList(stockInList.filter((item) => item.id !== id));

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditForm(entry);
  };

  const handleSaveEdit = () => {
    setStockInList(
      stockInList.map((item) =>
        item.id === editingId ? { ...editForm } : item
      )
    );
    setEditingId(null);
    setEditForm({});
  };

  const filtered = stockInList.filter(
    (entry) =>
      entry.productName.toLowerCase().includes(search.toLowerCase()) ||
      entry.supplier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Stock In</h2>

      {/* Add Entry Form */}
      <form onSubmit={handleAddEntry} className="grid md:grid-cols-3 gap-4 mb-6">
        <input name="productName" value={form.productName} onChange={handleChange} placeholder="Product Name" className="p-2 border rounded" required />
        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Quantity" className="p-2 border rounded" required />
        <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier" className="p-2 border rounded" />
        <input name="date" type="date" value={form.date} onChange={handleChange} className="p-2 border rounded" required />
        <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="p-2 border rounded" />
        <button type="submit" className="bg-blue-900 text-white rounded px-4 py-2 hover:bg-blue-800 col-span-1">
          Add Entry
        </button>
      </form>

      {/* Search */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-blue-800">Stock In Entries</h3>
        <input
          type="text"
          placeholder="Search by product or supplier..."
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
              <th className="p-2">Product</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Supplier</th>
              <th className="p-2">Date</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((entry) => (
                <tr key={entry.id} className="border-t hover:bg-gray-50">
                  {editingId === entry.id ? (
                    <>
                      <td className="p-1">
                        <input className="border p-1 rounded" name="productName" value={editForm.productName} onChange={handleEditChange} />
                      </td>
                      <td className="p-1">
                        <input className="border p-1 rounded" name="quantity" value={editForm.quantity} onChange={handleEditChange} />
                      </td>
                      <td className="p-1">
                        <input className="border p-1 rounded" name="supplier" value={editForm.supplier} onChange={handleEditChange} />
                      </td>
                      <td className="p-1">
                        <input className="border p-1 rounded" name="date" value={editForm.date} onChange={handleEditChange} />
                      </td>
                      <td className="p-1">
                        <input className="border p-1 rounded" name="notes" value={editForm.notes} onChange={handleEditChange} />
                      </td>
                      <td className="p-2 space-x-2">
                        <button onClick={handleSaveEdit} className="text-green-600 hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-600 hover:underline">Cancel</button>
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
                        <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:underline">Delete</button>
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
    </div>
  );
}

export default StockIn;
