import React, { useState } from "react";

const CreateASN = () => {
  const [formData, setFormData] = useState({
    asnNumber: "",
    poNumber: "",
    shipmentDate: "",
    carrierName: "",
    trackingNumber: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ASN Submitted:", formData);
    // You can later connect this to your backend API
  };

  const handleReset = () => {
    setFormData({
      asnNumber: "",
      poNumber: "",
      shipmentDate: "",
      carrierName: "",
      trackingNumber: "",
      notes: "",
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Create ASN (Advanced Shipment Notice)</h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">ASN Number</label>
          <input
            type="text"
            name="asnNumber"
            value={formData.asnNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">PO Number</label>
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
          <label className="block text-sm font-medium text-blue-900 mb-1">Shipment Date</label>
          <input
            type="date"
            name="shipmentDate"
            value={formData.shipmentDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Carrier Name</label>
          <input
            type="text"
            name="carrierName"
            value={formData.carrierName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Tracking Number</label>
          <input
            type="text"
            name="trackingNumber"
            value={formData.trackingNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-blue-900 mb-1">Additional Notes</label>
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
            Submit ASN
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

export default CreateASN;
