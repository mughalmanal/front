import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";

const backendURL = "https://back-8.onrender.com/api/report"; // Update with your backend URL

function Reports() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]); // list of clients/vendors names
  const [selected, setSelected] = useState(null); // selected ledger object
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination for entries
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // fetch clients/vendors list for autocomplete on mount
    fetchClients();
  }, []);

  useEffect(() => {
    // whenever selected or filters change, update filteredEntries
    if (!selected) return setFilteredEntries([]);

    let entries = selected.entries || [];

    if (filterType !== "All") {
      entries = entries.filter((e) => e.type === filterType);
    }

    if (dateFrom) {
      entries = entries.filter((e) => new Date(e.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      entries = entries.filter((e) => new Date(e.date) <= new Date(dateTo));
    }

    setFilteredEntries(entries);
    setPage(1);
  }, [selected, filterType, dateFrom, dateTo]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(backendURL); // Should return array of ledger objects
      setClients(res.data.map((c) => c.name));
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch clients/vendors");
      setLoading(false);
    }
  };

  const handleSelect = async (name) => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendURL}/name/${encodeURIComponent(name)}`); // get ledger by name
      setSelected(res.data);
      setSearch("");
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch ledger");
      setLoading(false);
    }
  };

  // Summary calculations on filtered entries
  const totalPurchase = filteredEntries
    .filter((e) => e.type === "Purchase")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPayment = filteredEntries
    .filter((e) => e.type === "Payment")
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = totalPurchase - totalPayment;

  // Pagination slice
  const paginatedEntries = filteredEntries.slice((page - 1) * pageSize, page * pageSize);

  // Export CSV data
  const csvData = filteredEntries.map((e) => ({
    Date: e.date,
    Type: e.type,
    Amount: e.amount,
  }));

  // Print PDF report
  const printReport = () => {
    if (!selected) return alert("Select a client/vendor first.");

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor("#0c4a6e");
    doc.text(`Ledger Report - ${selected.name}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor("#444");

    doc.text(`Filter: ${filterType}`, 14, 30);
    if (dateFrom) doc.text(`From: ${dateFrom}`, 14, 36);
    if (dateTo) doc.text(`To: ${dateTo}`, 14, 42);

    const tableColumn = ["Date", "Type", "Amount"];
    const tableRows = paginatedEntries.map((e) => [e.date, e.type, `Rs ${e.amount}`]);

    doc.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: "#0c4a6e" },
      alternateRowStyles: { fillColor: "#f6f6f6" },
    });

    doc.text(`Total Purchases: Rs ${totalPurchase}`, 14, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Payments: Rs ${totalPayment}`, 14, doc.lastAutoTable.finalY + 16);
    doc.text(`Balance: Rs ${balance}`, 14, doc.lastAutoTable.finalY + 22);

    doc.save(`ledger_report_${selected.name.replace(/\s/g, "_")}.pdf`);
  };

  // Autocomplete filtered names for dropdown
  const filteredNames = clients.filter((n) => n.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Client / Vendor Ledger Report</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {loading && <p className="text-gray-600 mb-3">Loading...</p>}

      {/* Search */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search client or vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-80"
        />
        {search && (
          <ul className="bg-white border mt-1 rounded shadow w-80 max-h-48 overflow-auto absolute z-10">
            {filteredNames.length > 0 ? (
              filteredNames.map((name) => (
                <li
                  key={name}
                  onClick={() => handleSelect(name)}
                  className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                >
                  {name}
                </li>
              ))
            ) : (
              <li className="p-2 text-sm text-gray-500">No match found</li>
            )}
          </ul>
        )}
      </div>

      {/* Filters */}
      {selected && (
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium mr-2">Filter Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded p-1"
            >
              <option value="All">All</option>
              <option value="Purchase">Purchase</option>
              <option value="Payment">Payment</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mr-2">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border rounded p-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium mr-2">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border rounded p-1"
            />
          </div>
          <button
            onClick={() => {
              setFilterType("All");
              setDateFrom("");
              setDateTo("");
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Summary */}
      {selected && (
        <>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-100 p-4 rounded shadow text-center">
              <h3 className="text-sm text-blue-800 font-medium">Total Purchases</h3>
              <p className="text-xl font-bold text-blue-900">Rs {totalPurchase}</p>
            </div>
            <div className="bg-green-100 p-4 rounded shadow text-center">
              <h3 className="text-sm text-green-800 font-medium">Total Payments</h3>
              <p className="text-xl font-bold text-green-900">Rs {totalPayment}</p>
            </div>
            <div
              className={`p-4 rounded shadow text-center ${
                balance > 0 ? "bg-red-100 text-red-900" : "bg-green-100 text-green-900"
              }`}
            >
              <h3 className="text-sm font-medium">Outstanding Balance</h3>
              <p className="text-xl font-bold">Rs {balance}</p>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEntries.length > 0 ? (
                  paginatedEntries.map((entry, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="p-2">{entry.date}</td>
                      <td className="p-2">{entry.type}</td>
                      <td className="p-2 text-blue-900 font-medium">Rs {entry.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-500">
                      No ledger entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="text-blue-700 hover:underline"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page} of {Math.ceil(filteredEntries.length / pageSize)}
            </span>
            <button
              disabled={page * pageSize >= filteredEntries.length}
              onClick={() => setPage(page + 1)}
              className="text-blue-700 hover:underline"
            >
              Next
            </button>
          </div>

          {/* Export & Print */}
          <div className="mt-4 space-x-4">
            <CSVLink
              data={csvData}
              filename={`ledger_${selected.name.replace(/\s/g, "_")}.csv`}
              className="text-indigo-700 hover:underline"
            >
              Export CSV
            </CSVLink>
            <button
              onClick={printReport}
              className="text-green-700 hover:underline"
            >
              Print PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
