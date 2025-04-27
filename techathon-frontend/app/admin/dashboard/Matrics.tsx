import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
// Chart components removed
import { Clock, DollarSign, ShoppingBag } from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    pending_orders: [],
    total_sales: 0,
    avg_fulfillment_minutes: 0,
    orders_by_status: []
  });
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize socket connection and fetch initial data
  useEffect(() => {
    // Fetch initial dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:4000/dashboard/metrics');
        const data = await response.json();
        setDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    // Initialize socket connection
    const socketConnection = io('http://localhost:4000');
    setSocket(socketConnection);

    // Listen for real-time dashboard updates
    socketConnection.on('dashboard-update', (data) => {
      setDashboardData(prevData => ({
        ...prevData,
        pending_orders: data.pending_orders,
        total_sales: data.total_sales,
        avg_fulfillment_minutes: data.avg_fulfillment_minutes,
        orders_by_status: data.orders_by_status
      }));
    });
    
    // Listen for new order creation - matches your order controller's emit
    socketConnection.on('new_order', () => {
      fetchDashboardData(); // Refresh all data when a new order is created
    });
    
    // Listen for order status updates
    socketConnection.on('order_status_updated', () => {
      fetchDashboardData(); // Refresh all data when an order status changes
    });

    fetchDashboardData();

    // Clean up on unmount
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date/time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate wait time in minutes
  const calculateWaitTime = (placedAt) => {
    const orderTime = new Date(placedAt);
    const currentTime = new Date();
    const diffMinutes = Math.floor((currentTime - orderTime) / (1000 * 60));
    return diffMinutes;
  };

  // No chart-related helper functions needed

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Sales Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Total Sales</h2>
                <p className="text-2xl font-bold">{formatCurrency(dashboardData.total_sales)}</p>
              </div>
            </div>
          </div>
          
          {/* Average Fulfillment Time Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Avg. Fulfillment Time</h2>
                <p className="text-2xl font-bold">{dashboardData.avg_fulfillment_minutes} min</p>
              </div>
            </div>
          </div>
          
          {/* Pending Orders Count */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Pending Orders</h2>
                <p className="text-2xl font-bold">{dashboardData.pending_orders ? dashboardData.pending_orders.length : 0}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart section removed as requested */}
        
        {/* Pending Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Pending Orders (Real-time)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {dashboardData.pending_orders && dashboardData.pending_orders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No pending orders</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placed At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wait Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.pending_orders && dashboardData.pending_orders.map((order) => {
                    const waitTime = calculateWaitTime(order.placed_at);
                    const waitTimeClass = waitTime > 20 ? 'text-red-600 font-bold' : waitTime > 10 ? 'text-orange-500' : 'text-green-600';
                    
                    return (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.table_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <ul className="list-disc pl-5">
                            {order.items && order.items.map((item, idx) => (
                              <li key={idx}>{item.quantity}x {item.name}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.placed_at)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${waitTimeClass}`}>{waitTime} mins</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(order.total_amount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;