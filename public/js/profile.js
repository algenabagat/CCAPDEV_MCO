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

  // Technician Edit Elements
  const techEditBtn = document.getElementById('tech-edit-profile-btn');
  const techSaveBtn = document.getElementById('tech-save-profile-btn');
  const techProfileForm = document.getElementById('tech-profile-form');
  const techProfileUpload = document.getElementById('tech-profile-upload');
  
  // Technician Form Elements
  const techNameInput = document.getElementById('tech-name-edit');
  const techBioInput = document.getElementById('tech-bio-edit');
  const techRoleSelect = document.getElementById('tech-role-edit');
  const accountTypeDisplay = document.getElementById('account-type-display');

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

  // Technician Edit Mode Toggle
  if (techEditBtn) {
    techEditBtn.addEventListener('click', () => toggleTechEditMode(true));
  }

  if (techProfileForm) {
    techProfileForm.addEventListener('submit', handleTechProfileUpdate);
  }

  if (techProfileUpload) {
    techProfileUpload.addEventListener('change', handleTechImagePreview);
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

  // Technician Edit Mode Toggle
  function toggleTechEditMode(enable) {
    // Toggle visibility for technician editing
    techEditBtn.classList.toggle('d-none', enable);
    techSaveBtn.classList.toggle('d-none', !enable);
    
    // Toggle fields
    if (techNameInput) techNameInput.classList.toggle('d-none', !enable);
    bioDisplay.classList.toggle('d-none', enable);
    if (techBioInput) techBioInput.classList.toggle('d-none', !enable);
    if (techRoleSelect) {
      techRoleSelect.classList.toggle('d-none', !enable);
      accountTypeDisplay.classList.toggle('d-none', enable);
    }
    if (document.getElementById('tech-pfp-edit-btn')) {
      document.getElementById('tech-pfp-edit-btn').classList.toggle('d-none', !enable);
    }
    
    // Set initial values
    if (enable) {
      if (techNameInput) techNameInput.value = nameDisplay.textContent.trim();
      if (techBioInput) techBioInput.value = bioDisplay.textContent.trim();
    }
  }

  function handleTechImagePreview(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        profileImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleTechProfileUpdate(event) {
    event.preventDefault();
    
    // Parse name input (firstName lastName)
    const nameValue = techNameInput ? techNameInput.value.trim() : '';
    const nameParts = nameValue.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Populate hidden fields
    document.getElementById('tech-firstName-hidden').value = firstName;
    document.getElementById('tech-lastName-hidden').value = lastName;
    document.getElementById('tech-description-hidden').value = techBioInput ? techBioInput.value.trim() : '';
    if (techRoleSelect) document.getElementById('tech-role-hidden').value = techRoleSelect.value;
    
    const formData = new FormData(techProfileForm);
    
    // Add profile picture if selected
    if (techProfileUpload && techProfileUpload.files[0]) {
      formData.append('profilePicture', techProfileUpload.files[0]);
    }

    try {
      const response = await fetch(techProfileForm.action, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        // Update display with new values
        nameDisplay.textContent = `${result.user.firstName} ${result.user.lastName}`;
        bioDisplay.textContent = result.user.description || 'No bio yet.';
        if (techRoleSelect && accountTypeDisplay) {
          accountTypeDisplay.textContent = result.user.role;
        }
        
        // Update profile picture if changed
        if (result.user.profilePicture) {
          profileImage.src = result.user.profilePicture;
        }
        
        // Exit edit mode
        toggleTechEditMode(false);

      } else {
        showAlert(result.error || 'Failed to update profile', 'danger');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('An error occurred while updating the profile', 'danger');
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