document.addEventListener('DOMContentLoaded', () => {
  const seatLayout = document.getElementById('seat-layout');
  const roomName = document.getElementById('room-name');
  const labImage = document.getElementById('lab-image');
  const reserveButton = document.getElementById('reserve-button');
  const studentSelect = document.getElementById('student-select');
  const dateInput = document.getElementById('reservationDate');
  const timeInput = document.getElementById('reservationTime');
  const anonymousCheckbox = document.getElementById('anonymous-checkbox');

  // Initialize seat data and current lab
  const labOrder = Object.keys(seatData);
  let currentLab = 0;
  let selectedSeats = new Set();

  // Function to render seats based on the current lab
  function renderSeats(labIndex, overrideSeats = null) {
    const labKey = labOrder[labIndex];
    const seats = overrideSeats || seatData[labKey] || [];

    // Update room name and clear previous seats
    roomName.textContent = `Room: ${labKey}`;
    seatLayout.innerHTML = '';
    selectedSeats.clear();

    // Update lab image
    if (window.labs && window.labs.length) {
      const labObj = window.labs.find(l => l.name === labKey);
      if (labObj && labObj.image) {
        labImage.src = labObj.image;
      }
    }

    // Create seat elements
    seats.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = `seat ${s.occupied ? 'occupied' : 'available'}`;
      div.textContent = `Seat ${i + 1}`;

      // If seat is occupied, show user info
      if (s.occupied && s.user) {
        const userDisplay = document.createElement('div');
        userDisplay.style.fontSize = '0.75rem';
        // Display user info or anonymous
        userDisplay.innerHTML = s.user.anonymous
          ? 'Anonymous'
          : `<a href="/profile/${encodeURIComponent(s.user.email)}">${s.user.name}</a>`;
        div.appendChild(userDisplay);
      } 
      // If seat is available, add click event to select/deselect
      else if (!s.occupied) {
        div.addEventListener('click', () => {
          // Toggle seat selection
          if (selectedSeats.has(i)) {
            selectedSeats.delete(i);
            div.classList.remove('selected');
          } 
          // If not selected, add to selection
          else {
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

    // Fetch seat availability for the selected lab, date, and time
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

  // Handle student selection
  reserveButton.addEventListener('click', async () => {
    const labKey = labOrder[currentLab];
    const selectedEmail = studentSelect.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const isAnonymous = anonymousCheckbox.checked;

    // Validate student email
    if (!selectedEmail) {
      alert('Please select a student.');
      return;
    }

    // Validate date and time
    if (!date || !time) {
      alert('Please select date and time.');
      return;
    }

    // Validate seat selection
    if (selectedSeats.size === 0) {
      alert('Please select at least one seat.');
      return;
    }

    // Send reservation request
    const response = await fetch('/reservations/create-reservation-tech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        labName: labKey,
        seatIndices: Array.from(selectedSeats),
        reservationDate: date,
        reservationTime: time,
        studentEmail: selectedEmail,
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
