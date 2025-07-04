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
  const [selectedOrders, setSelectedOrders] = useState(new Set()); // Use a Set for easy add/remove

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

  // Filter orders by search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.vendor.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Toggle selection of one order
  const toggleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  // Select or deselect all filtered orders
  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      // All selected, so clear
      setSelectedOrders(new Set());
    } else {
      // Select all filtered order IDs
      setSelectedOrders(new Set(filteredOrders.map(o => o._id)));
    }
  };

  // Export to PDF helper for any list of orders
  const exportToPDF = (ordersToExport) => {
    const doc = new jsPDF();
    doc.text('Orders Report', 14, 14);
    autoTable(doc, {
      head: [['Order #', 'Vendor', 'Date', 'Status', 'Item Count']],
      body: ordersToExport.map((order) => [
        order.orderNumber,
        order.vendor,
        new Date(order.date).toLocaleDateString(),
        order.status,
        order.items?.length || 0,
      ]),
    });
    doc.save('orders.pdf');
  };

  // Export to CSV helper for any list of orders
  const exportToCSV = (ordersToExport) => {
    const csv = Papa.unparse(
      ordersToExport.map((order) => ({
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

  // Export all filtered orders
  const handleExportAllPDF = () => exportToPDF(filteredOrders);
  const handleExportAllCSV = () => exportToCSV(filteredOrders);

  // Export selected orders only
  const handleExportSelectedPDF = () => {
    const selected = orders.filter(o => selectedOrders.has(o._id));
    if (selected.length === 0) {
      alert('Please select at least one order to export.');
      return;
    }
    exportToPDF(selected);
  };

  const handleExportSelectedCSV = () => {
    const selected = orders.filter(o => selectedOrders.has(o._id));
    if (selected.length === 0) {
      alert('Please select at least one order to export.');
      return;
    }
    exportToCSV(selected);
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
          aria-label="Search orders"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by order status"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button
          className="btn btn-export"
          onClick={handleExportAllPDF}
          type="button"
        >
          Export All to PDF
        </button>
        <button
          className="btn btn-export"
          onClick={handleExportSelectedPDF}
          type="button"
        >
          Export Selected to PDF
        </button>

        <button
          className="btn btn-export"
          onClick={handleExportAllCSV}
          type="button"
        >
          Export All to CSV
        </button>
        <button
          className="btn btn-export"
          onClick={handleExportSelectedCSV}
          type="button"
        >
          Export Selected to CSV
        </button>
      </div>

      <table className="orders-table" role="grid" aria-label="Orders table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                aria-label="Select all orders"
                checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                onChange={toggleSelectAll}
              />
            </th>
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
              <td colSpan="7" className="no-orders">No orders found.</td>
            </tr>
          ) : (
            filteredOrders.map((order, i) => (
              <React.Fragment key={order._id || i}>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select order ${order.orderNumber}`}
                      checked={selectedOrders.has(order._id)}
                      onChange={() => toggleSelectOrder(order._id)}
                    />
                  </td>
                  <td>{order.orderNumber}</td>
                  <td>{order.vendor}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.items?.length || 0}</td>
                  <td>
                    <button
                      className="btn btn-view"
                      onClick={() =>
                        setExpandedRow(expandedRow === i ? null : i)
                      }
                      aria-expanded={expandedRow === i}
                      aria-controls={`order-details-${i}`}
                      type="button"
                    >
                      {expandedRow === i ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
                {expandedRow === i && (
                  <tr className="expanded-row" id={`order-details-${i}`}>
                    <td colSpan="7">
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
