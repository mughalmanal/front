import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AcknowledgeSchedules.css";

const AcknowledgeSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState({
    scheduleNumber: "",
    vendor: "",
    deliveryDate: "",
    status: "Scheduled",
    acknowledgedBy: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // Fetch schedules from backend
  const fetchSchedules = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        "https://back-7-9sog.onrender.com/api/schedules",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSchedules(res.data);
    } catch (err) {
      setError("Failed to load schedules.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Filter schedules by scheduleNumber or vendor (case-insensitive)
  const filtered = schedules.filter(
    (s) =>
      s.scheduleNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.vendor.toLowerCase().includes(search.toLowerCase())
  );

  // Open modal for adding new schedule
  const openAdd = () => {
    setCurrent({
      scheduleNumber: "",
      vendor: "",
      deliveryDate: "",
      status: "Scheduled",
      acknowledgedBy: "",
      notes: "",
    });
    setIsEditing(false);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  // Open modal for editing existing schedule
  const openEdit = (data) => {
    setCurrent(data);
    setIsEditing(true);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  // Handle delete with confirmation and backend call
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(
        `https://back-7-9sog.onrender.com/api/schedules/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Schedule deleted successfully.");
      fetchSchedules();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete schedule.");
      console.error(err);
    }
  };

  // Submit add or edit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    if (
      !current.scheduleNumber.trim() ||
      !current.vendor.trim() ||
      !current.deliveryDate
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      if (isEditing) {
        await axios.put(
          `https://back-7-9sog.onrender.com/api/schedules/${current._id}`,
          current,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Schedule updated successfully.");
      } else {
        await axios.post(
          `https://back-7-9sog.onrender.com/api/schedules`,
          current,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Schedule added successfully.");
      }
      setShowModal(false);
      fetchSchedules();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to submit schedule.");
      console.error(err);
    }
  };

  // Export filtered schedules to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Acknowledged Schedules Report", 14, 14);
    autoTable(doc, {
      head: [["Schedule #", "Vendor", "Date", "Status", "By", "Notes"]],
      body: filtered.map((s) => [
        s.scheduleNumber,
        s.vendor,
        new Date(s.deliveryDate).toLocaleDateString(),
        s.status,
        s.acknowledgedBy || "-",
        s.notes || "-",
      ]),
    });
    doc.save("Acknowledged_Schedules.pdf");
  };

  return (
    <div className="ack-schedules max-w-7xl mx-auto p-6 bg-white rounded-xl shadow border border-blue-100">
      <h2 className="heading text-2xl font-bold text-blue-900 mb-6">
        Acknowledge Schedules
      </h2>

      <div className="ack-controls flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search Schedule or Vendor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-blue-300 rounded px-4 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          className="btn btn-refresh bg-blue-100 text-blue-900 px-4 py-2 rounded shadow hover:bg-blue-200"
          onClick={fetchSchedules}
          disabled={loading}
        >
          ⟳ Refresh
        </button>
        <button
          className="btn btn-export bg-blue-900 text-white px-4 py-2 rounded shadow hover:bg-blue-800"
          onClick={exportPDF}
          disabled={filtered.length === 0}
        >
          ⬇ Export to PDF
        </button>
        <button
          className="btn btn-add bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          onClick={openAdd}
        >
          + Add Schedule
        </button>
      </div>

      {loading ? (
        <p className="text-blue-700 font-semibold text-center">Loading...</p>
      ) : (
        <table className="ack-table w-full border border-blue-200 rounded shadow-sm">
          <thead className="bg-blue-100 text-blue-900 font-semibold">
            <tr>
              <th className="p-3 border-r border-blue-200">#</th>
              <th className="p-3 border-r border-blue-200">Vendor</th>
              <th className="p-3 border-r border-blue-200">Date</th>
              <th className="p-3 border-r border-blue-200">Status</th>
              <th className="p-3 border-r border-blue-200">Acknowledged By</th>
              <th className="p-3 border-r border-blue-200">Notes</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-400">
                  No schedules found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s._id} className="border-t border-blue-200">
                  <td className="p-3 border-r border-blue-200">{s.scheduleNumber}</td>
                  <td className="p-3 border-r border-blue-200">{s.vendor}</td>
                  <td className="p-3 border-r border-blue-200">
                    {new Date(s.deliveryDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 border-r border-blue-200">
                    <span className={`status ${s.status.toLowerCase()}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 border-r border-blue-200">
                    {s.acknowledgedBy || "-"}
                  </td>
                  <td className="p-3 border-r border-blue-200">{s.notes || "-"}</td>
                  <td className="p-3 space-x-2">
                    <button
                      className="btn btn-view text-blue-700 hover:underline"
                      onClick={() => openEdit(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-delete text-red-600 hover:underline"
                      onClick={() => handleDelete(s._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            className="modal-form bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg"
            onSubmit={handleSubmit}
          >
            <h3 className="text-xl font-bold mb-4 text-blue-800">
              {isEditing ? "Edit" : "Add"} Schedule
            </h3>

            {error && (
              <p className="text-red-600 mb-3 font-semibold">{error}</p>
            )}
            {success && (
              <p className="text-green-600 mb-3 font-semibold">{success}</p>
            )}

            <input
              type="text"
              placeholder="Schedule Number"
              value={current.scheduleNumber}
              onChange={(e) =>
                setCurrent({ ...current, scheduleNumber: e.target.value })
              }
              required
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              placeholder="Vendor"
              value={current.vendor}
              onChange={(e) =>
                setCurrent({ ...current, vendor: e.target.value })
              }
              required
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="date"
              value={current.deliveryDate?.substring(0, 10)}
              onChange={(e) =>
                setCurrent({ ...current, deliveryDate: e.target.value })
              }
              required
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <select
              value={current.status}
              onChange={(e) =>
                setCurrent({ ...current, status: e.target.value })
              }
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
            </select>

            <input
              type="text"
              placeholder="Acknowledged By (optional)"
              value={current.acknowledgedBy}
              onChange={(e) =>
                setCurrent({ ...current, acknowledgedBy: e.target.value })
              }
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <textarea
              rows="3"
              placeholder="Notes (optional)"
              value={current.notes}
              onChange={(e) =>
                setCurrent({ ...current, notes: e.target.value })
              }
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

      {success && !showModal && (
        <p className="text-green-600 mt-4 text-center font-semibold">{success}</p>
      )}
      {error && !showModal && (
        <p className="text-red-600 mt-4 text-center font-semibold">{error}</p>
      )}
    </div>
  );
};

export default AcknowledgeSchedules;
