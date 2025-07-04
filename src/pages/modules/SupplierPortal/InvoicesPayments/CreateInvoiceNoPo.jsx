import React, { useState } from "react";
import axios from "axios";

const CreateInvoiceNoPo = () => {
  const [form, setForm] = useState({
    clientName: "",
    invoiceNumber: "",
    date: "",
    amount: "",
    description: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.invoiceNumber || !form.date || !form.amount) {
      setError("Please fill all required fields.");
      setSuccess("");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://back-7-9sog.onrender.com/api/invoices/no-po",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Invoice without PO submitted successfully!");
      setError("");
      setForm({
        clientName: "",
        invoiceNumber: "",
        date: "",
        amount: "",
        description: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to submit invoice. Please try again."
      );
      setSuccess("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-blue-100 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-blue-900 mb-4">
        Create Invoice (No PO)
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        noValidate
      >
        <input
          type="text"
          name="clientName"
          placeholder="Client Name (optional)"
          value={form.clientName}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="invoiceNumber"
          placeholder="Invoice Number *"
          value={form.invoiceNumber}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount (PKR) *"
          value={form.amount}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="border p-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          className="col-span-full border p-2 rounded"
        />

        <div className="col-span-full flex justify-end">
          <button
            type="submit"
            className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800"
          >
            Submit Invoice
          </button>
        </div>
      </form>

      {success && <p className="text-green-600 mt-4">{success}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
};

export default CreateInvoiceNoPo;
