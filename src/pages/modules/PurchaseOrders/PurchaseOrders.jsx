import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";

const backendURL = "https://back-8.onrender.com/api/purchaseOrders"; // Update with your backend API

function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    supplier: "",
    product: "",
    quantity: "",
    price: "",
    orderDate: "",
    deliveryDate: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(backendURL);
      setOrders(res.data);
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleAddOrder = async (e) => {
    e.preventDefault();
    try {
      const newOrderData = {
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price),
        total: Number(form.quantity) * Number(form.price),
      };
      const res = await axios.post(backendURL, newOrderData);
      setOrders([res.data, ...orders]);
      setForm({
        supplier: "",
        product: "",
        quantity: "",
        price: "",
        orderDate: "",
        deliveryDate: "",
        notes: "",
      });
      setPage(1);
    } catch (error) {
      console.error("Add error", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendURL}/${id}`);
      setOrders(orders.filter((order) => order._id !== id));
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  const handleEdit = (order) => {
    setEditingId(order._id);
    setEditForm(order);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedOrder = {
        ...editForm,
        quantity: Number(editForm.quantity),
        price: Number(editForm.price),
        total: Number(editForm.quantity) * Number(editForm.price),
      };
      const res = await axios.put(`${backendURL}/${editingId}`, updatedOrder);
      setOrders(orders.map((order) => (order._id === editingId ? res.data : order)));
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error("Edit error", error);
    }
  };

  // Filter orders by supplier or product
  const filteredOrders = orders.filter(
    (o) =>
      (o.supplier || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.product || "").toLowerCase().includes(search.toLowerCase())
  );

  // Pagination slice
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  // Selection logic
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(paginatedOrders.map((o) => o._id));
  const clearSelection = () => setSelectedIds([]);

  // Print selected orders as PDF
  const printOrders = () => {
    const dataToPrint = orders.filter((o) => selectedIds.includes(o._id));
    if (dataToPrint.length === 0) {
      alert("No orders selected for printing.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor("#0c4a6e");
    doc.text("🛒 Purchase Orders Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor("#444");

    const tableColumn = [
      "Supplier",
      "Product",
      "Quantity",
      "Price",
      "Total",
      "Order Date",
      "Delivery Date",
      "Notes",
    ];
    const tableRows = [];

    dataToPrint.forEach((o) => {
      const row = [
        o.supplier || "",
        o.product || "",
        o.quantity || "",
        o.price ? `Rs ${o.price}` : "",
        o.total ? `Rs ${o.total}` : "",
        o.orderDate || "",
        o.deliveryDate || "",
        o.notes || "",
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

    doc.save("purchase_orders_report.pdf");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Purchase Orders</h2>

      {/* Add Order Form */}
      <form onSubmit={handleAddOrder} className="grid md:grid-cols-3 gap-4 mb-6">
        <input
          name="supplier"
          value={form.supplier}
          onChange={handleChange}
          placeholder="Supplier"
          className="p-2 border rounded"
          required
        />
        <input
          name="product"
          value={form.product}
          onChange={handleChange}
          placeholder="Product"
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
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price per unit"
          className="p-2 border rounded"
          required
        />

        <div className="flex flex-col">
          <label className="text-sm text-blue-800 mb-1">Order Date</label>
          <input
            name="orderDate"
            type="date"
            value={form.orderDate}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-blue-800 mb-1">Delivery Date</label>
          <input
            name="deliveryDate"
            type="date"
            value={form.deliveryDate}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>

        <input
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes"
          className="p-2 border rounded col-span-2"
        />
        <button
          type="submit"
          className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Add Order
        </button>
      </form>

      {/* Search and tools */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-blue-800">Purchase Orders List</h3>
        <input
          type="text"
          placeholder="Search by supplier or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-64"
        />
        <div className="space-x-3">
          <button onClick={selectAll} className="text-sm text-blue-800 hover:underline">
            Select All
          </button>
          <button onClick={clearSelection} className="text-sm text-gray-700 hover:underline">
            Clear Selection
          </button>
          <button onClick={printOrders} className="text-sm text-green-700 hover:underline">
            Print Selected
          </button>
          <CSVLink
            data={orders}
            filename={"purchase_orders_export.csv"}
            className="text-sm text-indigo-700 hover:underline"
          >
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-2">✔</th>
              <th className="p-2">Supplier</th>
              <th className="p-2">Product</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Price</th>
              <th className="p-2">Total</th>
              <th className="p-2">Order Date</th>
              <th className="p-2">Delivery Date</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) =>
                editingId === order._id ? (
                  <tr key={order._id} className="border-t">
                    <td className="p-2">✏️</td>
                    <td>
                      <input
                        className="border p-1 rounded"
                        name="supplier"
                        value={editForm.supplier}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      <input
                        className="border p-1 rounded"
                        name="product"
                        value={editForm.product}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="border p-1 rounded"
                        name="quantity"
                        value={editForm.quantity}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="border p-1 rounded"
                        name="price"
                        value={editForm.price}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td className="p-1 text-center font-semibold text-blue-900">
                      Rs {Number(editForm.quantity) * Number(editForm.price)}
                    </td>
                    <td>
                      <input
                        type="date"
                        className="border p-1 rounded"
                        name="orderDate"
                        value={editForm.orderDate}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="border p-1 rounded"
                        name="deliveryDate"
                        value={editForm.deliveryDate}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
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
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order._id)}
                        onChange={() => toggleSelect(order._id)}
                      />
                    </td>
                    <td className="p-2">{order.supplier}</td>
                    <td className="p-2">{order.product}</td>
                    <td className="p-2">{order.quantity}</td>
                    <td className="p-2">Rs {order.price}</td>
                    <td className="p-2 font-semibold text-blue-900">Rs {order.total}</td>
                    <td className="p-2">{order.orderDate}</td>
                    <td className="p-2">{order.deliveryDate}</td>
                    <td className="p-2">{order.notes}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handleEdit(order)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(order._id)}
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
                <td colSpan="10" className="p-4 text-center text-gray-500">
                  No purchase orders found.
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
          Page {page} of {Math.ceil(filteredOrders.length / pageSize)}
        </span>
        <button
          disabled={page * pageSize >= filteredOrders.length}
          onClick={() => setPage(page + 1)}
          className="text-blue-700 hover:underline"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PurchaseOrders;
