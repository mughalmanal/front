import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import "./ManageShipments.css";

const ManageShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentShipment, setCurrentShipment] = useState({
    shipmentNumber: "",
    vendor: "",
    date: "",
    status: "Pending",
    trackingNumber: "",
  });

  const [selectedShipments, setSelectedShipments] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://back-7-9sog.onrender.com/api/shipments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShipments(res.data);
      setFilteredShipments(res.data);
      setSelectedShipments(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      alert("Failed to fetch shipments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    let result = shipments;

    if (statusFilter) {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (searchQuery) {
      result = result.filter((s) =>
        s.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredShipments(result);
    setSelectedShipments(new Set());
    setSelectAll(false);
  }, [searchQuery, statusFilter, shipments]);

  // Select/Deselect all visible shipments
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedShipments(new Set(filteredShipments.map((s) => s._id)));
    } else {
      setSelectedShipments(new Set());
    }
  };

  // Select/Deselect a single shipment
  const handleSelectOne = (id) => {
    const newSelected = new Set(selectedShipments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedShipments(newSelected);
    setSelectAll(newSelected.size === filteredShipments.length);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shipment?")) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://back-7-9sog.onrender.com/api/shipments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchShipments();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete shipment. Please try again.");
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
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
        shipmentNumber: "",
        vendor: "",
        date: "",
        status: "Pending",
        trackingNumber: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save shipment. Please try again.");
      setLoading(false);
    }
  };

  const openEdit = (shipment) => {
    setCurrentShipment(shipment);
    setIsEditing(true);
    setShowModal(true);
  };

  const openAdd = () => {
    setCurrentShipment({
      shipmentNumber: "",
      vendor: "",
      date: "",
      status: "Pending",
      trackingNumber: "",
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // Export selected or all shipments to PDF
  const exportToPDF = (all = false) => {
    const doc = new jsPDF();
    doc.text("Shipments Report", 14, 14);

    const dataToExport = all
      ? filteredShipments
      : filteredShipments.filter((s) => selectedShipments.has(s._id));

    if (dataToExport.length === 0) {
      alert("No shipments selected for export.");
      return;
    }

    autoTable(doc, {
      head: [
        [
          "Shipment #",
          "Date",
          "Vendor",
          "Status",
          "Tracking Number",
        ],
      ],
      body: dataToExport.map((s) => [
        s.shipmentNumber,
        new Date(s.date).toLocaleDateString(),
        s.vendor,
        s.status,
        s.trackingNumber || "-",
      ]),
    });

    doc.save("shipments_report.pdf");
  };

  // Export selected or all shipments to CSV
  const exportToCSV = (all = false) => {
    const dataToExport = all
      ? filteredShipments
      : filteredShipments.filter((s) => selectedShipments.has(s._id));

    if (dataToExport.length === 0) {
      alert("No shipments selected for export.");
      return;
    }

    const csvData = dataToExport.map((s) => ({
      ShipmentNumber: s.shipmentNumber,
      Date: new Date(s.date).toLocaleDateString(),
      Vendor: s.vendor,
      Status: s.status,
      TrackingNumber: s.trackingNumber || "-",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "shipments_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print selected or all shipments
  const printShipments = (all = false) => {
    const dataToPrint = all
      ? filteredShipments
      : filteredShipments.filter((s) => selectedShipments.has(s._id));

    if (dataToPrint.length === 0) {
      alert("No shipments selected for printing.");
      return;
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Shipments Print</title>");
    printWindow.document.write(
      `<style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background-color: #004aad; color: white; }
      </style>`
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h2>Shipments Report</h2>");
    printWindow.document.write("<table>");
    printWindow.document.write(
      "<thead><tr><th>Shipment #</th><th>Date</th><th>Vendor</th><th>Status</th><th>Tracking Number</th></tr></thead>"
    );
    printWindow.document.write("<tbody>");
    dataToPrint.forEach((s) => {
      printWindow.document.write(
        `<tr>
          <td>${s.shipmentNumber}</td>
          <td>${new Date(s.date).toLocaleDateString()}</td>
          <td>${s.vendor}</td>
          <td>${s.status}</td>
          <td>${s.trackingNumber || "-"}</td>
        </tr>`
      );
    });
    printWindow.document.write("</tbody></table>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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
            disabled={loading}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          disabled={loading}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
          <option value="Returned">Returned</option>
        </select>

        <button
          onClick={openAdd}
          className="btn btn-add"
          disabled={loading}
          title="Add New Shipment"
        >
          + Add Shipment
        </button>
      </div>

      <div className="selection-controls" style={{ marginBottom: 10 }}>
        <label>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            disabled={loading || filteredShipments.length === 0}
          />{" "}
          Select All
        </label>

        <button
          className="btn btn-export"
          onClick={() => exportToPDF(false)}
          disabled={loading || selectedShipments.size === 0}
        >
          Export Selected to PDF
        </button>
        <button
          className="btn btn-export"
          onClick={() => exportToCSV(false)}
          disabled={loading || selectedShipments.size === 0}
        >
          Export Selected to CSV
        </button>
        <button
          className="btn btn-export"
          onClick={() => printShipments(false)}
          disabled={loading || selectedShipments.size === 0}
        >
          Print Selected
        </button>

        <button
          className="btn btn-export"
          onClick={() => exportToPDF(true)}
          disabled={loading || filteredShipments.length === 0}
        >
          Export All to PDF
        </button>
        <button
          className="btn btn-export"
          onClick={() => exportToCSV(true)}
          disabled={loading || filteredShipments.length === 0}
        >
          Export All to CSV
        </button>
        <button
          className="btn btn-export"
          onClick={() => printShipments(true)}
          disabled={loading || filteredShipments.length === 0}
        >
          Print All
        </button>
      </div>

      <table className="shipment-table">
        <thead>
          <tr>
            <th>
              {/* Checkbox column */}
            </th>
            <th>Shipment #</th>
            <th>Date</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Tracking</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                Loading shipments...
              </td>
            </tr>
          ) : filteredShipments.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No shipments found.
              </td>
            </tr>
          ) : (
            filteredShipments.map((s) => (
              <tr key={s._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedShipments.has(s._id)}
                    onChange={() => handleSelectOne(s._id)}
                    disabled={loading}
                  />
                </td>
                <td>{s.shipmentNumber}</td>
                <td>{new Date(s.date).toLocaleDateString()}</td>
                <td>{s.vendor}</td>
                <td>
                  <span
                    className={`status ${s.status
                      .replace(/\s/g, "")
                      .toLowerCase()}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td>{s.trackingNumber}</td>
                <td>
                  <button
                    className="btn btn-view"
                    onClick={() => openEdit(s)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(s._id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-backdrop">
          <form className="modal-form" onSubmit={handleFormSubmit}>
            <h3>{isEditing ? "Edit Shipment" : "Add Shipment"}</h3>
            <input
              type="text"
              placeholder="Shipment Number"
              value={currentShipment.shipmentNumber}
              onChange={(e) =>
                setCurrentShipment({
                  ...currentShipment,
                  shipmentNumber: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Vendor"
              value={currentShipment.vendor}
              onChange={(e) =>
                setCurrentShipment({ ...currentShipment, vendor: e.target.value })
              }
              required
            />
            <input
              type="date"
              value={currentShipment.date?.substring(0, 10)}
              onChange={(e) =>
                setCurrentShipment({ ...currentShipment, date: e.target.value })
              }
              required
            />
            <select
              value={currentShipment.status}
              onChange={(e) =>
                setCurrentShipment({ ...currentShipment, status: e.target.value })
              }
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
              onChange={(e) =>
                setCurrentShipment({
                  ...currentShipment,
                  trackingNumber: e.target.value,
                })
              }
            />
            <div className="modal-actions">
              <button type="submit" className="btn btn-save" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowModal(false)}
                disabled={loading}
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

export default ManageShipments;
