$(document).ready(function() {
  // Display logout message/confirmation
  const $logoutMessage = $('.logout-message');
  const $countdown = $('.countdown');
  let seconds = 3;

  // Show initial message
  $logoutMessage.text('Logging out...');
  
  // Start countdown timer
  const timer = setInterval(function() {
    seconds--;
    $countdown.text(seconds);
    
    if (seconds <= 0) {
      clearInterval(timer);

      $logoutMessage.text('Redirecting to homepage...');
    }
  }, 1000);
});