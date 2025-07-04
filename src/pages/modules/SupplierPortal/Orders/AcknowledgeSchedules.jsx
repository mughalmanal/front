import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AcknowledgeSchedules.css';

const AcknowledgeSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState({
    scheduleNumber: '',
    vendor: '',
    deliveryDate: '',
    status: 'Scheduled',
    acknowledgedBy: '',
    notes: ''
  });

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://back-7-9sog.onrender.com/api/schedules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(res.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const filtered = schedules.filter(s =>
    s.scheduleNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.vendor.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setCurrent({
      scheduleNumber: '',
      vendor: '',
      deliveryDate: '',
      status: 'Scheduled',
      acknowledgedBy: '',
      notes: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEdit = (data) => {
    setCurrent(data);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://back-7-9sog.onrender.com/api/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSchedules();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (isEditing) {
        await axios.put(
          `https://back-7-9sog.onrender.com/api/schedules/${current._id}`,
          current,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `https://back-7-9sog.onrender.com/api/schedules`,
          current,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowModal(false);
      fetchSchedules();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Acknowledged Schedules Report', 14, 14);
    autoTable(doc, {
      head: [['Schedule #', 'Vendor', 'Date', 'Status', 'By', 'Notes']],
      body: filtered.map(s => [
        s.scheduleNumber,
        s.vendor,
        new Date(s.deliveryDate).toLocaleDateString(),
        s.status,
        s.acknowledgedBy || '-',
        s.notes || '-'
      ])
    });
    doc.save('Acknowledged_Schedules.pdf');
  };

  return (
    <div className="ack-schedules">
      <h2 className="heading">Acknowledge Schedules</h2>

      <div className="ack-controls">
        <input
          type="text"
          placeholder="Search Schedule or Vendor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-refresh" onClick={fetchSchedules}>⟳ Refresh</button>
        <button className="btn btn-export" onClick={exportPDF}>⬇ Export to PDF</button>
        <button className="btn btn-add" onClick={openAdd}>+ Add Schedule</button>
      </div>

      <table className="ack-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Vendor</th>
            <th>Date</th>
            <th>Status</th>
            <th>Acknowledged By</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="7">No schedules found.</td></tr>
          ) : (
            filtered.map((s, i) => (
              <tr key={i}>
                <td>{s.scheduleNumber}</td>
                <td>{s.vendor}</td>
                <td>{new Date(s.deliveryDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${s.status.toLowerCase()}`}>{s.status}</span>
                </td>
                <td>{s.acknowledgedBy || '-'}</td>
                <td>{s.notes || '-'}</td>
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
          <form className="modal-form" onSubmit={handleSubmit}>
            <h3>{isEditing ? 'Edit' : 'Add'} Schedule</h3>

            <input
              type="text"
              placeholder="Schedule Number"
              value={current.scheduleNumber}
              onChange={(e) => setCurrent({ ...current, scheduleNumber: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Vendor"
              value={current.vendor}
              onChange={(e) => setCurrent({ ...current, vendor: e.target.value })}
              required
            />

            <input
              type="date"
              value={current.deliveryDate?.substring(0, 10)}
              onChange={(e) => setCurrent({ ...current, deliveryDate: e.target.value })}
              required
            />

            <select
              value={current.status}
              onChange={(e) => setCurrent({ ...current, status: e.target.value })}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
            </select>

            <input
              type="text"
              placeholder="Acknowledged By (optional)"
              value={current.acknowledgedBy}
              onChange={(e) => setCurrent({ ...current, acknowledgedBy: e.target.value })}
            />

            <textarea
              rows="3"
              placeholder="Notes (optional)"
              value={current.notes}
              onChange={(e) => setCurrent({ ...current, notes: e.target.value })}
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

export default AcknowledgeSchedules;
