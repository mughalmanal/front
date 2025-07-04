import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import './OrdersView.css';

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://back-7-9sog.onrender.com/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.vendor.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Orders Report', 14, 14);
    autoTable(doc, {
      head: [['Order #', 'Vendor', 'Date', 'Status', 'Item Count']],
      body: filteredOrders.map((order) => [
        order.orderNumber,
        order.vendor,
        new Date(order.date).toLocaleDateString(),
        order.status,
        order.items?.length || 0,
      ]),
    });
    doc.save('orders.pdf');
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(
      filteredOrders.map((order) => ({
        OrderNumber: order.orderNumber,
        Vendor: order.vendor,
        Date: new Date(order.date).toLocaleDateString(),
        Status: order.status,
        Items: order.items?.join(', '),
      }))
    );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="orders-view">
      <h2 className="heading">Orders View</h2>

      <div className="orders-controls">
        <input
          type="text"
          placeholder="Search by Order # or Vendor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button className="btn btn-export" onClick={exportToPDF}>
          Export to PDF
        </button>
        <button className="btn btn-export" onClick={exportToCSV}>
          Export to CSV
        </button>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Vendor</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="6">No orders found.</td>
            </tr>
          ) : (
            filteredOrders.map((order, i) => (
              <React.Fragment key={i}>
                <tr>
                  <td>{order.orderNumber}</td>
                  <td>{order.vendor}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.items?.length}</td>
                  <td>
                    <button
                      className="btn btn-view"
                      onClick={() =>
                        setExpandedRow(expandedRow === i ? null : i)
                      }
                    >
                      {expandedRow === i ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
                {expandedRow === i && (
                  <tr className="expanded-row">
                    <td colSpan="6">
                      <strong>Items:</strong>
                      <ul>
                        {order.items?.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersView;
