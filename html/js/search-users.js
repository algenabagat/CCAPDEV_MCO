import { getAppData } from './initData.js';
console.log('Search Users script loaded');
console.log('App data:', getAppData()); 

$(document).ready(function() {
    $('#search-users-form').submit(function(e) {
        e.preventDefault();
        
        // Get search parameters
        const name = $('#search-name').val().toLowerCase();
        const email = $('#search-email').val().toLowerCase();
        const accountType = $('#search-account-type').val();
        
        // Get all users from localStorage
        const allUsers = getAppData();
        
        // Filter users based on search criteria
        const results = allUsers.users.filter(user => {
            const matchesName = !name || 
                user.firstName.toLowerCase().includes(name) || 
                user.lastName.toLowerCase().includes(name);
            const matchesEmail = !email || user.email.toLowerCase().includes(email);
            const matchesType = !accountType || user.accountType === accountType;
            
            return matchesName && matchesEmail && matchesType;
        });
        
        displayResults(results);
        $('#search-results').show();
    });
    
    function displayResults(users) {
        const $tbody = $('#results-body');
        $tbody.empty();
        
        if (users.length === 0) {
            $tbody.append(`
                <tr>
                    <td colspan="4" class="text-center">No users found matching your criteria</td>
                </tr>
            `);
            return;
        }
        
        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.firstName} ${user.lastName}</td>
                    <td>${user.email}</td>
                    <td>${user.accountType === 'student' ? 'Student' : 'Lab Technician'}</td>
                    <td>
                        <a href="profile-view.html?email=${encodeURIComponent(user.email)}" class="btn btn-primary btn-sm">
                            <i class="bi bi-eye-fill"></i> View Profile
                        </a>
                    </td>
                </tr>
`;
            $tbody.append(row);
        });
    }
});