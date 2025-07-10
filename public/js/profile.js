document.addEventListener('DOMContentLoaded', function() {
  const editBtn = document.getElementById('edit-profile-btn');
  const cancelBtn = document.getElementById('cancel-edit');
  const editForm = document.getElementById('edit-form');
  const viewMode = document.getElementById('view-mode');
  const updateForm = document.getElementById('profile-update-form');

  // Toggle edit mode
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      viewMode.classList.add('d-none');
      editForm.classList.remove('d-none');
    });
  }

  // Cancel edit
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      editForm.classList.add('d-none');
      viewMode.classList.remove('d-none');
    });
  }

  // Form submission
  if (updateForm) {
    updateForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        description: document.getElementById('description').value
      };

      try {
        const response = await fetch(window.location.pathname, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
          // Update the displayed values
          document.getElementById('profile-name-display').textContent = 
            `${data.user.firstName} ${data.user.lastName}`;
          document.getElementById('bio-content').textContent = 
            data.user.description || 'No bio yet.';
          
          // Switch back to view mode
          editForm.classList.add('d-none');
          viewMode.classList.remove('d-none');
          
          // Show success message
          alert('Profile updated successfully!');
        } else {
          alert(data.error || 'Failed to update profile');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the profile');
      }
    });
  }
});