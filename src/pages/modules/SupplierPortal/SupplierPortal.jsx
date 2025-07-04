import React, { useEffect, useState } from "react";
import OrdersModule from "./Orders/OrdersModule";
import ManageAgreements from "./Agreements/ManageAgreements";
import ShipmentsModule from "./Shipments/ShipmentsModule";
import ReviewConsumption from "./Inventory/ReviewConsumption";
import InvoicesPaymentsModule from "./InvoicesPayments/InvoicesPaymentsModule";
import ManageProfile from "./Profile/ManageProfile";
import SupplierDashboard from "./SupplierDashboard";
import axios from "axios";

const allTabs = [
  { name: "Orders", component: <OrdersModule />, roles: ["admin", "vendor"] },
  { name: "Agreements", component: <ManageAgreements />, roles: ["admin", "vendor"] },
  { name: "Shipments", component: <ShipmentsModule />, roles: ["admin", "vendor"] },
  { name: "Consigned Inventory", component: <ReviewConsumption />, roles: ["admin", "vendor"] },
  { name: "Invoices & Payments", component: <InvoicesPaymentsModule />, roles: ["admin"] },
  { name: "Company Profile", component: <ManageProfile />, roles: ["admin"] },
];

const SupplierPortal = () => {
  const [activeTab, setActiveTab] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  const backendURL = "https://back-7-9sog.onrender.com";

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendURL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRole(res.data.role); // 'admin' or 'vendor'
      } catch (err) {
        console.error("Error fetching role", err);
        setUserRole("vendor"); // fallback role
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-blue-900 font-medium py-16">
        Loading your supplier dashboard...
      </div>
    );
  }

  const tabs = allTabs.filter((tab) => tab.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">
            Supplier Portal
          </h1>
          <p className="text-blue-800 text-sm sm:text-base">
            Welcome back. Manage all supplier operations in one place.
          </p>
        </div>

        {/* Horizontal Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
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

        {/* Module View */}
        {activeTab ? (
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 border border-blue-100">
            {tabs.find((t) => t.name === activeTab)?.component}
          </div>
        ) : (
          <SupplierDashboard />
        )}
      </div>
    </div>
  );
};

export default SupplierPortal;
