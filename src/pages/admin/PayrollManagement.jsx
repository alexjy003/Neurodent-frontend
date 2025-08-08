import React, { useState } from 'react'
import { 
  DollarSign, 
  Download,
  Filter,
  Calendar,
  User,
  Check,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp
} from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

const PayrollManagement = () => {
  const [payrollData, setPayrollData] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Orthodontist',
      type: 'Doctor',
      baseSalary: 12000,
      bonus: 2000,
      deductions: 500,
      netPay: 13500,
      payPeriod: '2024-01',
      status: 'paid',
      payDate: '2024-01-31',
      hoursWorked: 160,
      overtimeHours: 8
    },
    {
      id: 2,
      name: 'Dr. Michael Smith',
      role: 'Oral Surgeon',
      type: 'Doctor',
      baseSalary: 15000,
      bonus: 3000,
      deductions: 800,
      netPay: 17200,
      payPeriod: '2024-01',
      status: 'paid',
      payDate: '2024-01-31',
      hoursWorked: 160,
      overtimeHours: 12
    },
    {
      id: 3,
      name: 'Dr. Emily Williams',
      role: 'Pediatric Dentist',
      type: 'Doctor',
      baseSalary: 8000,
      bonus: 1000,
      deductions: 400,
      netPay: 8600,
      payPeriod: '2024-01',
      status: 'pending',
      payDate: null,
      hoursWorked: 80,
      overtimeHours: 0
    },
    {
      id: 4,
      name: 'Lisa Anderson',
      role: 'Receptionist',
      type: 'Employee',
      baseSalary: 2800,
      bonus: 200,
      deductions: 150,
      netPay: 2850,
      payPeriod: '2024-01',
      status: 'paid',
      payDate: '2024-01-31',
      hoursWorked: 160,
      overtimeHours: 5
    },
    {
      id: 5,
      name: 'James Wilson',
      role: 'Pharmacist',
      type: 'Employee',
      baseSalary: 4500,
      bonus: 300,
      deductions: 200,
      netPay: 4600,
      payPeriod: '2024-01',
      status: 'pending',
      payDate: null,
      hoursWorked: 160,
      overtimeHours: 0
    },
    {
      id: 6,
      name: 'Maria Garcia',
      role: 'Dental Hygienist',
      type: 'Employee',
      baseSalary: 3500,
      bonus: 250,
      deductions: 175,
      netPay: 3575,
      payPeriod: '2024-01',
      status: 'paid',
      payDate: '2024-01-31',
      hoursWorked: 160,
      overtimeHours: 3
    }
  ])

  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01')

  const filteredPayroll = payrollData.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesPeriod = item.payPeriod === selectedPeriod
    return matchesType && matchesStatus && matchesPeriod
  })

  const totalPayroll = filteredPayroll.reduce((sum, item) => sum + item.netPay, 0)
  const paidAmount = filteredPayroll.filter(item => item.status === 'paid').reduce((sum, item) => sum + item.netPay, 0)
  const pendingAmount = filteredPayroll.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.netPay, 0)

  const handlePayEmployee = (employeeId) => {
    setPayrollData(payrollData.map(employee => 
      employee.id === employeeId 
        ? { ...employee, status: 'paid', payDate: new Date().toISOString().split('T')[0] }
        : employee
    ))
    toast.success('Payment processed successfully!')
  }

  const exportPayrollPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Add title
    pdf.setFontSize(20)
    pdf.text('Neurodent Payroll Report', 20, 20)
    
    // Add period
    pdf.setFontSize(12)
    pdf.text(`Pay Period: ${selectedPeriod}`, 20, 35)
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45)
    
    // Add summary
    pdf.setFontSize(14)
    pdf.text('Summary', 20, 65)
    pdf.setFontSize(10)
    pdf.text(`Total Payroll: $${totalPayroll.toLocaleString()}`, 20, 75)
    pdf.text(`Paid Amount: $${paidAmount.toLocaleString()}`, 20, 85)
    pdf.text(`Pending Amount: $${pendingAmount.toLocaleString()}`, 20, 95)
    
    // Add table headers
    let yPos = 115
    pdf.setFontSize(8)
    pdf.text('Name', 20, yPos)
    pdf.text('Role', 60, yPos)
    pdf.text('Base Salary', 100, yPos)
    pdf.text('Bonus', 130, yPos)
    pdf.text('Net Pay', 155, yPos)
    pdf.text('Status', 180, yPos)
    
    // Add data rows
    filteredPayroll.forEach((employee, index) => {
      yPos += 10
      if (yPos > 270) {
        pdf.addPage()
        yPos = 20
      }
      
      pdf.text(employee.name.substring(0, 20), 20, yPos)
      pdf.text(employee.role.substring(0, 15), 60, yPos)
      pdf.text(`$${employee.baseSalary.toLocaleString()}`, 100, yPos)
      pdf.text(`$${employee.bonus.toLocaleString()}`, 130, yPos)
      pdf.text(`$${employee.netPay.toLocaleString()}`, 155, yPos)
      pdf.text(employee.status, 180, yPos)
    })
    
    pdf.save(`payroll-${selectedPeriod}.pdf`)
    toast.success('Payroll report exported successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600">Manage employee salaries and payments</p>
        </div>
        <button
          onClick={exportPayrollPDF}
          className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-900">${totalPayroll.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-gray-900">${paidAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">${pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Employees</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPayroll.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2024-01">January 2024</option>
                <option value="2023-12">December 2023</option>
                <option value="2023-11">November 2023</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Doctor">Doctors</option>
                <option value="Employee">Employees</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Salary</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bonus</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Pay</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayroll.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        employee.type === 'Doctor' ? 'bg-teal-500' : 'bg-blue-500'
                      }`}>
                        {employee.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">${employee.baseSalary.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">${employee.bonus.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-red-600">-${employee.deductions.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">${employee.netPay.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.hoursWorked}h</div>
                    {employee.overtimeHours > 0 && (
                      <div className="text-xs text-orange-600">+{employee.overtimeHours}h OT</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center ${
                        employee.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {employee.status === 'paid' ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {employee.status}
                      </span>
                    </div>
                    {employee.payDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Paid: {new Date(employee.payDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {employee.status === 'pending' && (
                        <button
                          onClick={() => handlePayEmployee(employee.id)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors duration-200"
                        >
                          Pay Now
                        </button>
                      )}
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Overview by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Salary Overview by Role</h3>
          <div className="space-y-4">
            {/* Doctors */}
            <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl">
              <div>
                <h4 className="font-semibold text-teal-900">Doctors</h4>
                <p className="text-sm text-teal-600">
                  {filteredPayroll.filter(emp => emp.type === 'Doctor').length} employees
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-teal-900">
                  ${filteredPayroll
                    .filter(emp => emp.type === 'Doctor')
                    .reduce((sum, emp) => sum + emp.netPay, 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-teal-600">Total</p>
              </div>
            </div>

            {/* Employees */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <h4 className="font-semibold text-blue-900">Staff</h4>
                <p className="text-sm text-blue-600">
                  {filteredPayroll.filter(emp => emp.type === 'Employee').length} employees
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-900">
                  ${filteredPayroll
                    .filter(emp => emp.type === 'Employee')
                    .reduce((sum, emp) => sum + emp.netPay, 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">Total</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center">
                <Check className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-green-900">Paid</h4>
                  <p className="text-sm text-green-600">
                    {filteredPayroll.filter(emp => emp.status === 'paid').length} payments
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-green-900">${paidAmount.toLocaleString()}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-orange-900">Pending</h4>
                  <p className="text-sm text-orange-600">
                    {filteredPayroll.filter(emp => emp.status === 'pending').length} payments
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-orange-900">${pendingAmount.toLocaleString()}</p>
            </div>
          </div>

          {pendingAmount > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  You have {filteredPayroll.filter(emp => emp.status === 'pending').length} pending payments totaling ${pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PayrollManagement