import React, { useState } from "react";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    sku: "",
    quantity: "",
    purchasePrice: "",
    sellingPrice: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleAddProduct = (e) => {
    e.preventDefault();
    const newProduct = { ...form, id: Date.now().toString() };
    setProducts([newProduct, ...products]);
    setForm({
      name: "",
      category: "",
      sku: "",
      quantity: "",
      purchasePrice: "",
      sellingPrice: "",
      description: "",
    });
  };

  const handleDelete = (id) =>
    setProducts(products.filter((p) => p.id !== id));

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const handleSaveEdit = () => {
    setProducts(
      products.map((p) => (p.id === editingId ? { ...editForm } : p))
    );
    setEditingId(null);
    setEditForm({});
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <h2 className="text-xl font-bold text-blue-900 mb-4">
        Product & Stock Management
      </h2>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="grid md:grid-cols-3 gap-4 mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" className="p-2 border rounded" required />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="p-2 border rounded" />
        <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU / Code" className="p-2 border rounded" />
        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Quantity" className="p-2 border rounded" />
        <input name="purchasePrice" type="number" value={form.purchasePrice} onChange={handleChange} placeholder="Purchase Price" className="p-2 border rounded" />
        <input name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange} placeholder="Selling Price" className="p-2 border rounded" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="p-2 border rounded col-span-2" />
        <button type="submit" className="bg-blue-900 text-white rounded px-4 py-2 hover:bg-blue-800 col-span-1">
          Add Product
        </button>
      </form>

      {/* Search */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-blue-800">Product List</h3>
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-1 px-2 border rounded text-sm w-64"
        />
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Purchase</th>
              <th className="p-2">Selling</th>
              <th className="p-2">Description</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  {editingId === p.id ? (
                    <>
                      <td className="p-1"><input className="border p-1 rounded" name="name" value={editForm.name} onChange={handleEditChange} /></td>
                      <td className="p-1"><input className="border p-1 rounded" name="category" value={editForm.category} onChange={handleEditChange} /></td>
                      <td className="p-1"><input className="border p-1 rounded" name="sku" value={editForm.sku} onChange={handleEditChange} /></td>
                      <td className="p-1"><input className="border p-1 rounded" name="quantity" value={editForm.quantity} onChange={handleEditChange} /></td>
                      <td className="p-1"><input className="border p-1 rounded" name="purchasePrice" value={editForm.purchasePrice} onChange={handleEditChange} /></td>
                      <td className="p-1"><input className="border p-1 rounded" name="sellingPrice" value={editForm.sellingPrice} onChange={handleEditChange} /></td>
                      <td className="p-1"><input className="border p-1 rounded" name="description" value={editForm.description} onChange={handleEditChange} /></td>
                      <td className="p-2 space-x-2">
                        <button onClick={handleSaveEdit} className="text-green-600 hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-600 hover:underline">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{p.name}</td>
                      <td className="p-2">{p.category}</td>
                      <td className="p-2">{p.sku}</td>
                      <td className="p-2">{p.quantity}</td>
                      <td className="p-2">Rs {p.purchasePrice}</td>
                      <td className="p-2">Rs {p.sellingPrice}</td>
                      <td className="p-2">{p.description}</td>
                      <td className="p-2 space-x-2">
                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductManagement;
