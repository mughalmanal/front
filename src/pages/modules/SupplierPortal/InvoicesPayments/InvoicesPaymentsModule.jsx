import React, { useState, Suspense, lazy } from "react";

// Lazy load tabs components (assumes these components exist and handle backend themselves)
const CreateInvoice = lazy(() => import("./CreateInvoice"));
const CreateInvoiceNoPo = lazy(() => import("./CreateInvoiceNoPo"));
const ViewInvoices = lazy(() => import("./ViewInvoices"));
const ViewPayments = lazy(() => import("./ViewPayments"));

const tabs = [
  { name: "Create Invoice", component: CreateInvoice },
  { name: "Create Invoice (No PO)", component: CreateInvoiceNoPo },
  { name: "View Invoices", component: ViewInvoices },
  { name: "View Payments", component: ViewPayments },
];

// Simple error boundary component for tab content
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error in tab component:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 font-semibold p-4">
          Something went wrong loading this tab.
        </div>
      );
    }
    return this.props.children;
  }
}

const InvoicesPaymentsModule = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  const ActiveComponent = tabs.find((t) => t.name === activeTab)?.component;

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-blue-100 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Invoices & Payments</h2>

      {/* Tabs */}
      <div
        className="flex flex-wrap gap-3 mb-6"
        role="tablist"
        aria-label="Invoices and Payments Tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.name}
            role="tab"
            aria-selected={activeTab === tab.name}
            tabIndex={activeTab === tab.name ? 0 : -1}
            onClick={() => setActiveTab(tab.name)}
            onKeyDown={(e) => {
              // Keyboard navigation: left/right arrow keys
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                let currentIndex = tabs.findIndex((t) => t.name === activeTab);
                if (e.key === "ArrowRight") {
                  currentIndex = (currentIndex + 1) % tabs.length;
                } else {
                  currentIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                }
                setActiveTab(tabs[currentIndex].name);
              }
            }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition select-none focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              activeTab === tab.name
                ? "bg-blue-900 text-white shadow-lg"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab content area */}
      <div
        className="min-h-[400px] border border-blue-200 rounded p-6 bg-blue-50"
        role="tabpanel"
        aria-live="polite"
        aria-atomic="true"
      >
        <TabErrorBoundary>
          <Suspense
            fallback={
              <div className="text-center text-blue-700 font-semibold">
                Loading {activeTab}...
              </div>
            }
          >
            {ActiveComponent && <ActiveComponent />}
          </Suspense>
        </TabErrorBoundary>
      </div>
    </div>
  );
};

export default InvoicesPaymentsModule;
