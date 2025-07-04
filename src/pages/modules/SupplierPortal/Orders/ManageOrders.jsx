import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageOrders.css";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({
    orderNumber: "",
    vendor: "",
    date: "",
    status: "Pending",
    items: "",
    clientName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // Fetch orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        "https://back-7-9sog.onrender.com/api/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(res.data);
    } catch (err) {
      setError("Failed to load orders.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by orderNumber (case-insensitive)
  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  // Open Add Order modal
  const openAdd = () => {
    setCurrentOrder({
      orderNumber: "",
      vendor: "",
      date: "",
      status: "Pending",
      items: "",
      clientName: "",
    });
    setIsEditing(false);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  // Open Edit Order modal
  const openEdit = (order) => {
    setCurrentOrder({
      ...order,
      items: order.items?.join(", ") || "",
      clientName: order.clientName || "",
    });
    setIsEditing(true);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  // Delete order with confirmation and backend call
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(
        `https://back-7-9sog.onrender.com/api/orders/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Order deleted successfully.");
      fetchOrders();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete order.");
      console.error(err);
    }
  };

  // Handle form submission (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (
      !currentOrder.orderNumber.trim() ||
      !currentOrder.vendor.trim() ||
      !currentOrder.date ||
      !currentOrder.items.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const payload = {
      ...currentOrder,
      items: currentOrder.items.split(",").map((i) => i.trim()),
    };

    try {
      if (isEditing) {
        await axios.put(
          `https://back-7-9sog.onrender.com/api/orders/${currentOrder._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Order updated successfully.");
      } else {
        await axios.post(
          "https://back-7-9sog.onrender.com/api/orders",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Order added successfully.");
      }
      setShowModal(false);
      fetchOrders();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to submit order.");
      console.error(err);
    }
  };

  return (
    <div className="manage-orders max-w-7xl mx-auto p-6 bg-white rounded-xl shadow border border-blue-100">
      <h2 className="heading text-2xl font-bold text-blue-900 mb-6">Manage Orders</h2>

      <div className="order-controls flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by Order Number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-blue-300 rounded px-4 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          className="refresh-btn bg-blue-100 text-blue-900 px-4 py-2 rounded shadow hover:bg-blue-200"
          onClick={fetchOrders}
          disabled={loading}
        >
          ⟳ Refresh
        </button>
        <button
          className="btn btn-add bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          onClick={openAdd}
        >
          + Add Order
        </button>
      </div>

      {loading ? (
        <p className="text-blue-700 font-semibold text-center">Loading...</p>
      ) : (
        <>
          {error && <p className="text-red-600 mb-3 text-center font-semibold">{error}</p>}
          {success && <p className="text-green-600 mb-3 text-center font-semibold">{success}</p>}

          <table className="order-table w-full border border-blue-200 rounded shadow-sm">
            <thead className="bg-blue-100 text-blue-900 font-semibold">
              <tr>
                <th className="p-3 border-r border-blue-200">Order #</th>
                <th className="p-3 border-r border-blue-200">Date</th>
                <th className="p-3 border-r border-blue-200">Vendor</th>
                <th className="p-3 border-r border-blue-200">Client</th>
                <th className="p-3 border-r border-blue-200">Status</th>
                <th className="p-3 border-r border-blue-200">Items Count</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-t border-blue-200">
                    <td className="p-3 border-r border-blue-200">{order.orderNumber}</td>
                    <td className="p-3 border-r border-blue-200">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 border-r border-blue-200">{order.vendor}</td>
                    <td className="p-3 border-r border-blue-200">{order.clientName || "-"}</td>
                    <td className="p-3 border-r border-blue-200">
                      <span
                        className={`status ${order.status
                          ?.toLowerCase()
                          .replace(/\s/g, "")}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 border-r border-blue-200">
                      {order.items?.length || 0}
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        className="btn btn-view text-blue-700 hover:underline"
                        onClick={() => openEdit(order)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete text-red-600 hover:underline"
                        onClick={() => handleDelete(order._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            className="modal-form bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg"
            onSubmit={handleSubmit}
          >
            <h3 className="text-xl font-bold mb-4 text-blue-800">
              {isEditing ? "Edit Order" : "Add Order"}
            </h3>

            {error && <p className="text-red-600 mb-3 font-semibold">{error}</p>}
            {success && <p className="text-green-600 mb-3 font-semibold">{success}</p>}

            <input
              type="text"
              placeholder="Order Number"
              value={currentOrder.orderNumber}
              onChange={(e) =>
                setCurrentOrder({ ...currentOrder, orderNumber: e.target.value })
              }
              required
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              placeholder="Vendor Name"
              value={currentOrder.vendor}
              onChange={(e) =>
                setCurrentOrder({ ...currentOrder, vendor: e.target.value })
              }
              required
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="date"
              value={currentOrder.date?.substring(0, 10)}
              onChange={(e) =>
                setCurrentOrder({ ...currentOrder, date: e.target.value })
              }
              required
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              placeholder="Client Name (optional)"
              value={currentOrder.clientName}
              onChange={(e) =>
                setCurrentOrder({ ...currentOrder, clientName: e.target.value })
              }
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <select
              value={currentOrder.status}
              onChange={(e) =>
                setCurrentOrder({ ...currentOrder, status: e.target.value })
              }
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <textarea
              rows="3"
              placeholder="Items (comma separated)"
              value={currentOrder.items}
              onChange={(e) =>
                setCurrentOrder({ ...currentOrder, items: e.target.value })
              }
              required
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>

            <div className="modal-actions flex justify-end space-x-3">
              <button
                type="submit"
                className="btn btn-save bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-cancel text-gray-600 hover:underline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
