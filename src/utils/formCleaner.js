// Utility functions to aggressively clear form data and prevent credential persistence

export const clearLoginForms = () => {
  try {
    // Find and clear all potential login forms
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Find login-related inputs
      const emailInputs = form.querySelectorAll(
        'input[name="email"], input[type="email"], input[name="username"], input[placeholder*="email" i], input[placeholder*="username" i]'
      );
      
      const passwordInputs = form.querySelectorAll(
        'input[name="password"], input[type="password"], input[placeholder*="password" i]'
      );
      
      // Clear and reset autocomplete for email inputs
      emailInputs.forEach(input => {
        input.value = '';
        input.defaultValue = '';
        input.autocomplete = 'new-password';
        
        // Dispatch events to ensure React state updates
        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(inputEvent);
        input.dispatchEvent(changeEvent);
      });
      
      // Clear and reset autocomplete for password inputs
      passwordInputs.forEach(input => {
        input.value = '';
        input.defaultValue = '';
        input.autocomplete = 'new-password';
        
        // Dispatch events to ensure React state updates
        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(inputEvent);
        input.dispatchEvent(changeEvent);
      });
      
      // Reset the entire form
      form.reset();
    });
    
    // Clear any autofill data by manipulating form history
    if ('webkitRequestFileSystem' in window) {
      // Chrome-specific clearing
      const dummyForm = document.createElement('form');
      dummyForm.style.display = 'none';
      
      const dummyEmail = document.createElement('input');
      dummyEmail.type = 'email';
      dummyEmail.name = 'email';
      dummyEmail.autocomplete = 'new-password';
      
      const dummyPassword = document.createElement('input');
      dummyPassword.type = 'password';
      dummyPassword.name = 'password';
      dummyPassword.autocomplete = 'new-password';
      
      dummyForm.appendChild(dummyEmail);
      dummyForm.appendChild(dummyPassword);
      document.body.appendChild(dummyForm);
      
      // Trigger and immediately remove
      setTimeout(() => {
        if (dummyForm.parentNode) {
          dummyForm.parentNode.removeChild(dummyForm);
        }
      }, 100);
    }
    
    console.log('✅ Login forms cleared successfully');
    return true;
    
  } catch (error) {
    console.warn('⚠️ Form clearing encountered an issue:', error);
    return false;
  }
};

export const preventFormPersistence = (formRef, emailRef, passwordRef) => {
  if (!formRef?.current) return;
  
  const form = formRef.current;
  
  // Set up form clearing on various events
  const clearForm = () => {
    if (emailRef?.current) {
      emailRef.current.value = '';
      emailRef.current.autocomplete = 'new-password';
    }
    if (passwordRef?.current) {
      passwordRef.current.value = '';
      passwordRef.current.autocomplete = 'new-password';
    }
    form.reset();
  };
  
  // Clear on form reset
  form.addEventListener('reset', clearForm);
  
  // Clear when form loses focus
  form.addEventListener('blur', clearForm, true);
  
  // Clear on page visibility change
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      clearForm();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Return cleanup function
  return () => {
    form.removeEventListener('reset', clearForm);
    form.removeEventListener('blur', clearForm, true);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

export const disablePasswordManagers = (inputElement) => {
  if (!inputElement) return;
  
  // Set attributes to discourage password managers
  inputElement.setAttribute('autocomplete', 'new-password');
  inputElement.setAttribute('data-lpignore', 'true'); // LastPass
  inputElement.setAttribute('data-1p-ignore', 'true'); // 1Password
  inputElement.setAttribute('data-bwignore', 'true'); // Bitwarden
};