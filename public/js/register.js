$(document).ready(function() {
  // Account type selection UI
  $('#student-btn').on('click', function(e) {
    e.preventDefault();
    $(this).addClass('active').addClass('btn-primary');
    $('#tech-btn').removeClass('active').removeClass('btn-primary');
    $('#account-type').val('student');
  });

  $('#tech-btn').on('click', function(e) {
    e.preventDefault();
    $(this).addClass('active').addClass('btn-primary');
    $('#student-btn').removeClass('active').removeClass('btn-primary');
    $('#account-type').val('technician');
  });

  // Form elements
  const form = $('#registration-form');
  const password = $('#password');
  const confirmPassword = $('#confirm-password');
  const emailInput = $('#email');

  // Validate password match
  function validatePassword() {
    if (password.val() !== confirmPassword.val()) {
      confirmPassword[0].setCustomValidity("Passwords do not match");
      confirmPassword.addClass('is-invalid');
      return false;
    } else {
      confirmPassword[0].setCustomValidity('');
      confirmPassword.removeClass('is-invalid');
      return true;
    }
  }

  // Validate DLSU email format
  function validateEmail() {
    const email = emailInput.val();
    if (!email.endsWith('@dlsu.edu.ph')) {
      emailInput[0].setCustomValidity("Please use a DLSU email address");
      emailInput.addClass('is-invalid');
      return false;
    } else {
      emailInput[0].setCustomValidity('');
      emailInput.removeClass('is-invalid');
      return true;
    }
  }

  // Validate required fields
  function validateRequiredFields() {
    let isValid = true;
    form.find('[required]').each(function() {
      if (!$(this).val()) {
        $(this).addClass('is-invalid');
        isValid = false;
      }
    });
    return isValid;
  }

  // Event listeners
  password.on('change', validatePassword);
  confirmPassword.on('keyup', validatePassword);
  emailInput.on('blur', validateEmail);

  // Clear validation on input
  form.find('input').on('input', function() {
    $(this).removeClass('is-invalid');
  });

  // Form submission handler
  form.on('submit', function(e) {
    // Validate all fields
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isRequiredValid = validateRequiredFields();

    if (!isEmailValid || !isPasswordValid || !isRequiredValid) {
      e.preventDefault();
      e.stopPropagation();
      form.addClass('was-validated');
    }
  });
});