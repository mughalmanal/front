import React, { useState } from "react";
import ManageOrders from "./ManageOrders";
import ManageSchedules from "./ManageSchedules";
import AcknowledgeSchedules from "./AcknowledgeSchedules";
import OrdersView from "./OrdersView";

const tabs = [
  { name: "Manage Orders", component: <ManageOrders /> },
  { name: "Manage Schedules", component: <ManageSchedules /> },
  { name: "Acknowledge Schedules", component: <AcknowledgeSchedules /> },
  { name: "Orders View", component: <OrdersView /> },
];

const OrdersModule = () => {
  const [activeTab, setActiveTab] = useState("Manage Orders");

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
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
      <div className="min-h-[200px]">
        {tabs.find((t) => t.name === activeTab)?.component}
      </div>
    </div>
  );
};

export default OrdersModule;
