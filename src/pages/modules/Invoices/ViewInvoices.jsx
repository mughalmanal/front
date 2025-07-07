import React, { useEffect, useState } from "react";
import axios from "axios";

const backendURL = "https://back-8.onrender.com/api/invoice/view"; // your live backend

function ViewInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("invoiceDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 5;

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(backendURL);
      setInvoices(res.data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      alert("Failed to load invoices. Please try again.");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((inv) => inv._id));
  };

  const exportToCSV = () => {
    const rows = selected.map((inv) => ({
      ID: inv._id,
      Client: inv.client,
      Date: inv.invoiceDate,
      Due: inv.dueDate,
      Total: inv.total,
    }));
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Client,Date,Due,Total"]
        .concat(rows.map((r) => Object.values(r).join(",")))
        .join("\n");

    const a = document.createElement("a");
    a.href = encodeURI(csvContent);
    a.download = "invoices.csv";
    a.click();
  };

  const exportToPDF = () => {
    const selectedInvoices = invoices.filter((inv) => selected.includes(inv._id));
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Invoices</title><style>
        body { font-family: Arial; padding: 20px; }
        h1 { color: #0c4a6e; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f0f8ff; }
      </style></head><body>
        <h1>Invoices (${selectedInvoices.length})</h1>
        <table><thead>
        <tr><th>ID</th><th>Client</th><th>Date</th><th>Due</th><th>Total</th></tr>
        </thead><tbody>
        ${selectedInvoices
          .map(
            (inv) =>
              `<tr>
                <td>${inv._id.slice(-6).toUpperCase()}</td>
                <td>${inv.client}</td>
                <td>${new Date(inv.invoiceDate).toLocaleDateString("en-GB")}</td>
                <td>${new Date(inv.dueDate).toLocaleDateString("en-GB")}</td>
                <td>PKR ${inv.total.toLocaleString()}</td>
              </tr>`
          )
          .join("")}
        </tbody></table></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const sortBy = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const filtered = invoices
    .filter((inv) => {
      const query = search.toLowerCase();
      return (
        inv.client?.toLowerCase().includes(query) ||
        inv._id?.toLowerCase().includes(query) ||
        inv.invoiceDate?.includes(query)
      );
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA == null || valB == null) return 0;

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

  const pageCount = Math.ceil(filtered.length / invoicesPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * invoicesPerPage,
    currentPage * invoicesPerPage
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-900">Invoices</h2>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-1 rounded w-64"
        />
      </div>

      <div className="mb-3 flex gap-3">
        <button
          onClick={toggleSelectAll}
          className="px-3 py-1 border rounded bg-gray-100 text-sm"
        >
          {selected.length === filtered.length ? "Unselect All" : "Select All"}
        </button>
        <button
          onClick={exportToCSV}
          disabled={!selected.length}
          className="px-3 py-1 border rounded bg-green-100 text-sm"
        >
          Export CSV
        </button>
        <button
          onClick={exportToPDF}
          disabled={!selected.length}
          className="px-3 py-1 border rounded bg-red-100 text-sm"
        >
          Print PDF
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-2 cursor-pointer" onClick={() => sortBy("_id")}>
                ID {sortField === "_id" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="p-2 cursor-pointer" onClick={() => sortBy("client")}>
                Client {sortField === "client" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="p-2 cursor-pointer" onClick={() => sortBy("invoiceDate")}>
                Date {sortField === "invoiceDate" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="p-2">Due</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((inv) => (
              <tr key={inv._id} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(inv._id)}
                    onChange={() => toggleSelect(inv._id)}
                  />
                </td>
                <td className="p-2">{inv._id.slice(-6).toUpperCase()}</td>
                <td className="p-2">{inv.client}</td>
                <td className="p-2">
                  {new Date(inv.invoiceDate).toLocaleDateString("en-GB")}
                </td>
                <td className="p-2">
                  {new Date(inv.dueDate).toLocaleDateString("en-GB")}
                </td>
                <td className="p-2 font-semibold text-blue-900">
                  PKR {inv.total?.toLocaleString()}
                </td>
              </tr>
            ))}
            {!paginated.length && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`px-3 py-1 rounded ${
              currentPage === num
                ? "bg-blue-900 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ViewInvoices;
