import React, { useState, useMemo } from "react";
import ManageOrders from "./ManageOrders";
import ManageSchedules from "./ManageSchedules";
import AcknowledgeSchedules from "./AcknowledgeSchedules";
import OrdersView from "./OrdersView";

const tabs = [
  { name: "Manage Orders", Component: ManageOrders },
  { name: "Manage Schedules", Component: ManageSchedules },
  { name: "Acknowledge Schedules", Component: AcknowledgeSchedules },
  { name: "Orders View", Component: OrdersView },
];

const OrdersModule = () => {
  const [activeTab, setActiveTab] = useState("Manage Orders");

  // Memoize the rendered components to preserve state between tab switches
  const renderedTabs = useMemo(() => {
    const map = {};
    tabs.forEach(({ name, Component }) => {
      map[name] = <Component key={name} />;
    });
    return map;
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-blue-100 max-w-full">
      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {tabs.map(({ name }) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === name
                ? "bg-blue-900 text-white shadow"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
            type="button"
            aria-selected={activeTab === name}
            role="tab"
            tabIndex={activeTab === name ? 0 : -1}
            aria-controls={`tabpanel-${name.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className="min-h-[200px]"
        role="tabpanel"
        id={`tabpanel-${activeTab.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {renderedTabs[activeTab] || <p>Tab not found.</p>}
      </div>
    </div>
  );
};

export default OrdersModule;
