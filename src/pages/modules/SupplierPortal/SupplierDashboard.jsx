import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import axios from "axios";

const COLORS = ["#007bff", "#28a745", "#dc3545"];

const SupplierDashboard = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [shipmentsData, setShipmentsData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendURL = "https://back-7-9sog.onrender.com";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendURL}/api/dashboard/summary`);
      const { ordersByStatus, monthlyShipments, inventoryLevels } = res.data;
      setOrdersData(ordersByStatus);
      setShipmentsData(monthlyShipments);
      setInventoryData(inventoryLevels);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-blue-900 text-center py-8">Loading dashboard...</div>;

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {/* Orders Pie Chart */}
      <div className="bg-white rounded-xl shadow p-4 border border-blue-100">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Orders by Status</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={ordersData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              label
            >
              {ordersData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Shipment Line Chart */}
      <div className="bg-white rounded-xl shadow p-4 border border-blue-100">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Monthly Shipments</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={shipmentsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="shipments" stroke="#007bff" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Bar Chart */}
      <div className="bg-white rounded-xl shadow p-4 border border-blue-100">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Inventory Levels</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={inventoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="qty" fill="#28a745" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SupplierDashboard;
