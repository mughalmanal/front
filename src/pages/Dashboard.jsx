import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ERP Modules
import SupplierPortal from "./modules/SupplierPortal/SupplierPortal";
import CreateInvoice from "./modules/Invoices/CreateInvoice";
import ViewInvoices from "./modules/Invoices/ViewInvoices";
import Clients from "./modules/Clients/Clients";
import StockIn from "./modules/StockIn/StockIn";
import StockOut from "./modules/StockOut/StockOut";
import PurchaseOrders from "./modules/PurchaseOrders/PurchaseOrders";
import PaymentEntries from "./modules/PaymentEntries/PaymentEntries";
import Reports from "./modules/Reports/Reports";
import Products from "./modules/Products/ProductManagement";
import VendorManagement from "./modules/VendorManagement/Vendors";

const modules = [
  "Dashboard",
  "Product & Stock Management",
  "Stock In",
  "Stock Out",
  "Clients Management",
  "Vendor Management",
  "Invoices",
  "Purchase Orders",
  "Payment Entries",
  "Reports (Client/Vendor Ledger)",
  "Supplier Portal",
];

function Dashboard() {
  const [activeModule, setActiveModule] = useState("Dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const renderModule = () => {
    switch (activeModule) {
      case "Dashboard":
        return (
          <div className="bg-white p-8 rounded-xl shadow text-gray-600">
            <p className="text-2xl font-bold text-blue-900 mb-2">ERP Dashboard</p>
            <p className="text-sm">Select a module from the top menu to begin.</p>
          </div>
        );
      case "Product & Stock Management":
        return <Products />;
      case "Stock In":
        return <StockIn />;
      case "Stock Out":
        return <StockOut />;
      case "Clients Management":
        return <Clients />;
      case "Vendor Management":
        return <VendorManagement />;
      case "Invoices":
        return (
          <div className="space-y-6">
            <CreateInvoice />
            <ViewInvoices />
          </div>
        );
      case "Purchase Orders":
        return <PurchaseOrders />;
      case "Payment Entries":
        return <PaymentEntries />;
      case "Reports (Client/Vendor Ledger)":
        return <Reports />;
      case "Supplier Portal":
        return <SupplierPortal />;
      default:
        return (
          <div className="bg-white p-8 rounded-xl shadow text-gray-600">
            <p className="text-lg font-semibold">
              Welcome to the <span className="text-blue-900">{activeModule}</span> module.
            </p>
            <p className="text-sm mt-2 text-gray-500">
              This section is currently under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 to-blue-50 font-sans">
      {/* Top Navbar */}
      <div className="bg-white shadow-md flex justify-between items-center px-6 py-4 sticky top-0 z-50 border-b border-blue-100">
        <div className="flex flex-wrap gap-2">
          {modules.map((mod) => (
            <button
              key={mod}
              onClick={() => setActiveModule(mod)}
              className={`text-sm px-4 py-2 rounded-full transition font-medium ${
                activeModule === mod
                  ? "bg-blue-900 text-white shadow-md"
                  : "text-blue-900 hover:bg-blue-100"
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="text-sm px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
        >
          Logout
        </button>
      </div>

      {/* Main Module Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-3xl font-bold text-blue-900 mb-6 border-b pb-2 border-blue-200">
          {activeModule}
        </div>
        {renderModule()}
      </div>
    </div>
  );
}

export default Dashboard;
