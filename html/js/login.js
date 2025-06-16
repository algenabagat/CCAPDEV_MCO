      document.addEventListener('DOMContentLoaded', function() {
        checkRememberedUser();
      });

      // Check if user is remembered and auto-login if cookie exists
      function checkRememberedUser() {
        const rememberCookie = getCookie('rememberedUser');
        if (rememberCookie) {
          try {
            const userData = JSON.parse(rememberCookie);
            document.getElementById('login-email').value = userData.email;
            document.getElementById('remember-me').checked = true;
            
            // In a real app, you would verify credentials with server
            // For this demo, we'll just redirect if the stored user exists
            const storedUser = localStorage.getItem('user');
            if (storedUser && JSON.parse(storedUser).email === userData.email) {
              // Extend remember period by 3 weeks
              setRememberCookie(userData.email);
              window.location.href = 'profile.html';
            }
          } catch (e) {
            console.error('Error parsing remember cookie', e);
          }
        }
      }

      // Handle form submission
      document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
  
        // Get stored users (in a real app, this would be a server call)
        const storedUsers = localStorage.getItem('users');

        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const user = users.find(u => u.email === email);

          if (user && user.password === password) {
            // Successful login
            if (rememberMe) {
              setRememberCookie(email);
            } else {
              // Clear remember cookie if not checked
              document.cookie = 'rememberedUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }
      
            // Store session data
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('accountType', user.accountType);
      
            window.location.href = 'profile.html';
            if (window.parent.updateAuthUI) {
              window.parent.updateAuthUI();
            }
          } else {
            showError('Invalid email or password');
          }
        } else {
          showError('No user found. Please register first.');
        }
      });

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

      // Set remember me cookie (expires in 3 weeks)
      function setRememberCookie(email) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 21); // 3 weeks
        document.cookie = `rememberedUser=${JSON.stringify({ email: email })}; expires=${expirationDate.toUTCString()}; path=/`;
      }

      // Helper function to get cookie value
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      }