import React, { useState } from "react";

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleAddOrder = (e) => {
    e.preventDefault();
    const newOrder = {
      ...form,
      id: Date.now(),
      total: Number(form.quantity) * Number(form.price),
    };
    setOrders([newOrder, ...orders]);
    setForm({
      supplier: "",
      product: "",
      quantity: "",
      price: "",
      orderDate: "",
      deliveryDate: "",
      notes: "",
    });
  };

  const handleDelete = (id) =>
    setOrders(orders.filter((order) => order.id !== id));

  const handleEdit = (order) => {
    setEditingId(order.id);
    setEditForm(order);
  };

  const handleSaveEdit = () => {
    setOrders(
      orders.map((order) =>
        order.id === editingId
          ? {
              ...editForm,
              total:
                Number(editForm.quantity) * Number(editForm.price),
            }
          : order
      )
    );
    setEditingId(null);
    setEditForm({});
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.supplier.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Purchase Orders</h2>

      {/* Add Order Form */}
      <form
        onSubmit={handleAddOrder}
        className="grid md:grid-cols-3 gap-4 mb-6"
      >
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

      {/* Search */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-blue-800">
          Purchase Orders List
        </h3>
        <input
          type="text"
          placeholder="Search by supplier or product..."
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  {editingId === order.id ? (
                    <>
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
                          name="product"
                          value={editForm.product}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          className="border p-1 rounded"
                          name="quantity"
                          value={editForm.quantity}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          className="border p-1 rounded"
                          name="price"
                          value={editForm.price}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td className="p-1 text-center font-semibold text-blue-900">
                        {Number(editForm.quantity) * Number(editForm.price)}
                      </td>
                      <td className="p-1">
                        <input
                          className="border p-1 rounded"
                          name="orderDate"
                          type="date"
                          value={editForm.orderDate}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          className="border p-1 rounded"
                          name="deliveryDate"
                          type="date"
                          value={editForm.deliveryDate}
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
                      <td className="p-2">{order.supplier}</td>
                      <td className="p-2">{order.product}</td>
                      <td className="p-2">{order.quantity}</td>
                      <td className="p-2">Rs {order.price}</td>
                      <td className="p-2 font-semibold text-blue-900">
                        Rs {order.total}
                      </td>
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
                          onClick={() => handleDelete(order.id)}
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
                <td colSpan="9" className="p-4 text-center text-gray-500">
                  No purchase orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PurchaseOrders;
