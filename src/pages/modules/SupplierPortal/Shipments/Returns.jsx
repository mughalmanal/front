import React, { useState } from "react";

const Returns = () => {
  const [formData, setFormData] = useState({
    returnNumber: "",
    shipmentNumber: "",
    returnDate: "",
    quantity: "",
    reason: "",
    refundRequested: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Return Submitted:", formData);
    // Later: Send to backend via POST
  };

  const handleReset = () => {
    setFormData({
      returnNumber: "",
      shipmentNumber: "",
      returnDate: "",
      quantity: "",
      reason: "",
      refundRequested: false,
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Returns</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Return Number
          </label>
          <input
            type="text"
            name="returnNumber"
            value={formData.returnNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Shipment Number
          </label>
          <input
            type="text"
            name="shipmentNumber"
            value={formData.shipmentNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Return Date
          </label>
          <input
            type="date"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Quantity Returned
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min="1"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Reason for Return
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows="3"
            required
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            name="refundRequested"
            checked={formData.refundRequested}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label className="text-sm text-blue-900">
            Refund Requested
          </label>
        </div>

        <div className="md:col-span-2 flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-blue-900 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
          >
            Submit Return
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default Returns;
