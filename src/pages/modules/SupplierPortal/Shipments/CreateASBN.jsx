import React, { useState } from "react";

const CreateASBN = () => {
  const [formData, setFormData] = useState({
    asbnNumber: "",
    poNumber: "",
    billingDate: "",
    carrierName: "",
    totalAmount: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ASBN Submitted:", formData);
    // You can later connect this to your backend
  };

  const handleReset = () => {
    setFormData({
      asbnNumber: "",
      poNumber: "",
      billingDate: "",
      carrierName: "",
      totalAmount: "",
      notes: "",
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">
        Create ASBN (Advanced Shipment Billing Notice)
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            ASBN Number
          </label>
          <input
            type="text"
            name="asbnNumber"
            value={formData.asbnNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            PO Number
          </label>
          <input
            type="text"
            name="poNumber"
            value={formData.poNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Billing Date
          </label>
          <input
            type="date"
            name="billingDate"
            value={formData.billingDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Carrier Name
          </label>
          <input
            type="text"
            name="carrierName"
            value={formData.carrierName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Total Amount (PKR)
          </label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div className="md:col-span-2 flex gap-4 mt-4">
          <button
            type="submit"
            className="bg-blue-900 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
          >
            Submit ASBN
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

export default CreateASBN;
