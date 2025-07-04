import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";

const backendURL = "https://back-8.onrender.com/api/products"; // Update with your actual backend endpoint

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(backendURL);
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(backendURL, form);
      setProducts([res.data, ...products]);
      setForm({
        name: "",
        category: "",
        sku: "",
        quantity: "",
        purchasePrice: "",
        sellingPrice: "",
        description: "",
      });
      setPage(1);
    } catch (err) {
      console.error("Add error", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendURL}/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditForm(product);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`${backendURL}/${editingId}`, editForm);
      setProducts(products.map((p) => (p._id === editingId ? res.data : p)));
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error("Edit error", err);
    }
  };

  // Filtering
  const filtered = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  // Pagination slice
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Selection handlers
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(paginated.map((p) => p._id));
  const clearSelection = () => setSelectedIds([]);

  // Fancy PDF print with jsPDF autotable
  const printProducts = () => {
    const dataToPrint = products.filter((p) => selectedIds.includes(p._id));
    if (dataToPrint.length === 0) {
      alert("No products selected for printing.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor("#0c4a6e");
    doc.text("📦 Product Inventory Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor("#444");

    const tableColumn = ["Name", "Category", "SKU", "Qty", "Purchase Price", "Selling Price", "Description"];
    const tableRows = [];

    dataToPrint.forEach((p) => {
      const row = [
        p.name || "",
        p.category || "",
        p.sku || "",
        p.quantity || "",
        p.purchasePrice ? `Rs ${p.purchasePrice}` : "",
        p.sellingPrice ? `Rs ${p.sellingPrice}` : "",
        p.description || "",
      ];
      tableRows.push(row);
    });

    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: "#0c4a6e" },
      alternateRowStyles: { fillColor: "#f6f6f6" },
    });

    doc.save("products_report.pdf");
  };

  // CSV export filtered or all?
  // We'll export ALL products (you can filter on CSV yourself if needed)
  // If you want to export selected only, use products.filter by selectedIds

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Product & Stock Management</h2>

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

      {/* Search and Tools */}
      <div className="flex justify-between items-center mb-3">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-72"
        />
        <div className="space-x-3">
          <button onClick={selectAll} className="text-sm text-blue-800 hover:underline">
            Select All
          </button>
          <button onClick={clearSelection} className="text-sm text-gray-700 hover:underline">
            Clear Selection
          </button>
          <button onClick={printProducts} className="text-sm text-green-700 hover:underline">
            Print Selected
          </button>
          <CSVLink
            data={products}
            filename={"products_export.csv"}
            className="text-sm text-indigo-700 hover:underline"
          >
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-2">✔</th>
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
            {paginated.length > 0 ? (
              paginated.map((p) =>
                editingId === p._id ? (
                  <tr key={p._id} className="border-t">
                    <td className="p-2">✏️</td>
                    <td>
                      <input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      />
                    </td>
                    <td>
                      <input
                        name="category"
                        value={editForm.category}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      />
                    </td>
                    <td>
                      <input
                        name="sku"
                        value={editForm.sku}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      />
                    </td>
                    <td>
                      <input
                        name="quantity"
                        type="number"
                        value={editForm.quantity}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      />
                    </td>
                    <td>
                      <input
                        name="purchasePrice"
                        type="number"
                        value={editForm.purchasePrice}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      />
                    </td>
                    <td>
                      <input
                        name="sellingPrice"
                        type="number"
                        value={editForm.sellingPrice}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      />
                    </td>
                    <td>
                      <input
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
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
                  <tr
                    key={p._id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p._id)}
                        onChange={() => toggleSelect(p._id)}
                      />
                    </td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.category}</td>
                    <td className="p-2">{p.sku}</td>
                    <td className="p-2">{p.quantity}</td>
                    <td className="p-2">Rs {p.purchasePrice}</td>
                    <td className="p-2">Rs {p.sellingPrice}</td>
                    <td className="p-2">{p.description}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:underline"
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
                )
              )
            ) : (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">
                  No products found.
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
          Page {page} of {Math.ceil(filtered.length / pageSize)}
        </span>
        <button
          disabled={page * pageSize >= filtered.length}
          onClick={() => setPage(page + 1)}
          className="text-blue-700 hover:underline"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ProductManagement;
