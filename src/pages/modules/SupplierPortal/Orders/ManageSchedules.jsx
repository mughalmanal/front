import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageSchedules.css";

const ManageSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState({
    scheduleNumber: "",
    vendor: "",
    deliveryDate: "",
    status: "Scheduled",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

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
      setError("Failed to fetch schedules.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Filter schedules by scheduleNumber or vendor (case-insensitive)
  const filteredSchedules = schedules.filter(
    (s) =>
      s.scheduleNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.vendor.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setCurrentSchedule({
      scheduleNumber: "",
      vendor: "",
      deliveryDate: "",
      status: "Scheduled",
      notes: "",
    });
    setIsEditing(false);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const openEdit = (schedule) => {
    setCurrentSchedule(schedule);
    setIsEditing(true);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(`https://back-7-9sog.onrender.com/api/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Schedule deleted successfully.");
      fetchSchedules();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete schedule.");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation for required fields
    if (
      !currentSchedule.scheduleNumber.trim() ||
      !currentSchedule.vendor.trim() ||
      !currentSchedule.deliveryDate
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      if (isEditing) {
        await axios.put(
          `https://back-7-9sog.onrender.com/api/schedules/${currentSchedule._id}`,
          currentSchedule,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Schedule updated successfully.");
      } else {
        await axios.post(
          "https://back-7-9sog.onrender.com/api/schedules",
          currentSchedule,
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

  return (
    <div className="manage-schedules max-w-7xl mx-auto p-6 bg-white rounded-xl shadow border border-blue-100">
      <h2 className="heading text-2xl font-bold text-blue-900 mb-6">Manage Schedules</h2>

      <div className="schedule-controls flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by Schedule # or Vendor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-blue-300 rounded px-4 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          className="refresh-btn bg-blue-100 text-blue-900 px-4 py-2 rounded shadow hover:bg-blue-200"
          onClick={fetchSchedules}
          disabled={loading}
        >
          ⟳ Refresh
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
        <>
          {error && <p className="text-red-600 mb-3 text-center font-semibold">{error}</p>}
          {success && <p className="text-green-600 mb-3 text-center font-semibold">{success}</p>}

          <table className="schedule-table w-full border border-blue-200 rounded shadow-sm">
            <thead className="bg-blue-100 text-blue-900 font-semibold">
              <tr>
                <th className="p-3 border-r border-blue-200">Schedule #</th>
                <th className="p-3 border-r border-blue-200">Vendor</th>
                <th className="p-3 border-r border-blue-200">Delivery Date</th>
                <th className="p-3 border-r border-blue-200">Status</th>
                <th className="p-3 border-r border-blue-200">Notes</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-400">
                    No schedules found.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((s) => (
                  <tr key={s._id} className="border-t border-blue-200">
                    <td className="p-3 border-r border-blue-200">{s.scheduleNumber}</td>
                    <td className="p-3 border-r border-blue-200">{s.vendor}</td>
                    <td className="p-3 border-r border-blue-200">
                      {new Date(s.deliveryDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 border-r border-blue-200">
                      <span
                        className={`status ${s.status?.toLowerCase().replace(/\s/g, "")}`}
                      >
                        {s.status}
                      </span>
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
        </>
      )}

      {showModal && (
        <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            className="modal-form bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg"
            onSubmit={handleSubmit}
          >
            <h3 className="text-xl font-bold mb-4 text-blue-800">
              {isEditing ? "Edit Schedule" : "Add Schedule"}
            </h3>

            {error && <p className="text-red-600 mb-3 font-semibold">{error}</p>}
            {success && <p className="text-green-600 mb-3 font-semibold">{success}</p>}

            <input
              type="text"
              placeholder="Schedule Number"
              value={currentSchedule.scheduleNumber}
              onChange={(e) =>
                setCurrentSchedule({ ...currentSchedule, scheduleNumber: e.target.value })
              }
              required
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              placeholder="Vendor"
              value={currentSchedule.vendor}
              onChange={(e) =>
                setCurrentSchedule({ ...currentSchedule, vendor: e.target.value })
              }
              required
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="date"
              value={currentSchedule.deliveryDate?.substring(0, 10)}
              onChange={(e) =>
                setCurrentSchedule({ ...currentSchedule, deliveryDate: e.target.value })
              }
              required
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <select
              value={currentSchedule.status}
              onChange={(e) =>
                setCurrentSchedule({ ...currentSchedule, status: e.target.value })
              }
              className="border border-blue-300 rounded px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
            </select>

            <textarea
              rows="3"
              placeholder="Notes (optional)"
              value={currentSchedule.notes}
              onChange={(e) =>
                setCurrentSchedule({ ...currentSchedule, notes: e.target.value })
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
    </div>
  );
};

export default ManageSchedules;
