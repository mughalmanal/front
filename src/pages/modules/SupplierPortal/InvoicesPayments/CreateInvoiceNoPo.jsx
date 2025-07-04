import React, { useState } from 'react';

const CreateInvoiceNoPo = () => {
  const [form, setForm] = useState({
    clientName: '',
    invoiceNumber: '',
    date: '',
    amount: '',
    description: '',
  });

  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Invoice No PO submitted:', form);
    setSuccess('Invoice without PO submitted!');
    setForm({
      clientName: '',
      invoiceNumber: '',
      date: '',
      amount: '',
      description: '',
    });

    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Create Invoice (No PO)</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          placeholder="Invoice Number"
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
          placeholder="Amount (PKR)"
          value={form.amount}
          onChange={handleChange}
          required
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
    </div>
  );
};

export default CreateInvoiceNoPo;
