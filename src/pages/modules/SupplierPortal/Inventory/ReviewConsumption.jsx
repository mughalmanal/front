import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const ReviewConsumption = () => {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  // Fetch inventory from backend on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://back-7-9sog.onrender.com/api/consignedInventory",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInventory(res.data);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      alert("Error fetching inventory data");
    }
  };

  // Filter inventory by search input
  const filtered = inventory.filter((item) =>
    item.product.toLowerCase().includes(search.toLowerCase())
  );

  // Start editing an entry
  const handleEdit = (item) => {
    setEditId(item._id);
    setEditData({ ...item });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditId(null);
  };

  // Save edited data to backend
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://back-7-9sog.onrender.com/api/consignedInventory/${editId}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditId(null);
      fetchInventory();
    } catch (err) {
      console.error("Failed to update inventory:", err);
      alert("Error updating inventory");
    }
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://back-7-9sog.onrender.com/api/consignedInventory/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchInventory();
    } catch (err) {
      console.error("Failed to delete inventory:", err);
      alert("Error deleting inventory");
    }
  };

  // Export filtered data to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Consigned Inventory Report", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Product",
          "Total Qty",
          "Consumed",
          "Remaining",
          "Unit",
          "Last Updated",
        ],
      ],
      body: filtered.map((item) => [
        item.product,
        item.totalQty,
        item.consumed,
        item.totalQty - item.consumed,
        item.unit,
        new Date(item.updated).toLocaleDateString(),
      ]),
    });
    doc.save("consigned_inventory_report.pdf");
  };

  // Export filtered data to CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(
      filtered.map((item) => ({
        Product: item.product,
        "Total Quantity": item.totalQty,
        Consumed: item.consumed,
        Remaining: item.totalQty - item.consumed,
        Unit: item.unit,
        "Last Updated": new Date(item.updated).toLocaleDateString(),
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "consigned_inventory_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-900">
          Consigned Inventory Review
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-blue-900 text-white px-4 py-1.5 rounded hover:bg-blue-800 text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-blue-100 text-blue-900 px-4 py-1.5 rounded hover:bg-blue-200 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search product..."
        className="mb-4 w-full border rounded px-4 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full text-sm border border-gray-200">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-2 text-left">Product</th>
            <th className="p-2 text-left">Total Qty</th>
            <th className="p-2 text-left">Consumed</th>
            <th className="p-2 text-left">Remaining</th>
            <th className="p-2 text-left">Unit</th>
            <th className="p-2 text-left">Updated</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">
                No records found.
              </td>
            </tr>
          )}
          {filtered.map((item) => {
            const remaining = item.totalQty - item.consumed;
            const isEditing = editId === item._id;

            return (
              <tr key={item._id}>
                <td className="p-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.product}
                      onChange={(e) =>
                        setEditData({ ...editData, product: e.target.value })
                      }
                      className="w-full border px-2 py-1 rounded"
                    />
                  ) : (
                    item.product
                  )}
                </td>
                <td className="p-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.totalQty}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          totalQty: Number(e.target.value),
                        })
                      }
                      className="w-full border px-2 py-1 rounded"
                    />
                  ) : (
                    item.totalQty
                  )}
                </td>
                <td className="p-2 text-yellow-800">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.consumed}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          consumed: Number(e.target.value),
                        })
                      }
                      className="w-full border px-2 py-1 rounded"
                    />
                  ) : (
                    item.consumed
                  )}
                </td>
                <td
                  className={`p-2 font-semibold ${
                    remaining < 10 ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {remaining}
                </td>
                <td className="p-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.unit}
                      onChange={(e) =>
                        setEditData({ ...editData, unit: e.target.value })
                      }
                      className="w-full border px-2 py-1 rounded"
                    />
                  ) : (
                    item.unit
                  )}
                </td>
                <td className="p-2 text-gray-600">
                  {new Date(item.updated).toLocaleDateString()}
                </td>
                <td className="p-2 flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-900 underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-700 underline text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewConsumption;
