  // Account type selection
  document.getElementById('student-btn').addEventListener('click', function (e) {
    e.preventDefault();
    this.classList.add('active');
    document.getElementById('tech-btn').classList.remove('active');
    document.getElementById('account-type').value = 'Student';
  });

  document.getElementById('tech-btn').addEventListener('click', function (e) {
    e.preventDefault();
    this.classList.add('active');
    document.getElementById('student-btn').classList.remove('active');
    document.getElementById('account-type').value = 'Technician';
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
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (form.checkValidity()) {
      const accountType = document.getElementById('account-type').value;
      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const user = {
        firstName,
        lastName,
        email,
        password,
        accountType
      };

      // Load existing users
      let users = JSON.parse(localStorage.getItem('users')) || [];

      // Check if email already exists
      const exists = users.some(u => u.email === email);
      if (exists) {
        alert("An account with this email already exists.");
        return;
      }

      // Add new user
      users.push(user);
      localStorage.setItem('users', JSON.stringify(users));

      // Set current logged-in user (optional)
      localStorage.setItem('currentUserEmail', email);

      alert('Registration successful! You can now login.');
      window.location.href = 'login.html';
    } else {
      e.stopPropagation();
      form.classList.add('was-validated');
    }
  });