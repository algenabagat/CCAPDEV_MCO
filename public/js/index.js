      $(document).ready(function() {
      const getStartedBtn = document.getElementById('get-started-btn');
      const logoutBtn = document.getElementById('logout-btn');
      const btnText = document.getElementById('btn-text');
    
      // Check if user is logged in
      const loggedIn = sessionStorage.getItem('loggedIn');
      const userEmail = sessionStorage.getItem('userEmail');
    
      if (loggedIn && userEmail) {
        // User is logged in
        getStartedBtn.onclick = function() {
          window.location.href = 'profile.html';
        };
        btnText.textContent = 'Go to Profile';
        logoutBtn.classList.remove('d-none');
      } else {
      // User is not logged in
        getStartedBtn.onclick = function() {
          window.location.href = 'login.html';
        };
        btnText.textContent = 'Get Started!';
        logoutBtn.classList.add('d-none');
      }
    
      // Handle logout
      logoutBtn.addEventListener('click', function() {
        // Clear session data
        sessionStorage.clear();
        // Redirect to logout page
        window.location.href = 'logout.html';
      });
    });