// login.js
import { getAppData } from './initData.js';
console.log('Login script loaded');
console.log('App data:', getAppData());

document.addEventListener('DOMContentLoaded', function() {
  // Check for remembered user on page load
  checkRememberedUser();
  
  // Handle form submission
  document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Get current data
    const appData = getAppData();
    
    // Find user in data
    const user = appData.users.find(u => u.email === email && u.password === password);

    if (user) {
      handleSuccessfulLogin(email, user.accountType, rememberMe);
    } else {
      showError('Invalid email or password');
    }
  });
});

// Check if user is remembered and auto-login if cookie exists
function checkRememberedUser() {
  const rememberCookie = getCookie('rememberedUser');
  if (rememberCookie) {
    try {
      const userData = JSON.parse(rememberCookie);
      document.getElementById('login-email').value = userData.email;
      document.getElementById('remember-me').checked = true;
      
      // Check if the remembered user exists in our data
      const appData = getAppData(); // Get current data
      const userExists = appData.users.some(u => u.email === userData.email);
      if (userExists) {
        // Extend remember period by 3 weeks
        setRememberCookie(userData.email);    
        const user = appData.users.find(u => u.email === userData.email);
        handleSuccessfulLogin(userData.email, user.accountType, true);
      }
    } catch (e) {
      console.error('Error parsing remember cookie', e);
    }
  }
}

function handleSuccessfulLogin(email, accountType, rememberMe) {
  if (rememberMe) {
    setRememberCookie(email);
  } else {
    // Clear remember cookie if not checked
    document.cookie = 'rememberedUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  // Store session data
  sessionStorage.setItem('loggedIn', 'true');
  sessionStorage.setItem('userEmail', email);
  sessionStorage.setItem('accountType', accountType);

  window.location.href = 'profile.html';
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger mt-3';
  errorDiv.textContent = message;

  const form = document.getElementById('login-form');
  const existingError = form.querySelector('.alert');
  if (existingError) {
    existingError.remove();
  }

  form.appendChild(errorDiv);
}

// Helper function to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Helper function to set remember cookie
function setRememberCookie(email) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 21); // 3 weeks
  document.cookie = `rememberedUser=${JSON.stringify({ email })}; expires=${expiryDate.toUTCString()}; path=/`;
}