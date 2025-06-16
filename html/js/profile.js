document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const loggedIn = sessionStorage.getItem('loggedIn');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!loggedIn || !userEmail) {
      window.location.href = 'login.html';
      return;
    }
    
    // Check if this is a profile view 
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('email')) {
      window.location.href = `profile-view.html?email=${encodeURIComponent(urlParams.get('email'))}`;
      return;
    }

    // Load all users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find current user
    const currentUser = users.find(u => u.email === userEmail);
    
    if (!currentUser) {
      // User not found, clear session and redirect to login
      sessionStorage.clear();
      window.location.href = 'login.html';
      return;
    }

    // Display user data (no defaults set)
    document.getElementById('profile-name-display').textContent = 
      `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('greeting-name').textContent = currentUser.firstName;
    document.getElementById('bio-content').textContent = currentUser.bio || "No bio yet.";
    document.getElementById('account-type-display').textContent = currentUser.accountType;
    document.getElementById('email-display').textContent = currentUser.email;
    document.getElementById('profile-image').src = currentUser.profileImage || "img/pfp.png";

    // Initialize edit fields
    document.getElementById('name-edit').value = 
      `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('bio-edit').value = currentUser.bio || "";

    // Edit profile functionality
    document.getElementById('edit-profile-btn').addEventListener('click', function() {
      const bioContent = document.getElementById('bio-content');
      const bioEdit = document.getElementById('bio-edit');
      const nameDisplay = document.getElementById('profile-name-display');
      const nameEdit = document.getElementById('name-edit');
      const pfpEditBtn = document.getElementById('pfp-edit-btn');
      const deleteProfileBtn = document.getElementById('delete-profile-btn');
      const editBtn = this;
      
      if (nameEdit.style.display === 'block' || nameEdit.classList.contains('d-block')) {
        // Save changes
        const [firstName, ...lastNameParts] = nameEdit.value.split(' ');
        currentUser.firstName = firstName;
        currentUser.lastName = lastNameParts.join(' ');
        currentUser.bio = bioEdit.value;
        
        // Update in users array
        const userIndex = users.findIndex(u => u.email === userEmail);
        if (userIndex !== -1) {
          users[userIndex] = currentUser;
          localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Update display
        nameDisplay.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('greeting-name').textContent = currentUser.firstName;
        bioContent.textContent = currentUser.bio || "No bio yet.";
        
        // Hide edit elements
        bioContent.classList.remove('d-none');
        bioEdit.classList.add('d-none');
        nameEdit.style.display = 'none';
        nameEdit.classList.remove('d-block');
        nameDisplay.classList.remove('d-none');
        pfpEditBtn.classList.add('d-none');
        deleteProfileBtn.classList.add('d-none');
        
        // Change button back to edit mode
        this.innerHTML = '<i class="bi bi-pencil-fill"></i> Edit Profile';
      } else {
        // Enter edit mode
        bioEdit.value = currentUser.bio || "";
        nameEdit.value = `${currentUser.firstName} ${currentUser.lastName}`;
        
        // Show edit elements
        bioContent.classList.add('d-none');
        bioEdit.classList.remove('d-none');
        nameDisplay.classList.add('d-none');
        nameEdit.style.display = 'block';
        nameEdit.classList.add('d-block');
        pfpEditBtn.classList.remove('d-none');
        deleteProfileBtn.classList.remove('d-none');
        
        // Change button to save mode
        this.innerHTML = '<i class="bi bi-check"></i> Save Changes';
      }
    });

    // Delete profile functionality
    document.getElementById('delete-profile-btn').addEventListener('click', function() {
      if (confirm("Are you sure you want to delete your account? Deleting your account will remove all your data. This action cannot be undone.")) {
        // Remove user from users array
        const userIndex = users.findIndex(u => u.email === userEmail);
        if (userIndex !== -1) {
          users.splice(userIndex, 1);
          localStorage.setItem('users', JSON.stringify(users));
          
          // Clear session and redirect to login
          sessionStorage.clear();
          window.location.href = 'delete-profile.html';
        }
      }
    });

    // Profile picture upload functionality
    document.getElementById('profile-upload').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          // Update the image display
          document.getElementById('profile-image').src = event.target.result;
          
          // Update in users array
          currentUser.profileImage = event.target.result;
          const userIndex = users.findIndex(u => u.email === userEmail);
          if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
          }
        }
        reader.readAsDataURL(file);
      }
    });
  });
