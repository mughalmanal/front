import React, { useState } from "react";

const initialInventory = [
  {
    id: 1,
    product: "Lawn Fabric Roll",
    totalQty: 500,
    consumed: 420,
    unit: "meters",
    updated: "2025-07-01",
  },
  {
    id: 2,
    product: "Cotton Kurti",
    totalQty: 300,
    consumed: 150,
    unit: "pieces",
    updated: "2025-06-25",
  },
];

const ReviewConsumption = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const filtered = inventory.filter((item) =>
    item.product.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditData({ ...item });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setInventory(inventory.filter((item) => item.id !== id));
    }
  };

  const handleSave = () => {
    setInventory((prev) =>
      prev.map((item) => (item.id === editId ? editData : item))
    );
    setEditId(null);
  };

  const handleCancel = () => {
    setEditId(null);
  };

  const handleExport = (type) => {
    alert(`Exporting to ${type} (not implemented yet).`);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-900">Consigned Inventory Review</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("PDF")}
            className="bg-blue-900 text-white px-4 py-1.5 rounded hover:bg-blue-800 text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={() => handleExport("CSV")}
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
          {filtered.map((item) => {
            const remaining = item.totalQty - item.consumed;
            const isEditing = editId === item.id;

            return (
              <tr key={item.id} className="border-t border-gray-200">
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
                        setEditData({ ...editData, totalQty: +e.target.value })
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
                        setEditData({ ...editData, consumed: +e.target.value })
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
                  {item.totalQty - item.consumed}
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
                <td className="p-2 text-gray-600">{item.updated}</td>
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
                        onClick={() => handleDelete(item.id)}
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
