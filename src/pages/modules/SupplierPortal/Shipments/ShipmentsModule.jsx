import React, { useState } from "react";
import CreateASN from "./CreateASN";
import CreateASBN from "./CreateASBN";
import UploadASN from "./UploadASN";
import ManageShipments from "./ManageShipments";
import ViewReceipts from "./ViewReceipts";
import Returns from "./Returns";

const tabs = [
  { name: "Create ASN", component: <CreateASN /> },
  { name: "Create ASBN", component: <CreateASBN /> },
  { name: "Upload ASN", component: <UploadASN /> },
  { name: "Manage Shipments", component: <ManageShipments /> },
  { name: "View Receipts", component: <ViewReceipts /> },
  { name: "Returns", component: <Returns /> },
];

const ShipmentsModule = () => {
  const [activeTab, setActiveTab] = useState(null); // Don't show anything by default

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Shipments</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === tab.name
                ? "bg-blue-900 text-white shadow"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab ? (
        <div className="min-h-[300px]">
          {tabs.find((t) => t.name === activeTab)?.component}
        </div>
      ) : (
        <p className="text-gray-500 text-center">Please select a submodule.</p>
      )}
    </div>
  );
};

export default ShipmentsModule;
