import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageOrders.css';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({
    orderNumber: '',
    vendor: '',
    date: '',
    status: 'Pending',
    items: '',
    clientName: ''
  });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://back-7-9sog.onrender.com/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setCurrentOrder({
      orderNumber: '',
      vendor: '',
      date: '',
      status: 'Pending',
      items: '',
      clientName: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEdit = (order) => {
    setCurrentOrder({
      ...order,
      items: order.items?.join(', ') || '',
      clientName: order.clientName || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://back-7-9sog.onrender.com/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = {
      ...currentOrder,
      items: currentOrder.items.split(',').map(i => i.trim())
    };

    try {
      if (isEditing) {
        await axios.put(
          `https://back-7-9sog.onrender.com/api/orders/${currentOrder._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `https://back-7-9sog.onrender.com/api/orders`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="manage-orders">
      <h2 className="heading">Manage Orders</h2>

      <div className="order-controls">
        <input
          type="text"
          placeholder="Search by Order Number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="refresh-btn" onClick={fetchOrders}>⟳ Refresh</button>
        <button className="btn btn-add" onClick={openAdd}>+ Add Order</button>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Date</th>
            <th>Vendor</th>
            <th>Client</th>
            <th>Status</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="7">No orders found.</td>
            </tr>
          ) : (
            filteredOrders.map((order, idx) => (
              <tr key={idx}>
                <td>{order.orderNumber}</td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>{order.vendor}</td>
                <td>{order.clientName || '-'}</td>
                <td>
                  <span className={`status ${order.status?.toLowerCase().replace(/\s/g, '')}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.items?.length}</td>
                <td>
                  <button className="btn btn-view" onClick={() => openEdit(order)}>Edit</button>
                  <button className="btn btn-delete" onClick={() => handleDelete(order._id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-backdrop">
          <form className="modal-form" onSubmit={handleSubmit}>
            <h3>{isEditing ? 'Edit Order' : 'Add Order'}</h3>

            <input
              type="text"
              placeholder="Order Number"
              value={currentOrder.orderNumber}
              onChange={(e) => setCurrentOrder({ ...currentOrder, orderNumber: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Vendor Name"
              value={currentOrder.vendor}
              onChange={(e) => setCurrentOrder({ ...currentOrder, vendor: e.target.value })}
              required
            />

            <input
              type="date"
              value={currentOrder.date?.substring(0, 10)}
              onChange={(e) => setCurrentOrder({ ...currentOrder, date: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Client Name (optional)"
              value={currentOrder.clientName}
              onChange={(e) => setCurrentOrder({ ...currentOrder, clientName: e.target.value })}
            />

            <select
              value={currentOrder.status}
              onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <textarea
              rows="3"
              placeholder="Items (comma separated)"
              value={currentOrder.items}
              onChange={(e) => setCurrentOrder({ ...currentOrder, items: e.target.value })}
              required
            ></textarea>

            <div className="modal-actions">
              <button type="submit" className="btn btn-save">Save</button>
              <button type="button" className="btn btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
