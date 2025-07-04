import React, { useState } from 'react';
import CreateInvoice from './CreateInvoice';
import CreateInvoiceNoPo from './CreateInvoiceNoPo';
import ViewInvoices from './ViewInvoices';
import ViewPayments from './ViewPayments';

const tabs = [
  { name: 'Create Invoice', component: <CreateInvoice /> },
  { name: 'Create Invoice (No PO)', component: <CreateInvoiceNoPo /> },
  { name: 'View Invoices', component: <ViewInvoices /> },
  { name: 'View Payments', component: <ViewPayments /> },
];

const InvoicesPaymentsModule = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Invoices & Payments</h2>

      {/* Top Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === tab.name
                ? 'bg-blue-900 text-white shadow'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="min-h-[300px]">
        {tabs.find((t) => t.name === activeTab)?.component}
      </div>
    </div>
  );
};

export default InvoicesPaymentsModule;
