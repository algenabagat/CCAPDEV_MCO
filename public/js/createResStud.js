document.addEventListener('DOMContentLoaded', () => {
  const seatLayout = document.getElementById('seat-layout');
  const roomName = document.getElementById('room-name');
  const labImage = document.getElementById('lab-image');
  const anonymousCheckbox = document.getElementById('anonymous-checkbox');
  const reserveButton = document.getElementById('reserve-button');
  const dateInput = document.getElementById('reservationDate');
  const timeInput = document.getElementById('reservationTime');

  // Initialize seat data and current lab
  const labOrder = Object.keys(seatData);
  let currentLab = 0;
  let selectedSeats = new Set();

  // Function to render seats based on the current lab
  function renderSeats(labIndex, overrideSeats = null) {
  const labKey = labOrder[labIndex];
  const seats = overrideSeats || seatData[labKey] || [];

  roomName.textContent = `Room: ${labKey}`;
  seatLayout.innerHTML = '';
  selectedSeats.clear();

  seats.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'seat';
    div.textContent = `Seat ${i + 1}`;

    // Update lab image
    if (window.labs && window.labs.length) {
      const labObj = window.labs.find(l => l.name === labKey);
      if (labObj && labObj.image) {
        labImage.src = labObj.image;
      }
    }

    const isUserSeat = typeof editMode !== 'undefined' &&
      editMode &&
      reservationToEdit &&
      reservationToEdit.lab === labKey &&
      reservationToEdit.seatNumbers.includes(i + 1);

    if (s.occupied) {
      // Seat is reserved by someone else or the user
      div.classList.add('occupied');
      if (s.user) {
        const userDisplay = document.createElement('div');
        userDisplay.style.fontSize = '0.75rem';
        userDisplay.innerHTML = s.user.anonymous
          ? 'Anonymous'
          : `<a href="/profile/${encodeURIComponent(s.user.email)}">${s.user.name}</a>`;
        div.appendChild(userDisplay);
      }

      // If this is the user's reserved seat in edit mode, preselect it
      if (isUserSeat) {
        div.classList.add('selected');
        selectedSeats.add(i);
      }
    } else {
      // Seat is available
      div.classList.add('available');

      // Preselect if it's the user's seat
      if (isUserSeat) {
        div.classList.add('selected');
        selectedSeats.add(i);
      }

      div.addEventListener('click', () => {
        if (selectedSeats.has(i)) {
          selectedSeats.delete(i);
          div.classList.remove('selected');
        } else {
          selectedSeats.add(i);
          div.classList.add('selected');
        }
      });
    }

    seatLayout.appendChild(div);
  });
}


  // Function to update seat availability based on selected date and time
  async function updateSeatAvailability() {
    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;
    const labKey = labOrder[currentLab];

    // If no date or time selected, return early
    if (!selectedDate || !selectedTime) return;

    // Fetch available seats for the selected lab, date, and time
    const response = await fetch('/reservations/check-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        labName: labKey,
        date: selectedDate,
        time: selectedTime
      })
    });

    // Parse the response and update seat data
    const data = await response.json();
    if (data.success) {
      seatData[labKey] = data.seatData;
      renderSeats(currentLab);
    } else {
      console.error(data.message);
    }
  }

  // Event listeners for date and time inputs
  dateInput.addEventListener('change', updateSeatAvailability);
  timeInput.addEventListener('change', updateSeatAvailability);

  // Handle lab selection
  document.querySelectorAll('.account-type-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.account-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentLab = index;
      updateSeatAvailability();
    });
  });

  // Helper to get query param
  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  // Pre-fill form if in edit mode
  if (typeof editMode !== 'undefined' && editMode && typeof reservationToEdit !== 'undefined') {
    // Set lab, date, time, seat, anonymous
    // You may need to trigger UI updates for seat selection, lab selection, etc.
    document.getElementById('reservationDate').value = reservationToEdit.date;
    document.getElementById('reservationTime').value = reservationToEdit.time;
    document.getElementById('anonymous-checkbox').checked = reservationToEdit.isAnonymous;
    // TODO: Pre-select lab and seats in the UI if your seat grid supports it
  }

  // Handle reservation creation or update
  reserveButton.addEventListener('click', async () => {
    const labKey = labOrder[currentLab];
    const isAnonymous = anonymousCheckbox.checked;

    // Validate selected seats
    if (selectedSeats.size === 0) {
      alert('Please select at least one seat.');
      return;
    }

    // Validate date and time
    const date = dateInput.value;
    const time = timeInput.value;
    if (!date || !time) {
      alert('Please select date and time.');
      return;
    }
    
    // Check if in edit mode
    const reservationId = document.getElementById('reservationId') ? document.getElementById('reservationId').value : null;
    if (reservationId) {
      // Edit mode: send update to backend
      const response = await fetch(`/reservations/edit/${reservationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labName: labKey,
          seatIndices: Array.from(selectedSeats),
          reservationDate: date,
          reservationTime: time,
          isAnonymous
        })
      });
      const result = await response.json();
      if (result.success) {
        alert('Reservation updated successfully!');
        window.location.href = '/reservations/my-reservations';
      } else {
        alert(`Update failed: ${result.message}`);
      }
      return;
    }
    // Create mode (existing logic)
    const response = await fetch('/reservations/create-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        labName: labKey,
        seatIndices: Array.from(selectedSeats),
        reservationDate: date,
        reservationTime: time,
        isAnonymous
      })
    });
    const result = await response.json();
    if (result.success) {
      alert('Reservation successful!');
      location.reload();
    } else {
      alert(`Reservation failed: ${result.message}`);
    }
  });

  renderSeats(currentLab);
});
