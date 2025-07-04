import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageSchedules.css';

const ManageSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState({
    scheduleNumber: '',
    vendor: '',
    deliveryDate: '',
    status: 'Scheduled',
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

  const filteredSchedules = schedules.filter(schedule =>
    schedule.scheduleNumber.toLowerCase().includes(search.toLowerCase()) ||
    schedule.vendor.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setCurrentSchedule({
      scheduleNumber: '',
      vendor: '',
      deliveryDate: '',
      status: 'Scheduled',
      notes: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEdit = (schedule) => {
    setCurrentSchedule(schedule);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
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
          `https://back-7-9sog.onrender.com/api/schedules/${currentSchedule._id}`,
          currentSchedule,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `https://back-7-9sog.onrender.com/api/schedules`,
          currentSchedule,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowModal(false);
      fetchSchedules();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="manage-schedules">
      <h2 className="heading">Manage Schedules</h2>

      <div className="schedule-controls">
        <input
          type="text"
          placeholder="Search by Schedule # or Vendor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="refresh-btn" onClick={fetchSchedules}>⟳ Refresh</button>
        <button className="btn btn-add" onClick={openAdd}>+ Add Schedule</button>
      </div>

      <table className="schedule-table">
        <thead>
          <tr>
            <th>Schedule #</th>
            <th>Vendor</th>
            <th>Delivery Date</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchedules.length === 0 ? (
            <tr>
              <td colSpan="6">No schedules found.</td>
            </tr>
          ) : (
            filteredSchedules.map((s, idx) => (
              <tr key={idx}>
                <td>{s.scheduleNumber}</td>
                <td>{s.vendor}</td>
                <td>{new Date(s.deliveryDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${s.status?.toLowerCase().replace(/\s/g, '')}`}>
                    {s.status}
                  </span>
                </td>
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
            <h3>{isEditing ? 'Edit Schedule' : 'Add Schedule'}</h3>

            <input
              type="text"
              placeholder="Schedule Number"
              value={currentSchedule.scheduleNumber}
              onChange={(e) => setCurrentSchedule({ ...currentSchedule, scheduleNumber: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Vendor"
              value={currentSchedule.vendor}
              onChange={(e) => setCurrentSchedule({ ...currentSchedule, vendor: e.target.value })}
              required
            />

            <input
              type="date"
              value={currentSchedule.deliveryDate?.substring(0, 10)}
              onChange={(e) => setCurrentSchedule({ ...currentSchedule, deliveryDate: e.target.value })}
              required
            />

            <select
              value={currentSchedule.status}
              onChange={(e) => setCurrentSchedule({ ...currentSchedule, status: e.target.value })}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
            </select>

            <textarea
              rows="3"
              placeholder="Notes (optional)"
              value={currentSchedule.notes}
              onChange={(e) => setCurrentSchedule({ ...currentSchedule, notes: e.target.value })}
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

export default ManageSchedules;
