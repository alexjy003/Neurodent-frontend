// Debug script to check authentication state
const checkAuthState = () => {
  console.log('=== AUTH DEBUG ===');
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('token:', localStorage.getItem('token'));
  console.log('adminToken:', localStorage.getItem('adminToken'));
  console.log('doctorToken:', localStorage.getItem('doctorToken'));
  console.log('pharmacistToken:', localStorage.getItem('pharmacistToken'));
  console.log('user:', localStorage.getItem('user'));
  console.log('adminUser:', localStorage.getItem('adminUser'));
  console.log('doctorInfo:', localStorage.getItem('doctorInfo'));
  console.log('pharmacistData:', localStorage.getItem('pharmacistData'));
  console.log('==================');
};

// Export for use in browser console
window.checkAuthState = checkAuthState;

export default checkAuthState;