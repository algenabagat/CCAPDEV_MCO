document.addEventListener('DOMContentLoaded', () => {
  const seatLayout = document.getElementById('seat-layout');
  const roomName = document.getElementById('room-name');
  const labImage = document.getElementById('lab-image');
  const reserveButton = document.getElementById('reserve-button');
  const studentSelect = document.getElementById('student-select');
  const dateInput = document.getElementById('reservationDate');
  const timeInput = document.getElementById('reservationTime');
  const anonymousCheckbox = document.getElementById('anonymous-checkbox');

  const labOrder = Object.keys(seatData);
  let currentLab = 0;
  let selectedSeats = new Set();

  function renderSeats(labIndex, overrideSeats = null) {
    const labKey = labOrder[labIndex];
    const seats = overrideSeats || seatData[labKey] || [];

    roomName.textContent = `Room: ${labKey}`;
    seatLayout.innerHTML = '';
    selectedSeats.clear();

    seats.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = `seat ${s.occupied ? 'occupied' : 'available'}`;
      div.textContent = `Seat ${i + 1}`;

      if (s.occupied && s.user) {
        const userDisplay = document.createElement('div');
        userDisplay.style.fontSize = '0.75rem';
        userDisplay.innerHTML = s.user.anonymous
          ? 'Anonymous'
          : `<a href="/profile/${encodeURIComponent(s.user.email)}">${s.user.name}</a>`;
        div.appendChild(userDisplay);
      } else if (!s.occupied) {
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

  async function updateSeatAvailability() {
    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;
    const labKey = labOrder[currentLab];

    if (!selectedDate || !selectedTime) return;

    const response = await fetch('/reservations/check-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        labName: labKey,
        date: selectedDate,
        time: selectedTime
      })
    });

    const data = await response.json();
    if (data.success) {
      seatData[labKey] = data.seatData;
      renderSeats(currentLab);
    } else {
      console.error(data.message);
    }
  }

  dateInput.addEventListener('change', updateSeatAvailability);
  timeInput.addEventListener('change', updateSeatAvailability);

  document.querySelectorAll('.account-type-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.account-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLab = index;
      updateSeatAvailability();
    });
  });

  reserveButton.addEventListener('click', async () => {
    const labKey = labOrder[currentLab];
    const selectedEmail = studentSelect.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const isAnonymous = anonymousCheckbox.checked;

    if (!selectedEmail) {
      alert('Please select a student.');
      return;
    }

    if (!date || !time) {
      alert('Please select date and time.');
      return;
    }

    if (selectedSeats.size === 0) {
      alert('Please select at least one seat.');
      return;
    }

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
