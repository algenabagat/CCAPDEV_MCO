import { getAppData } from './initData.js';
console.log('Profile script loaded');
console.log('App data:', getAppData());

$(document).ready(function () {
    // Check if user is logged in
    const loggedIn = sessionStorage.getItem('loggedIn');

    /*
    if (!loggedIn) {
        window.location.href = 'login.html';
        return;
    }
    */

    // Get the email from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const viewedEmail = urlParams.get('email');

    if (!viewedEmail) {
        window.location.href = 'search-users.html';
        return;
    }

    // Load all users from localStorage
    const appData = getAppData();

    // Find the viewed user
    const viewedUser = appData.users.find(u => u.email === viewedEmail);

    if (!viewedUser) {
        // User not found, redirect back to search
        window.location.href = 'search-users.html';
        return;
    }

    // Display user data (read-only)
    $('#profile-name-display').text(`${viewedUser.firstName} ${viewedUser.lastName}`);
    $('#bio-content').text(viewedUser.bio || "No bio yet.");
    $('#account-type-display').text(viewedUser.accountType);
    $('#email-display').text(viewedUser.email);
    $('#profile-image').attr('src', viewedUser.profileImage || "img/pfp.png");
});
