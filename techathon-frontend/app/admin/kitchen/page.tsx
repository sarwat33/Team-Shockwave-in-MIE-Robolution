'use client'

import { useEffect, useState } from 'react'
import io from 'socket.io-client'

const API_URL = 'http://localhost:4000'
const socket = io(API_URL)

type MenuItem = {
  id: number
  menu_item_id: number
  name: string
  description: string
  category: string
  price_snapshot: string
  quantity: number
}

type Order = {
  orderId: number
  id?: number
  tableId: number
  table_id?: number
  status: 'pending' | 'in-progress' | 'completed'
  items?: MenuItem[]
}

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  console.log(orders)

  // Fetch existing orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/orders`)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        const normalizedOrders = data.map((order: any) => ({
          orderId: order.id,
          tableId: order.table_id,
          status: order.status,
          items: order.items || []
        }))

        setOrders(normalizedOrders)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setError('Failed to load orders. Please refresh.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Socket connection for real-time updates
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to kitchen channel')
    })

    socket.on('new_order', (order) => {
      const normalizedOrder = {
        orderId: order.orderId || order.id,
        tableId: order.tableId || order.table_id,
        status: order.status || 'pending',
        items: order.items || [] // Include items in new orders
      }

      setOrders((prev) => [normalizedOrder, ...prev])
    })

    socket.on('order_updated', (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) =>
          (order.orderId === updatedOrder.id || order.orderId === updatedOrder.orderId)
            ? {
                ...order,
                status: updatedOrder.status,
                orderId: updatedOrder.id || updatedOrder.orderId,
                tableId: updatedOrder.table_id || updatedOrder.tableId,
                items: updatedOrder.items || order.items // Preserve existing items or update with new ones
              }
            : order
        )
      )
    })

    return () => {
      socket.off('new_order')
      socket.off('order_updated')
    }
  }, [])

  const updateOrderStatus = async (orderId: number, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus,   })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      // UI updates via socket.io
    } catch (err) {
      console.error('Failed to update order:', err)
      setError('Failed to update order. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'beverage':
        return '🥤'
      case 'appetizer':
        return '🍟'
      case 'main course':
        return '🍽️'
      case 'dessert':
        return '🍰'
      default:
        return '📋'
    }
  }

  // Filter orders based on selected status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  if (loading) return <div className="p-6">Loading orders...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧑‍🍳 Kitchen Orders</h1>
      
      {/* Add filter controls */}
      <div className="mb-4 flex gap-2">
        <button 
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          All Orders
        </button>
        <button 
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1 rounded ${statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-100'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setStatusFilter('in-progress')}
          className={`px-3 py-1 rounded ${statusFilter === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-blue-100'}`}
        >
          In Progress
        </button>
        <button 
          onClick={() => setStatusFilter('completed')}
          className={`px-3 py-1 rounded ${statusFilter === 'completed' ? 'bg-green-500 text-white' : 'bg-green-100'}`}
        >
          Completed
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-gray-500">No {statusFilter !== 'all' ? statusFilter : ''} orders at the moment</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <div key={order.orderId} className="p-4 bg-white shadow rounded border-l-4 border-l-blue-500">
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold">Order #{order.orderId}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="mb-2"><strong>Table:</strong> {order.tableId}</p>
              
              {/* Items breakdown section */}
              <div className="mt-3 border-t pt-2">
                <p className="font-semibold text-sm mb-2">Items to prepare:</p>
                <ul className="divide-y">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <li key={idx} className="py-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryIcon(item.category)}</span>
                            <div>
                              <p className="font-medium">{item.quantity}× {item.name}</p>
                              {item.description && (
                                <p className="text-xs text-gray-600">{item.description}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full h-6 flex items-center">
                            {item.category}
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-2 text-gray-500 text-sm">No items available</li>
                  )}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, 'in-progress')}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Start Preparing
                  </button>
                )}

                {order.status === 'in-progress' && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, 'completed')}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    Mark Complete
                  </button>
                )}
                
                {order.status === 'completed' && (
                  <span className="px-3 py-1 text-green-700 text-sm">
                    ✓ Order Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}