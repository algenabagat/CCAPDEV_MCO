console.log('Login script loaded');

$(document).ready(function() {
  // Client-side form validation
  $('#login-form').on('submit', function(e) {
    // Reset validation states
    $(this).find('.is-invalid').removeClass('is-invalid');
    
    let isValid = true;
    
    // Validate email format (DLSU email)
    const email = $('#login-email').val();
    if (!email.match(".+@dlsu\\.edu\\.ph$")) {
      $('#login-email').addClass('is-invalid');
      isValid = false;
    }
    
    // Validate password not empty
    if ($('#login-password').val().trim() === '') {
      $('#login-password').addClass('is-invalid');
      isValid = false;
    }
    
    if (!isValid) {
      e.preventDefault();
    }
  });
  
  // Clear validation on input
  $('input').on('input', function() {
    $(this).removeClass('is-invalid');
  });
});