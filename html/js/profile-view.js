document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const loggedIn = sessionStorage.getItem('loggedIn');
    
    if (!loggedIn) {
      window.location.href = 'login.html';
      return;
    }

    // Get the email from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const viewedEmail = urlParams.get('email');
    
    if (!viewedEmail) {
      window.location.href = 'search-users.html';
      return;
    }

    // Load all users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find the viewed user
    const viewedUser = users.find(u => u.email === viewedEmail);
    
    if (!viewedUser) {
      // User not found, redirect back to search
      window.location.href = 'search-users.html';
      return;
    }

    // Display user data (read-only)
    document.getElementById('profile-name-display').textContent = 
      `${viewedUser.firstName} ${viewedUser.lastName}`;
    document.getElementById('bio-content').textContent = viewedUser.bio || "No bio yet.";
    document.getElementById('account-type-display').textContent = viewedUser.accountType;
    document.getElementById('email-display').textContent = viewedUser.email;
    document.getElementById('profile-image').src = viewedUser.profileImage || "img/pfp.png";
});