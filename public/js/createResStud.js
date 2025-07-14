document.addEventListener('DOMContentLoaded', () => {
  const seatLayout = document.getElementById('seat-layout');
  const roomName = document.getElementById('room-name');
  const labImage = document.getElementById('lab-image');
  const anonymousCheckbox = document.getElementById('anonymous-checkbox');
  const reserveButton = document.getElementById('reserve-button');
  const dateInput = document.getElementById('reservationDate');
  const timeInput = document.getElementById('reservationTime');

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
        userDisplay.innerHTML = s.user.anonymous ? 'Anonymous' : `<a href="/profile/${encodeURIComponent(s.user.email)}">${s.user.name}</a>`;        
        div.appendChild(userDisplay);
      } else if (!s.occupied) {
        div.addEventListener('click', () => {
          if (selectedSeats.has(i)) {
            selectedSeats.delete(i);
            div.classList.remove('selected');
            console.log(`Seat ${i + 1} deselected`);
          } else {
            selectedSeats.add(i);
            div.classList.add('selected');
            console.log(`Seat ${i + 1} selected`);
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
    const isAnonymous = anonymousCheckbox.checked;

    if (selectedSeats.size === 0) {
      alert('Please select at least one seat.');
      return;
    }

    const date = dateInput.value;
    const time = timeInput.value;

    console.log(date, time);

    if (!date || !time) {
      alert('Please select date and time.');
      return;
    }

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
