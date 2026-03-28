import { getAppData } from './initData.js';
console.log('Profile script loaded');
console.log('App data:', getAppData());

$(document).ready(function () {
    const loggedIn = sessionStorage.getItem('loggedIn');
    const userEmail = sessionStorage.getItem('userEmail');

    if (!loggedIn || !userEmail) {
        window.location.href = 'login.html';
        return;
    }

    const appData = getAppData();
    const currentUser = appData.users.find(u => u.email === userEmail);

    if (!currentUser) {
        sessionStorage.clear();
        window.location.href = 'login.html';
        return;
    }

    $('#profile-name-display').text(`${currentUser.firstName} ${currentUser.lastName}`);
    $('#greeting-name').text(currentUser.firstName);
    $('#bio-content').text(currentUser.bio || "No bio yet.");
    $('#account-type-display').text(currentUser.accountType);
    $('#email-display').text(currentUser.email);
    $('#profile-image').attr('src', currentUser.profileImage || "img/pfp.png");

    $('#name-edit').val(`${currentUser.firstName} ${currentUser.lastName}`);
    $('#bio-edit').val(currentUser.bio || "");

    $('#edit-profile-btn').on('click', function () {
        const $bioContent = $('#bio-content');
        const $bioEdit = $('#bio-edit');
        const $nameDisplay = $('#profile-name-display');
        const $nameEdit = $('#name-edit');
        const $pfpEditBtn = $('#pfp-edit-btn');
        const $deleteProfileBtn = $('#delete-profile-btn');
        const $editBtn = $(this);

        if ($nameEdit.css('display') === 'block' || $nameEdit.hasClass('d-block')) {
            const [firstName, ...lastNameParts] = $nameEdit.val().split(' ');
            currentUser.firstName = firstName;
            currentUser.lastName = lastNameParts.join(' ');
            currentUser.bio = $bioEdit.val();


            $nameDisplay.text(`${currentUser.firstName} ${currentUser.lastName}`);
            $('#greeting-name').text(currentUser.firstName);
            $bioContent.text(currentUser.bio || "No bio yet.");

            $bioContent.removeClass('d-none');
            $bioEdit.addClass('d-none');
            $nameEdit.hide().removeClass('d-block');
            $nameDisplay.removeClass('d-none');
            $pfpEditBtn.addClass('d-none');
            $deleteProfileBtn.addClass('d-none');

            $editBtn.html('<i class="bi bi-pencil-fill"></i> Edit Profile');
        } else {
            $bioEdit.val(currentUser.bio || "");
            $nameEdit.val(`${currentUser.firstName} ${currentUser.lastName}`);

            $bioContent.addClass('d-none');
            $bioEdit.removeClass('d-none');
            $nameDisplay.addClass('d-none');
            $nameEdit.show().addClass('d-block');
            $pfpEditBtn.removeClass('d-none');
            $deleteProfileBtn.removeClass('d-none');

            $editBtn.html('<i class="bi bi-check"></i> Save Changes');
        }
    });

    $('#delete-profile-btn').on('click', function () {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            sessionStorage.clear();
            window.location.href = 'delete-profile.html';
        }
    });

    $('#profile-upload').on('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                $('#profile-image').attr('src', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
});
