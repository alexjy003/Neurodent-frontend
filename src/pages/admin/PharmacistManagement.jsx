import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaEyeSlash, FaUser, FaPhone, FaEnvelope, FaBirthdayCake, FaVenusMars, FaClock, FaMedkit, FaToggleOn, FaToggleOff, FaImage, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

const PharmacistManagement = () => {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPharmacist, setEditingPharmacist] = useState(null);
  const [viewPharmacist, setViewPharmacist] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    shift: '',
    specialization: '',
    availability: 'Active',
    profileImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchPharmacists();
  }, []);

  const fetchPharmacists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/pharmacists');
      if (response.data.success) {
        setPharmacists(response.data.data.pharmacists);
      }
    } catch (error) {
      console.error('Error fetching pharmacists:', error);
      toast.error('Failed to load pharmacists');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      shift: '',
      specialization: '',
      availability: 'Active',
      profileImage: null
    });
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, profileImage: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profileImage: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'profileImage' && formData[key]) {
          submitData.append('profileImage', formData[key]);
        } else if (key !== 'profileImage') {
          submitData.append(key, formData[key]);
        }
      });

      let response;
      if (editingPharmacist) {
        response = await api.put(`/api/pharmacists/${editingPharmacist._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post('/api/pharmacists', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        toast.success(response.data.message);
        
        // Show additional info if email was sent (for new pharmacists)
        if (!editingPharmacist && response.data.data.emailSent) {
          toast.success('Login credentials sent to pharmacist\'s email!', {
            duration: 5000
          });
          
          // Show preview URL for test emails
          if (response.data.data.emailPreview) {
            console.log('Email preview available at:', response.data.data.emailPreview);
            toast.success('📧 Check console for email preview link', {
              duration: 3000
            });
          }
        } else if (!editingPharmacist && !response.data.data.emailSent) {
          toast.error('Pharmacist added but email failed to send. Please contact them manually.', {
            duration: 6000
          });
        }

        fetchPharmacists();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving pharmacist:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save pharmacist';
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg || err.message);
        });
      }
    }
  };

  const handleDelete = async (pharmacistId) => {
    if (!window.confirm('Are you sure you want to delete this pharmacist?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/pharmacists/${pharmacistId}`);
      if (response.data.success) {
        toast.success('Pharmacist deleted successfully');
        fetchPharmacists();
      }
    } catch (error) {
      console.error('Error deleting pharmacist:', error);
      toast.error('Failed to delete pharmacist');
    }
  };

  const toggleAvailability = async (pharmacist) => {
    try {
      const newAvailability = pharmacist.availability === 'Active' ? 'Inactive' : 'Active';
      const response = await api.put(`/api/pharmacists/${pharmacist._id}`, {
        availability: newAvailability
      });
      
      if (response.data.success) {
        toast.success(`Pharmacist ${newAvailability.toLowerCase()}`);
        fetchPharmacists();
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleEdit = (pharmacist) => {
    setEditingPharmacist(pharmacist);
    setFormData({
      firstName: pharmacist.firstName,
      lastName: pharmacist.lastName,
      email: pharmacist.email,
      phone: pharmacist.phone,
      dateOfBirth: pharmacist.dateOfBirth?.split('T')[0] || '',
      gender: pharmacist.gender,
      shift: pharmacist.shift,
      specialization: pharmacist.specialization,
      availability: pharmacist.availability,
      profileImage: null
    });
    setImagePreview(pharmacist.profileImage || null);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setEditingPharmacist(null);
    setViewPharmacist(null);
    resetForm();
  };

  const handleView = (pharmacist) => {
    setViewPharmacist(pharmacist);
    setShowViewModal(true);
  };

  const filteredPharmacists = pharmacists.filter(pharmacist =>
    pharmacist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacist.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacist.shift?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pharmacist Management</h1>
        <p className="text-gray-600">Manage pharmacy staff and their profiles</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search pharmacists..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          Add Pharmacist
        </button>
      </div>

      {/* Pharmacists Grid */}
      {filteredPharmacists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💊</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No pharmacists found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first pharmacist'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacists.map((pharmacist) => (
            <div key={pharmacist._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Profile Image */}
                <div className="flex justify-center mb-4">
                  {pharmacist.profileImage ? (
                    <img
                      src={pharmacist.profileImage}
                      alt={pharmacist.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-green-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                      <FaUser className="text-green-600 text-2xl" />
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{pharmacist.name}</h3>
                  <p className="text-green-600 font-medium">{pharmacist.specialization}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {pharmacist.availability === 'Active' ? (
                      <FaToggleOn className="text-green-500 text-xl" />
                    ) : (
                      <FaToggleOff className="text-gray-400 text-xl" />
                    )}
                    <span className={`text-sm font-medium ${
                      pharmacist.availability === 'Active' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {pharmacist.availability}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaEnvelope className="text-blue-500" />
                    <span className="truncate">{pharmacist.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaPhone className="text-green-500" />
                    <span>{pharmacist.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaClock className="text-orange-500" />
                    <span>{pharmacist.shift}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaVenusMars className="text-purple-500" />
                    <span>{pharmacist.gender}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    onClick={() => handleView(pharmacist)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(pharmacist)}
                    className="text-yellow-600 hover:text-yellow-800 transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => toggleAvailability(pharmacist)}
                    className={`${
                      pharmacist.availability === 'Active' 
                        ? 'text-orange-600 hover:text-orange-800' 
                        : 'text-green-600 hover:text-green-800'
                    } transition-colors`}
                    title={`Mark as ${pharmacist.availability === 'Active' ? 'Inactive' : 'Active'}`}
                  >
                    {pharmacist.availability === 'Active' ? <FaToggleOff /> : <FaToggleOn />}
                  </button>
                  <button
                    onClick={() => handleDelete(pharmacist._id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingPharmacist ? 'Edit Pharmacist' : 'Add New Pharmacist'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* Profile Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <FaImage className="text-gray-400 text-2xl" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  {!editingPharmacist && (
                    <p className="text-xs text-blue-600 mt-1">
                      💡 Login credentials will be auto-generated and sent to this email
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.shift}
                    onChange={(e) => setFormData(prev => ({ ...prev, shift: e.target.value }))}
                  >
                    <option value="">Select Shift</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="Full-time">Full-time</option>
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.availability}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Specialization */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Clinical Pharmacy, Pediatric Pharmacy, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingPharmacist ? 'Update Pharmacist' : 'Add Pharmacist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewPharmacist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Pharmacist Details</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              {/* Profile Section */}
              <div className="text-center mb-6">
                {viewPharmacist.profileImage ? (
                  <img
                    src={viewPharmacist.profileImage}
                    alt={viewPharmacist.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-green-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <FaUser className="text-green-600 text-3xl" />
                  </div>
                )}
                <h3 className="text-2xl font-semibold text-gray-800 mt-4">{viewPharmacist.name}</h3>
                <p className="text-green-600 font-medium">{viewPharmacist.specialization}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {viewPharmacist.availability === 'Active' ? (
                    <FaToggleOn className="text-green-500 text-xl" />
                  ) : (
                    <FaToggleOff className="text-gray-400 text-xl" />
                  )}
                  <span className={`text-sm font-medium ${
                    viewPharmacist.availability === 'Active' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {viewPharmacist.availability}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaEnvelope className="text-blue-500" />
                    <span className="font-medium text-gray-700">Email</span>
                  </div>
                  <p className="text-gray-800">{viewPharmacist.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaPhone className="text-green-500" />
                    <span className="font-medium text-gray-700">Phone</span>
                  </div>
                  <p className="text-gray-800">{viewPharmacist.phone}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaBirthdayCake className="text-pink-500" />
                    <span className="font-medium text-gray-700">Date of Birth</span>
                  </div>
                  <p className="text-gray-800">
                    {viewPharmacist.dateOfBirth ? new Date(viewPharmacist.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaVenusMars className="text-purple-500" />
                    <span className="font-medium text-gray-700">Gender</span>
                  </div>
                  <p className="text-gray-800">{viewPharmacist.gender}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaClock className="text-orange-500" />
                    <span className="font-medium text-gray-700">Shift</span>
                  </div>
                  <p className="text-gray-800">{viewPharmacist.shift}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMedkit className="text-red-500" />
                    <span className="font-medium text-gray-700">Department</span>
                  </div>
                  <p className="text-gray-800">{viewPharmacist.department || 'Pharmacy'}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Account Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Created: {new Date(viewPharmacist.createdAt).toLocaleDateString()}</p>
                  {viewPharmacist.lastLogin && (
                    <p>Last Login: {new Date(viewPharmacist.lastLogin).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistManagement;
