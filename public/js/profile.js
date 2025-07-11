document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const editBtn = document.getElementById('edit-profile-btn');
  const saveBtn = document.getElementById('save-profile-btn');
  const deleteBtn = document.getElementById('delete-profile-btn');
  
  // Form Elements
  const nameDisplay = document.getElementById('profile-name-display');
  const nameInput = document.getElementById('name-edit');
  const bioDisplay = document.getElementById('bio-content');
  const bioInput = document.getElementById('bio-edit');

  // Toggle Edit Mode
  if (editBtn) {
    editBtn.addEventListener('click', () => toggleEditMode(true));
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', handleProfileUpdate);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleAccountDeletion);
  }

  function toggleEditMode(enable) {
    // Toggle visibility
    editBtn.classList.toggle('d-none', enable);
    saveBtn.classList.toggle('d-none', !enable);
    deleteBtn.classList.toggle('d-none', !enable);
    
    // Toggle fields
    nameDisplay.classList.toggle('d-none', enable);
    nameInput.classList.toggle('d-none', !enable);
    bioDisplay.classList.toggle('d-none', enable);
    bioInput.classList.toggle('d-none', !enable);
    
    // Set initial values
    if (enable) {
      nameInput.value = nameDisplay.textContent;
      bioInput.value = bioDisplay.textContent;
    }
  }

  async function handleProfileUpdate() {
    try {
      const response = await fetch(`/api/profile/${getUserEmail()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: nameInput.value.split(' ')[0],
          lastName: nameInput.value.split(' ')[1] || '',
          description: bioInput.value
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Update failed');

      // Update UI on success
      nameDisplay.textContent = `${data.user.firstName} ${data.user.lastName}`;
      bioDisplay.textContent = data.user.description;
      
      showAlert('Profile updated!', 'success');
      toggleEditMode(false);
    } catch (error) {
      //showAlert(error.message, 'error');
      //console.error('Update error:', error);
    }
  }

  function handleAccountDeletion() {
    if (confirm('Permanently delete your account?')) {
      window.location.href = '/delete-account';
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