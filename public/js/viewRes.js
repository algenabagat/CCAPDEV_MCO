const seatLayout = document.getElementById('seat-layout');
const roomName = document.getElementById('room-name');
const carousel = document.getElementById('carouselExampleCaptions');

const dateInput = document.getElementById('reservationDate');
  const timeInput = document.getElementById('reservationTime');


const labOrder = Object.keys(seatData);
let currentLab = 0;

function renderSeats(labIndex, overrideSeats = null) {
  const labKey = labOrder[labIndex];
  const seats = overrideSeats || seatData[labKey] || [];

  roomName.textContent = `Room: ${labKey}`;
  seatLayout.innerHTML = seats.map((s, i) => {
    const seatNumber = i + 1;
    let html = `<div class="seat ${s.occupied ? 'occupied' : 'available'}">Seat ${seatNumber}`;
    if (s.occupied && s.user) {
      if (s.user.anonymous) {
        html += `<br><span style="font-size: 0.75rem;">Anonymous</span>`;
      } else {
        html += `<br><a href="/profile/${encodeURIComponent(s.user.email)}">${s.user.name}</a>`;      }
    }
    html += `</div>`;
    return html;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('reservationDate');
  const timeInput = document.getElementById('reservationTime');

  // Move updateSeatAvailability INSIDE this scope if it uses dateInput
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

  // Attach listeners after inputs exist
  if (dateInput && timeInput) {
    dateInput.addEventListener('change', updateSeatAvailability);
    timeInput.addEventListener('change', updateSeatAvailability);
  }

    carousel.addEventListener('slid.bs.carousel', function (e) {
    currentLab = e.to;
    updateSeatAvailability();
  });

  renderSeats(currentLab);
});


