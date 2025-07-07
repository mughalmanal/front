import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";

// Use your actual backend URL
const backendURL = "https://back-8.onrender.com/api/report";

function Reports() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (!selected) {
      setFilteredEntries([]);
      return;
    }

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
      const res = await axios.get(backendURL);
      if (Array.isArray(res.data)) {
        setClients(res.data.map((c) => c.name));
        setError("");
      } else {
        setError("Unexpected server response.");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Failed to fetch clients/vendors. Check backend or CORS.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (name) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${backendURL}/name/${encodeURIComponent(name)}`
      );
      if (res.data && Array.isArray(res.data.entries)) {
        setSelected(res.data);
        setSearch("");
        setError("");
      } else {
        setError("❌ Selected ledger data invalid.");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Failed to fetch ledger for selected name.");
    } finally {
      setLoading(false);
    }
  };

  const totalPurchase = filteredEntries
    .filter((e) => e.type === "Purchase")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPayment = filteredEntries
    .filter((e) => e.type === "Payment")
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = totalPurchase - totalPayment;
  const paginatedEntries = filteredEntries.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const csvData = filteredEntries.map((e) => ({
    Date: e.date,
    Type: e.type,
    Amount: e.amount,
  }));

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
    const tableRows = paginatedEntries.map((e) => [
      e.date,
      e.type,
      `Rs ${e.amount}`,
    ]);

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

  const filteredNames = clients.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-blue-900 mb-4">
        Client / Vendor Ledger Report
      </h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {loading && <p className="text-gray-600 mb-3">Loading...</p>}

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

      {selected && (
        <>
          {/* Filters and Summary UI */}
          {/* Ledger Table */}
          {/* Pagination */}
          {/* CSV & PDF Export */}
          {/* (Keep all earlier implemented UI components here) */}
        </>
      )}
    </div>
  );
}

export default Reports;
