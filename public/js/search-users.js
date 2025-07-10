$(document).ready(function() {
    $('#search-users-form').submit(function() {
        const submitBtn = $(this).find('button[type="submit"]');
        submitBtn.prop('disabled', true).html('<i class="bi bi-search me-2"></i>Searching...');
    });
});