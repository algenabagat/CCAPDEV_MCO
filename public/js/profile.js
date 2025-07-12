document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const editBtn = document.getElementById('edit-profile-btn');
  const saveBtn = document.getElementById('save-profile-btn');
  const profileForm = document.getElementById('profile-form');
  const profileUpload = document.getElementById('profile-upload');
  
  // Form Elements
  const nameDisplay = document.getElementById('profile-name-display');
  const nameInput = document.getElementById('name-edit');
  const bioDisplay = document.getElementById('bio-content');
  const bioInput = document.getElementById('bio-edit');
  const profileImage = document.getElementById('profile-image');

  // Toggle Edit Mode
  if (editBtn) {
    editBtn.addEventListener('click', () => toggleEditMode(true));
  }

  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }

  if (profileUpload) {
    profileUpload.addEventListener('change', handleImagePreview);
  }

  function toggleEditMode(enable) {
    // Toggle visibility
    editBtn.classList.toggle('d-none', enable);
    saveBtn.classList.toggle('d-none', !enable);
    
    // Toggle fields
    nameInput.classList.toggle('d-none', !enable);
    bioDisplay.classList.toggle('d-none', enable);
    bioInput.classList.toggle('d-none', !enable);
    document.getElementById('pfp-edit-btn').classList.toggle('d-none', !enable);
    
    // Set initial values
    if (enable) {
      nameInput.value = nameDisplay.textContent.trim();
      bioInput.value = bioDisplay.textContent.trim();
    }
  }

  function handleImagePreview(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        profileImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleProfileUpdate(event) {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('firstName', nameInput.value.split(' ')[0]);
      formData.append('lastName', nameInput.value.split(' ')[1] || '');
      formData.append('description', bioInput.value);
      
      if (profileUpload.files[0]) {
        formData.append('profilePicture', profileUpload.files[0]);
      }

      const response = await fetch(`/profile/${getUserEmail()}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json(); 
      
      if (!response.ok) throw new Error(data.error || 'Update failed');

      // Update UI
      nameDisplay.textContent = `${data.user.firstName} ${data.user.lastName}`;
      bioDisplay.textContent = data.user.description;
      
      if (data.user.profilePicture) {
        profileImage.src = data.user.profilePicture;
      }

      // Hide "Save Changes" and show "Edit Profile" after successful update
      toggleEditMode(false);
    } catch (error) {
      showAlert(error.message || 'Failed to update profile', 'error');
    }
  }

  function getUserEmail() {
    return document.getElementById('email-display').textContent;
  }

  function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.prepend(alert);
    setTimeout(() => alert.remove(), 3000);
  }
});