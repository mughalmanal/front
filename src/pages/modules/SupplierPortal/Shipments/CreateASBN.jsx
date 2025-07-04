import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const ManageASBNs = () => {
  const [asbns, setAsbns] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Fetch ASBN entries from backend
  const fetchASBNs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://back-7-9sog.onrender.com/api/asbns", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAsbns(res.data);
      setSelectedIds(new Set()); // clear selection on refresh
    } catch (error) {
      console.error("Error fetching ASBNs:", error);
    }
  };

  useEffect(() => {
    fetchASBNs();
  }, []);

  // Filter ASBNs by ASBN Number or PO Number (case insensitive)
  const filtered = asbns.filter(
    (a) =>
      a.asbnNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.poNumber.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle single row selection
  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select all visible rows
  const selectAll = () => {
    const allIds = filtered.map((a) => a._id);
    setSelectedIds(new Set(allIds));
  };

  // Deselect all rows
  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Export to PDF - all or selected only
  const exportToPDF = (onlySelected = false) => {
    const doc = new jsPDF();
    doc.text("ASBN Report", 14, 14);
    const dataToExport = onlySelected
      ? asbns.filter((a) => selectedIds.has(a._id))
      : filtered;

    autoTable(doc, {
      head: [
        [
          "ASBN #",
          "PO #",
          "Billing Date",
          "Carrier",
          "Total Amount (PKR)",
          "Notes",
        ],
      ],
      body: dataToExport.map((a) => [
        a.asbnNumber,
        a.poNumber,
        new Date(a.billingDate).toLocaleDateString(),
        a.carrierName || "-",
        a.totalAmount ? a.totalAmount.toLocaleString() : "-",
        a.notes || "-",
      ]),
    });
    doc.save("ASBN_Report.pdf");
  };

  // Export to CSV - all or selected only
  const exportToCSV = (onlySelected = false) => {
    const dataToExport = onlySelected
      ? asbns.filter((a) => selectedIds.has(a._id))
      : filtered;

    const csv = Papa.unparse(
      dataToExport.map((a) => ({
        ASBNNumber: a.asbnNumber,
        PONumber: a.poNumber,
        BillingDate: new Date(a.billingDate).toLocaleDateString(),
        Carrier: a.carrierName || "",
        TotalAmount: a.totalAmount || "",
        Notes: a.notes || "",
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "ASBN_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print all or selected ASBNs (simple print view)
  const printASBNs = (onlySelected = false) => {
    const dataToPrint = onlySelected
      ? asbns.filter((a) => selectedIds.has(a._id))
      : filtered;

    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>ASBN Print</title>");
    printWindow.document.write(
      `<style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background: #004aad; color: white; }
      </style>`
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h2>ASBN Report</h2>");
    printWindow.document.write("<table>");
    printWindow.document.write(
      `<thead><tr>
        <th>ASBN #</th>
        <th>PO #</th>
        <th>Billing Date</th>
        <th>Carrier</th>
        <th>Total Amount (PKR)</th>
        <th>Notes</th>
      </tr></thead><tbody>`
    );

    dataToPrint.forEach((a) => {
      printWindow.document.write(
        `<tr>
          <td>${a.asbnNumber}</td>
          <td>${a.poNumber}</td>
          <td>${new Date(a.billingDate).toLocaleDateString()}</td>
          <td>${a.carrierName || "-"}</td>
          <td>${a.totalAmount ? a.totalAmount.toLocaleString() : "-"}</td>
          <td>${a.notes || "-"}</td>
        </tr>`
      );
    });

    printWindow.document.write("</tbody></table>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Delete ASBN by id
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ASBN?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://back-7-9sog.onrender.com/api/asbns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchASBNs();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100 max-w-full">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Manage ASBNs</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by ASBN # or PO #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-grow max-w-xs"
        />

        <button
          onClick={fetchASBNs}
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
        >
          ⟳ Refresh
        </button>

        <button
          onClick={selectAll}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Select All
        </button>

        <button
          onClick={deselectAll}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
        >
          Deselect All
        </button>

        <button
          onClick={() => exportToPDF(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          disabled={selectedIds.size === 0}
          title="Export selected to PDF"
        >
          Export Selected PDF
        </button>

        <button
          onClick={() => exportToCSV(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          disabled={selectedIds.size === 0}
          title="Export selected to CSV"
        >
          Export Selected CSV
        </button>

        <button
          onClick={() => printASBNs(true)}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
          disabled={selectedIds.size === 0}
          title="Print selected ASBNs"
        >
          Print Selected
        </button>

        <button
          onClick={() => exportToPDF(false)}
          className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition"
          title="Export all filtered to PDF"
        >
          Export All PDF
        </button>

        <button
          onClick={() => exportToCSV(false)}
          className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition"
          title="Export all filtered to CSV"
        >
          Export All CSV
        </button>

        <button
          onClick={() => printASBNs(false)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          title="Print all filtered ASBNs"
        >
          Print All
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="p-2 border border-gray-300">
              <input
                type="checkbox"
                checked={selectedIds.size === filtered.length && filtered.length > 0}
                onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
              />
            </th>
            <th className="p-2 border border-gray-300">ASBN #</th>
            <th className="p-2 border border-gray-300">PO #</th>
            <th className="p-2 border border-gray-300">Billing Date</th>
            <th className="p-2 border border-gray-300">Carrier</th>
            <th className="p-2 border border-gray-300">Total Amount (PKR)</th>
            <th className="p-2 border border-gray-300">Notes</th>
            <th className="p-2 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center p-4">
                No ASBNs found.
              </td>
            </tr>
          ) : (
            filtered.map((a) => (
              <tr key={a._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 text-center p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(a._id)}
                    onChange={() => toggleSelect(a._id)}
                  />
                </td>
                <td className="border border-gray-300 p-2">{a.asbnNumber}</td>
                <td className="border border-gray-300 p-2">{a.poNumber}</td>
                <td className="border border-gray-300 p-2">
                  {new Date(a.billingDate).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 p-2">{a.carrierName || "-"}</td>
                <td className="border border-gray-300 p-2">
                  {a.totalAmount ? a.totalAmount.toLocaleString() : "-"}
                </td>
                <td className="border border-gray-300 p-2">{a.notes || "-"}</td>
                <td className="border border-gray-300 p-2 space-x-2 text-center">
                  {/* Edit/Delete buttons can be implemented as needed */}
                  <button
                    onClick={() => alert("Edit feature to be implemented")}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    title="Edit ASBN"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    title="Delete ASBN"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageASBNs;
