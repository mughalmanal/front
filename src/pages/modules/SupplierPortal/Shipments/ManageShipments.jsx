import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageShipments.css';

const ManageShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentShipment, setCurrentShipment] = useState({
    shipmentNumber: '',
    vendor: '',
    date: '',
    status: 'Pending',
    trackingNumber: ''
  });

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://back-7-9sog.onrender.com/api/shipments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShipments(res.data);
      setFilteredShipments(res.data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    let result = shipments;

    if (statusFilter) {
      result = result.filter(s => s.status === statusFilter);
    }

    if (searchQuery) {
      result = result.filter(s =>
        s.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredShipments(result);
  }, [searchQuery, statusFilter, shipments]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shipment?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://back-7-9sog.onrender.com/api/shipments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchShipments();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (isEditing) {
        await axios.put(
          `https://back-7-9sog.onrender.com/api/shipments/${currentShipment._id}`,
          currentShipment,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `https://back-7-9sog.onrender.com/api/shipments`,
          currentShipment,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowModal(false);
      fetchShipments();
      setCurrentShipment({
        shipmentNumber: '',
        vendor: '',
        date: '',
        status: 'Pending',
        trackingNumber: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (shipment) => {
    setCurrentShipment(shipment);
    setIsEditing(true);
    setShowModal(true);
  };

  const openAdd = () => {
    setCurrentShipment({
      shipmentNumber: '',
      vendor: '',
      date: '',
      status: 'Pending',
      trackingNumber: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  return (
    <div className="manage-shipments">
      <h2 className="heading">Manage Shipments</h2>

      <div className="filters">
        <div className="search-wrapper">
          <label className="search-label">Search Shipment #</label>
          <input
            type="text"
            placeholder="Search by Shipment Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
          <option value="Returned">Returned</option>
        </select>

        <button onClick={openAdd} className="btn btn-add">+ Add Shipment</button>
      </div>

      <table className="shipment-table">
        <thead>
          <tr>
            <th>Shipment #</th>
            <th>Date</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Tracking</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredShipments.length === 0 ? (
            <tr><td colSpan="6">No shipments found.</td></tr>
          ) : (
            filteredShipments.map((s, index) => (
              <tr key={index}>
                <td>{s.shipmentNumber}</td>
                <td>{new Date(s.date).toLocaleDateString()}</td>
                <td>{s.vendor}</td>
                <td>
                  <span className={`status ${s.status.replace(/\s/g, '').toLowerCase()}`}>
                    {s.status}
                  </span>
                </td>
                <td>{s.trackingNumber}</td>
                <td>
                  <button className="btn btn-view" onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn btn-delete" onClick={() => handleDelete(s._id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-backdrop">
          <form className="modal-form" onSubmit={handleFormSubmit}>
            <h3>{isEditing ? 'Edit Shipment' : 'Add Shipment'}</h3>
            <input
              type="text"
              placeholder="Shipment Number"
              value={currentShipment.shipmentNumber}
              onChange={(e) => setCurrentShipment({ ...currentShipment, shipmentNumber: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Vendor"
              value={currentShipment.vendor}
              onChange={(e) => setCurrentShipment({ ...currentShipment, vendor: e.target.value })}
              required
            />
            <input
              type="date"
              value={currentShipment.date?.substring(0, 10)}
              onChange={(e) => setCurrentShipment({ ...currentShipment, date: e.target.value })}
              required
            />
            <select
              value={currentShipment.status}
              onChange={(e) => setCurrentShipment({ ...currentShipment, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
            </select>
            <input
              type="text"
              placeholder="Tracking Number"
              value={currentShipment.trackingNumber}
              onChange={(e) => setCurrentShipment({ ...currentShipment, trackingNumber: e.target.value })}
            />
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

export default ManageShipments;
