import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import './ManageAgreements.css';

const ManageAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState({
    agreementNumber: '',
    vendor: '',
    type: '',
    effectiveDate: '',
    expiryDate: '',
    status: 'Active',
    notes: '',
    file: null
  });

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://back-7-9sog.onrender.com/api/agreements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgreements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtering agreements by search and status
  const filtered = agreements.filter(a => {
    const matchesSearch =
      a.agreementNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export to PDF using jsPDF and autotable
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Agreements Report', 14, 14);
    autoTable(doc, {
      head: [['Agreement #', 'Vendor', 'Type', 'Start', 'End', 'Status']],
      body: filtered.map(a => [
        a.agreementNumber,
        a.vendor,
        a.type,
        a.effectiveDate,
        a.expiryDate,
        a.status
      ])
    });
    doc.save('agreements.pdf');
  };

  // Export to CSV using papaparse
  const handleExportCSV = () => {
    const csv = Papa.unparse(
      filtered.map(a => ({
        AgreementNumber: a.agreementNumber,
        Vendor: a.vendor,
        Type: a.type,
        EffectiveDate: a.effectiveDate,
        ExpiryDate: a.expiryDate,
        Status: a.status
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'agreements.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAdd = () => {
    setCurrent({
      agreementNumber: '',
      vendor: '',
      type: '',
      effectiveDate: '',
      expiryDate: '',
      status: 'Active',
      notes: '',
      file: null
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const openEdit = (a) => {
    setCurrent({ ...a, file: null }); // clear file on edit (user must re-upload if needed)
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this agreement?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://back-7-9sog.onrender.com/api/agreements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAgreements();
    } catch (err) {
      console.error(err);
      alert('Failed to delete agreement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();

    // Append form fields including file if uploaded
    for (const key in current) {
      if (key === 'file' && current.file) {
        formData.append('file', current.file);
      } else {
        formData.append(key, current[key]);
      }
    }

    try {
      if (isEditing) {
        await axios.put(
          `https://back-7-9sog.onrender.com/api/agreements/${current._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        await axios.post(
          `https://back-7-9sog.onrender.com/api/agreements`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
      }
      setModalVisible(false);
      fetchAgreements();
    } catch (err) {
      console.error(err);
      alert('Failed to save agreement');
    }
  };

  return (
    <div className="manage-agreements">
      <h2 className="heading">Manage Agreements</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by Agreement # or Vendor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
        </select>

        <button className="btn" onClick={handleExportPDF}>Export PDF</button>
        <button className="btn" onClick={handleExportCSV}>Export CSV</button>
        <button className="btn btn-add" onClick={openAdd}>+ Add Agreement</button>
      </div>

      <table className="agreements-table">
        <thead>
          <tr>
            <th>#</th><th>Vendor</th><th>Type</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a, i) => (
            <tr key={a._id || i}>
              <td>{a.agreementNumber}</td>
              <td>{a.vendor}</td>
              <td>{a.type}</td>
              <td>{a.effectiveDate}</td>
              <td>{a.expiryDate}</td>
              <td><span className={`status ${a.status.toLowerCase()}`}>{a.status}</span></td>
              <td>
                <button className="btn" onClick={() => openEdit(a)}>Edit</button>
                <button className="btn btn-delete" onClick={() => handleDelete(a._id)}>Delete</button>
                {a.fileUrl && (
                  <a href={a.fileUrl} target="_blank" rel="noreferrer" className="btn btn-view">
                    View PDF
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalVisible && (
        <div className="modal">
          <form onSubmit={handleSubmit} className="modal-form">
            <h3>{isEditing ? 'Edit Agreement' : 'Add Agreement'}</h3>

            <label>Agreement Number</label>
            <input
              type="text"
              value={current.agreementNumber}
              required
              onChange={(e) => setCurrent({ ...current, agreementNumber: e.target.value })}
            />

            <label>Vendor</label>
            <input
              type="text"
              value={current.vendor}
              required
              onChange={(e) => setCurrent({ ...current, vendor: e.target.value })}
            />

            <label>Type</label>
            <input
              type="text"
              value={current.type}
              required
              onChange={(e) => setCurrent({ ...current, type: e.target.value })}
            />

            <label>Effective Date</label>
            <input
              type="date"
              value={current.effectiveDate}
              required
              onChange={(e) => setCurrent({ ...current, effectiveDate: e.target.value })}
            />

            <label>Expiry Date</label>
            <input
              type="date"
              value={current.expiryDate}
              required
              onChange={(e) => setCurrent({ ...current, expiryDate: e.target.value })}
            />

            <label>Status</label>
            <select
              value={current.status}
              onChange={(e) => setCurrent({ ...current, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>

            <label>Notes (optional)</label>
            <textarea
              value={current.notes}
              onChange={(e) => setCurrent({ ...current, notes: e.target.value })}
            ></textarea>

            <label>Upload Agreement (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setCurrent({ ...current, file: e.target.files[0] })}
            />

            <div className="form-actions">
              <button type="submit" className="btn">Save</button>
              <button type="button" className="btn btn-cancel" onClick={() => setModalVisible(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageAgreements;
