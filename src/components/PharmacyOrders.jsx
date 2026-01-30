import React, { useState, useEffect } from 'react'
import { Package, Pill, CreditCard, CheckCircle, Clock, AlertCircle, User, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../utils/config'

const PharmacyOrders = ({ user }) => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(null)

  useEffect(() => {
    fetchAllocatedPrescriptions()
  }, [])

  const fetchAllocatedPrescriptions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login to view pharmacy orders')
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/prescriptions/patient/allocated-medicines`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (data.success && data.prescriptions) {
        setPrescriptions(data.prescriptions)
      } else {
        console.error('Failed to fetch prescriptions:', data.message)
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      toast.error('Failed to load pharmacy orders')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalAmount = (prescription) => {
    return prescription.medications.reduce((total, med) => {
      if (med.medicineId && med.allocatedQuantity) {
        return total + (med.medicineId.unitPrice * med.allocatedQuantity)
      }
      return total
    }, 0)
  }

  const handlePayment = async (prescriptionId) => {
    try {
      setProcessingPayment(prescriptionId)
      const token = localStorage.getItem('token')
      
      // Create Razorpay order
      const orderResponse = await fetch(
        `${API_BASE_URL}/prescriptions/${prescriptionId}/create-payment-order`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        toast.error(orderData.message || 'Failed to create payment order')
        setProcessingPayment(null)
        return
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Initialize Razorpay payment
      const options = {
        key: 'rzp_test_RVOOPqMxyaqcQR',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Neurodent',
        description: 'Medicine Payment',
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(
              `${API_BASE_URL}/prescriptions/${prescriptionId}/payment`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              }
            )

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              toast.success('Payment successful! Your medicines will be prepared.')
              await fetchAllocatedPrescriptions()
            } else {
              toast.error(verifyData.message || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Error verifying payment:', error)
            toast.error('Failed to verify payment')
          } finally {
            setProcessingPayment(null)
          }
        },
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          contact: user?.phone || ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled')
            setProcessingPayment(null)
          }
        }
      }

      const razorpayInstance = new window.Razorpay(options)
      razorpayInstance.open()

    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Failed to initiate payment')
      setProcessingPayment(null)
    }
  }

  const handleDownloadReceipt = (prescriptionId) => {
    const token = localStorage.getItem('token')
    window.open(
      `${API_BASE_URL}/prescriptions/${prescriptionId}/payment-receipt?token=${token}`,
      '_blank'
    )
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'processing': return <Clock className="w-4 h-4" />
      case 'paid': return <CheckCircle className="w-4 h-4" />
      case 'completed': return <Package className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pharmacy orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Pharmacy Orders</h2>
            <p className="text-blue-100">Manage your prescribed medicines and payments</p>
          </div>
          <Package className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      {/* Prescriptions with allocated medicines */}
      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pharmacy Orders Yet</h3>
          <p className="text-gray-600">
            When a pharmacist allocates medicines to your prescription, they will appear here for payment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {prescriptions.map((prescription) => {
            const totalAmount = calculateTotalAmount(prescription)
            const isPaid = prescription.paymentStatus === 'paid'

            return (
              <div key={prescription._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                {/* Prescription Header */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Pill className="w-5 h-5 mr-2 text-blue-600" />
                      Prescription {prescription._id.slice(-8)}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(prescription.paymentStatus || 'processing')}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.paymentStatus || 'processing')}`}>
                        {isPaid ? 'Paid' : 'Processing'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      Dr. {prescription.doctorId?.firstName} {prescription.doctorId?.lastName}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(prescription.allocatedAt)}
                    </div>
                  </div>
                </div>

                {/* Allocated Medicines */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Allocated Medicines</h4>
                  <div className="space-y-3">
                    {prescription.medications
                      .filter(med => med.allocated && med.medicineId)
                      .map((med, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {/* Medicine Image */}
                            <div className="w-12 h-12 flex-shrink-0">
                              {med.medicineId.image?.url ? (
                                <img
                                  src={med.medicineId.image.url}
                                  alt={med.medicineId.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                  <Pill className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Medicine Info */}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{med.medicineId.name}</p>
                              <p className="text-sm text-gray-600">
                                {med.dosage} - {med.duration}
                              </p>
                              <p className="text-xs text-gray-500">
                                Quantity: {med.allocatedQuantity}
                              </p>
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{med.medicineId.unitPrice * med.allocatedQuantity}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₹{med.medicineId.unitPrice} × {med.allocatedQuantity}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Total and Payment */}
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">₹{totalAmount}</span>
                  </div>
                  
                  {!isPaid ? (
                    <button
                      onClick={() => handlePayment(prescription._id)}
                      disabled={processingPayment === prescription._id}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {processingPayment === prescription._id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          <span>Pay Now</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <p className="text-green-800 font-medium">Payment Completed</p>
                        <p className="text-sm text-green-600">Your medicines are being prepared</p>
                      </div>
                      <button
                        onClick={() => handleDownloadReceipt(prescription._id)}
                        className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download Receipt</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PharmacyOrders
