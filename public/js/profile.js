$(document).ready(function() {
    // UI Elements
    const $nameDisplay = $('#profile-name-display');
    const $greetingName = $('#greeting-name');
    const $bioContent = $('#bio-content');
    const $accountTypeDisplay = $('#account-type-display');
    const $emailDisplay = $('#email-display');
    const $profileImage = $('#profile-image');
    const $nameEdit = $('#name-edit');
    const $bioEdit = $('#bio-edit');
    const $editProfileBtn = $('#edit-profile-btn');
    const $pfpEditBtn = $('#pfp-edit-btn');
    const $deleteProfileBtn = $('#delete-profile-btn');
    const $profileUpload = $('#profile-upload');

    // Toggle edit mode
    $editProfileBtn.on('click', function() {
        if ($nameEdit.is(':visible')) {
            // Save mode
            const [firstName, ...lastNameParts] = $nameEdit.val().split(' ');
            const newBio = $bioEdit.val();
            
            $nameDisplay.text($nameEdit.val());
            $greetingName.text(firstName);
            $bioContent.text(newBio || "No bio yet.");
            
            // Hide edit fields
            $bioContent.removeClass('d-none');
            $bioEdit.addClass('d-none');
            $nameEdit.hide();
            $nameDisplay.removeClass('d-none');
            $pfpEditBtn.addClass('d-none');
            $deleteProfileBtn.addClass('d-none');
            
            $editProfileBtn.html('<i class="bi bi-pencil-fill"></i> Edit Profile');
            
            // In a real app, you would submit changes to the server here
        } else {
            // Edit mode
            $bioContent.addClass('d-none');
            $bioEdit.removeClass('d-none');
            $nameDisplay.addClass('d-none');
            $nameEdit.show();
            $pfpEditBtn.removeClass('d-none');
            $deleteProfileBtn.removeClass('d-none');
            
            $editProfileBtn.html('<i class="bi bi-check"></i> Save Changes');
        }
    });

    // Profile picture upload preview
    $profileUpload.on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                $profileImage.attr('src', event.target.result);
                // In a real app, you would upload the image to the server here
            };
            reader.readAsDataURL(file);
        }
    });

    // Delete profile confirmation
    $deleteProfileBtn.on('click', function() {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            // In a real app, this would trigger a server-side deletion
            window.location.href = '/login'; // Redirect after "deletion"
        }
    });

    // Initialize the profile display
    initProfileDisplay();
});