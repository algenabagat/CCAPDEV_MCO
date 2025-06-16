
// Perform logout actions when page loads

document.addEventListener('DOMContentLoaded', function() {
// Clear all authentication data
sessionStorage.clear();
localStorage.removeItem('currentUser'); // Remove if you have this
document.cookie = 'rememberedUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

// Redirect to home page after a brief delay
setTimeout(function() {
window.location.href = 'index.html';
}, 1500);
});

// Helper function to get cookie value (not used here but included for completeness)
function getCookie(name) {
const value = `; ${document.cookie}`;
const parts = value.split(`; ${name}=`);
if (parts.length === 2) return parts.pop().split(';').shift();
}