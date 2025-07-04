import React, { useState } from "react";
import apiClient from "../../apiClient";

function CreateInvoice() {
  const [client, setClient] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([{ name: "", quantity: 1, price: 0 }]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] =
      field === "quantity" || field === "price" ? parseFloat(value) : value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const calculateSubtotal = () =>
    items.reduce((total, item) => total + item.quantity * item.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invoiceData = {
      client,
      invoiceDate,
      dueDate,
      remarks,
      items,
      total: calculateSubtotal(),
    };

    try {
      await apiClient.post("/invoices", invoiceData);
      alert("✅ Invoice saved successfully!");

      // Reset form
      setClient("");
      setInvoiceDate("");
      setDueDate("");
      setRemarks("");
      setItems([{ name: "", quantity: 1, price: 0 }]);
    } catch (err) {
      console.error("❌ Failed to save invoice:", err);
      alert("Failed to save invoice.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow text-gray-800">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Create Invoice</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Section */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Client/Vendor Name</label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="p-2 border rounded w-full"
              placeholder="e.g. ABC Textiles"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="p-2 border rounded w-full"
            />
          </div>
        </div>

        {/* Item Table */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-blue-800">Products / Services</h3>
            <input
              type="text"
              placeholder="Search Products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2 py-1 border rounded w-60 text-sm"
            />
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-300">
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                      className="p-1 border rounded w-full"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      className="p-1 border rounded w-20"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                      className="p-1 border rounded w-24"
                      required
                    />
                  </td>
                  <td className="text-right pr-4">
                    PKR {(item.quantity * item.price).toFixed(2)}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={addItem}
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-900 rounded hover:bg-blue-200 text-sm"
          >
            + Add Item
          </button>
        </div>

        {/* Remarks */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Remarks</label>
          <textarea
            rows="3"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Any notes or payment instructions..."
          />
        </div>

        {/* Total & Submit */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-blue-900">
            Subtotal: PKR {calculateSubtotal().toFixed(2)}
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
          >
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateInvoice;
