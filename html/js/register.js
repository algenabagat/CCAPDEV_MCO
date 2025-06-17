// register.js
import { getAppData } from './initData.js';
console.log('Register script loaded');
console.log('App data:', getAppData());

document.addEventListener('DOMContentLoaded', function() {
  // Account type selection
  document.getElementById('student-btn').addEventListener('click', function(e) {
    e.preventDefault();
    this.classList.add('active');
    document.getElementById('tech-btn').classList.remove('active');
    document.getElementById('account-type').value = 'student';
  });

  document.getElementById('tech-btn').addEventListener('click', function(e) {
    e.preventDefault();
    this.classList.add('active');
    document.getElementById('student-btn').classList.remove('active');
    document.getElementById('account-type').value = 'technician';
  });

  // Form validation
  const form = document.getElementById('registration-form');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');

  function validatePassword() {
    if (password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity("Passwords do not match");
      confirmPassword.classList.add('is-invalid');
    } else {
      confirmPassword.setCustomValidity('');
      confirmPassword.classList.remove('is-invalid');
    }
  }

  password.addEventListener('change', validatePassword);
  confirmPassword.addEventListener('keyup', validatePassword);

  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (form.checkValidity()) {
      const appData = getAppData();
      const accountType = document.getElementById('account-type').value;
      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Check if email already exists
      const exists = appData.users.some(u => u.email === email);
      if (exists) {
        alert("An account with this email already exists.");
        return;
      }

      // Add new user
      const newUser = {
        firstName,
        lastName,
        email,
        password,
        accountType: accountType.toLowerCase(),
        bio: ''
      };

      sessionStorage.setItem('currentUser', JSON.stringify(newUser));

      alert('Registration successful! You can now login.');
      window.location.href = 'login.html';
    } else {
      e.stopPropagation();
      form.classList.add('was-validated');
    }
  });
});