    // Edit profile functionality
    $(document).ready(function() {
      $('#edit-profile-btn').on('click', function() {
        const $bioContent = $('#bio-content');
        const $bioEdit = $('#bio-edit');
        const $pfpEditBtn = $('#pfp-edit-btn');
        
        if ($bioContent.hasClass('d-none')) {
          // Save changes
          $bioContent.text($bioEdit.val());
          $bioContent.removeClass('d-none');
          $bioEdit.addClass('d-none');
          $pfpEditBtn.addClass('d-none');
          $(this).html('<i class="bi bi-pencil-fill"></i> Edit Profile')
                 .removeClass('btn-success')
                 .addClass('btn-primary');
        } else {
          // Enter edit mode
          $bioEdit.val($bioContent.text());
          $bioContent.addClass('d-none');
          $bioEdit.removeClass('d-none');
          $pfpEditBtn.removeClass('d-none');
          $(this).html('<i class="bi bi-check"></i> Save Changes')
                 .removeClass('btn-primary')
                 .addClass('btn-success');
        }
      });

      // Profile picture upload functionality
      $('#profile-upload').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(event) {
            $('#profile-image').attr('src', event.target.result);
          }
          reader.readAsDataURL(file);
        }
      });
    });