document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPage();
});

function initializeAdminPage() {
    setupRoleUpdateListeners();
    setupDeleteUserListeners();
    
    setupModal();
}

function setupRoleUpdateListeners() {
    document.querySelectorAll('.btn-update-role').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const row = this.closest('tr');
            const roleSelect = row.querySelector('.role-select');
            const newRole = roleSelect.value;
            const currentRole = roleSelect.getAttribute('data-current-role');
            
            if (newRole === currentRole) {
                return;
            }
            
            updateUserRole(userId, newRole, row);
        });
    });
}

function setupDeleteUserListeners() {
    document.querySelectorAll('.btn-delete-user').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const userName = this.getAttribute('data-user-name');
            
            showDeleteModal(userId, userName);
        });
    });
}

function setupModal() {
    const modal = document.getElementById('deleteModal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelDelete');
    
    closeBtn.addEventListener('click', closeDeleteModal);
    cancelBtn.addEventListener('click', closeDeleteModal);
    
    document.getElementById('confirmDelete').addEventListener('click', function() {
        const userId = this.getAttribute('data-user-id');
        deleteUser(userId);
        closeDeleteModal();
    });
}

async function updateUserRole(userId, newRole, row) {
    try {
        const response = await fetch('/admin/update-role', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                newRole: newRole
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const roleBadge = row.querySelector('.badge');
            if (roleBadge) {
                roleBadge.textContent = newRole;
                roleBadge.className = `badge role-${newRole}`;
            }
            
            const roleSelect = row.querySelector('.role-select');
            if (roleSelect) {
                roleSelect.setAttribute('data-current-role', newRole);
            }
            alert('Role updated successfully!');
        }
    } catch (error) {
        console.error('Error updating user role:', error);
    }
}

function showDeleteModal(userId, userName) {
    const modal = document.getElementById('deleteModal');
    const userNameElement = document.getElementById('deleteUserName');
    const confirmButton = document.getElementById('confirmDelete');
    
    userNameElement.textContent = userName;
    confirmButton.setAttribute('data-user-id', userId);
    
    modal.style.display = 'block';
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'none';
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`/admin/delete-user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const row = document.querySelector(`tr[data-user-id="${userId}"]`);
            if (row) {
                row.remove();
            }
            alert('User deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}