import React, { useState } from "react";

const dummyLedger = [
  {
    id: 1,
    name: "ABC Traders",
    entries: [
      { date: "2025-07-01", type: "Purchase", amount: 12000 },
      { date: "2025-07-02", type: "Payment", amount: 5000 },
      { date: "2025-07-03", type: "Purchase", amount: 8000 },
    ],
  },
  {
    id: 2,
    name: "XYZ Enterprises",
    entries: [
      { date: "2025-07-01", type: "Purchase", amount: 20000 },
      { date: "2025-07-02", type: "Payment", amount: 15000 },
    ],
  },
];

function Reports() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const handleSelect = (name) => {
    const match = dummyLedger.find((c) => c.name === name);
    setSelected(match || null);
  };

  const filteredNames = dummyLedger
    .map((c) => c.name)
    .filter((n) => n.toLowerCase().includes(search.toLowerCase()));

  const totalPurchase = selected
    ? selected.entries
        .filter((e) => e.type === "Purchase")
        .reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const totalPayment = selected
    ? selected.entries
        .filter((e) => e.type === "Payment")
        .reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const balance = totalPurchase - totalPayment;

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <h2 className="text-xl font-bold text-blue-900 mb-4">
        Client / Vendor Ledger Report
      </h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search client or vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-80"
        />
        {search && (
          <ul className="bg-white border mt-2 rounded shadow w-80">
            {filteredNames.map((name) => (
              <li
                key={name}
                onClick={() => {
                  handleSelect(name);
                  setSearch("");
                }}
                className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
              >
                {name}
              </li>
            ))}
            {filteredNames.length === 0 && (
              <li className="p-2 text-sm text-gray-500">No match found</li>
            )}
          </ul>
        )}
      </div>

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
                {selected.entries.map((entry, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-2">{entry.date}</td>
                    <td className="p-2">{entry.type}</td>
                    <td className="p-2 text-blue-900 font-medium">Rs {entry.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
