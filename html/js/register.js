import { getAppData } from './initData.js';
console.log('Register script loaded');
console.log('App data:', getAppData());

$(document).ready(function() {
  // Account type selection
  $('#student-btn').on('click', function(e) {
    e.preventDefault();
    $(this).addClass('active');
    $('#tech-btn').removeClass('active');
    $('#account-type').val('student');
  });

  $('#tech-btn').on('click', function(e) {
    e.preventDefault();
    $(this).addClass('active');
    $('#student-btn').removeClass('active');
    $('#account-type').val('technician');
  });

  // Form validation
  const form = $('#registration-form');
  const password = $('#password');
  const confirmPassword = $('#confirm-password');

  function validatePassword() {
    if (password.val() !== confirmPassword.val()) {
      confirmPassword[0].setCustomValidity("Passwords do not match");
      confirmPassword.addClass('is-invalid');
    } else {
      confirmPassword[0].setCustomValidity('');
      confirmPassword.removeClass('is-invalid');
    }
  }

  password.on('change', validatePassword);
  confirmPassword.on('keyup', validatePassword);

  // Form submission
  form.on('submit', function(e) {
    e.preventDefault();

    if (form[0].checkValidity()) {
      const appData = getAppData();
      const accountType = $('#account-type').val();
      const firstName = $('#first-name').val();
      const lastName = $('#last-name').val();
      const email = $('#email').val();
      const password = $('#password').val();

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
      form.addClass('was-validated');
    }
  });
});