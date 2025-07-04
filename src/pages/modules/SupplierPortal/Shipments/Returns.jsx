import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState({
    returnNumber: '',
    shipmentNumber: '',
    returnDate: '',
    quantity: '',
    reason: '',
    refundRequested: false,
  });

  const token = localStorage.getItem('token');

  const fetchReturns = async () => {
    const res = await axios.get('https://back-7-9sog.onrender.com/api/returns', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReturns(res.data);
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const filtered = returns.filter(r =>
    r.returnNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(
          `https://back-7-9sog.onrender.com/api/returns/${current._id}`,
          current,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `https://back-7-9sog.onrender.com/api/returns`,
          current,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchReturns();
      setShowModal(false);
      setCurrent({
        returnNumber: '',
        shipmentNumber: '',
        returnDate: '',
        quantity: '',
        reason: '',
        refundRequested: false,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving return:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this return?')) return;
    await axios.delete(`https://back-7-9sog.onrender.com/api/returns/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchReturns();
  };

  const openAdd = () => {
    setIsEditing(false);
    setCurrent({
      returnNumber: '',
      shipmentNumber: '',
      returnDate: '',
      quantity: '',
      reason: '',
      refundRequested: false,
    });
    setShowModal(true);
  };

  const openEdit = (ret) => {
    setIsEditing(true);
    setCurrent(ret);
    setShowModal(true);
  };

  const handleSelectOne = (id) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const handleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r._id)));
    }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'returns.csv';
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Return #', 'Shipment #', 'Date', 'Qty', 'Reason', 'Refund']],
      body: filtered.map(r => [
        r.returnNumber,
        r.shipmentNumber,
        new Date(r.returnDate).toLocaleDateString(),
        r.quantity,
        r.reason,
        r.refundRequested ? 'Yes' : 'No'
      ])
    });
    doc.save('returns.pdf');
  };

  const print = () => {
    const win = window.open('', '_blank');
    win.document.write('<html><head><title>Print</title></head><body>');
    win.document.write('<h3>Returns</h3>');
    win.document.write('<table border="1" style="border-collapse: collapse; width: 100%">');
    win.document.write('<tr><th>Return #</th><th>Shipment #</th><th>Date</th><th>Qty</th><th>Reason</th><th>Refund</th></tr>');
    filtered.forEach(r => {
      win.document.write(`<tr>
        <td>${r.returnNumber}</td>
        <td>${r.shipmentNumber}</td>
        <td>${new Date(r.returnDate).toLocaleDateString()}</td>
        <td>${r.quantity}</td>
        <td>${r.reason}</td>
        <td>${r.refundRequested ? 'Yes' : 'No'}</td>
      </tr>`);
    });
    win.document.write('</table></body></html>');
    win.print();
    win.close();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-900">Returns</h2>
        <div className="flex gap-2">
          <button onClick={openAdd} className="bg-blue-900 text-white px-4 py-1 rounded">+ Add</button>
          <button onClick={exportCSV} className="bg-green-700 text-white px-3 py-1 rounded">Export CSV</button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-1 rounded">Export PDF</button>
          <button onClick={print} className="bg-gray-700 text-white px-3 py-1 rounded">Print</button>
        </div>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Return #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-blue-100">
            <th><input type="checkbox" onChange={handleSelectAll} checked={selected.size === filtered.length} /></th>
            <th>Return #</th>
            <th>Shipment #</th>
            <th>Date</th>
            <th>Qty</th>
            <th>Reason</th>
            <th>Refund</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="8" className="text-center py-4">No data</td></tr>
          ) : (
            filtered.map(r => (
              <tr key={r._id}>
                <td><input type="checkbox" checked={selected.has(r._id)} onChange={() => handleSelectOne(r._id)} /></td>
                <td>{r.returnNumber}</td>
                <td>{r.shipmentNumber}</td>
                <td>{new Date(r.returnDate).toLocaleDateString()}</td>
                <td>{r.quantity}</td>
                <td>{r.reason}</td>
                <td>{r.refundRequested ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => openEdit(r)} className="text-blue-700">Edit</button>
                  <button onClick={() => handleDelete(r._id)} className="text-red-700 ml-2">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-lg space-y-4"
          >
            <h3 className="text-lg font-semibold">
              {isEditing ? 'Edit Return' : 'Add Return'}
            </h3>
            <input
              type="text"
              name="returnNumber"
              placeholder="Return Number"
              value={current.returnNumber}
              onChange={(e) => setCurrent({ ...current, returnNumber: e.target.value })}
              required
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="text"
              name="shipmentNumber"
              placeholder="Shipment Number"
              value={current.shipmentNumber}
              onChange={(e) => setCurrent({ ...current, shipmentNumber: e.target.value })}
              required
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="date"
              name="returnDate"
              value={current.returnDate?.substring(0, 10)}
              onChange={(e) => setCurrent({ ...current, returnDate: e.target.value })}
              required
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={current.quantity}
              onChange={(e) => setCurrent({ ...current, quantity: e.target.value })}
              required
              className="w-full border px-3 py-2 rounded"
            />
            <textarea
              name="reason"
              placeholder="Reason for Return"
              value={current.reason}
              onChange={(e) => setCurrent({ ...current, reason: e.target.value })}
              required
              rows="3"
              className="w-full border px-3 py-2 rounded"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={current.refundRequested}
                onChange={(e) => setCurrent({ ...current, refundRequested: e.target.checked })}
              />
              Refund Requested
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="bg-gray-400 px-4 py-1 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="bg-blue-800 text-white px-4 py-1 rounded">{isEditing ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Returns;
