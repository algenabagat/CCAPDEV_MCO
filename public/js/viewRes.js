const seatLayout = document.getElementById('seat-layout');
const roomName = document.getElementById('room-name');
const carousel = document.getElementById('carouselExampleCaptions');

const dateInput = document.getElementById('reservationDate');
const timeInput = document.getElementById('reservationTime');

// Initialize seat data and current lab
const labOrder = Object.keys(seatData);
let currentLab = 0;

// Function to render seats based on the current lab
function renderSeats(labIndex, overrideSeats = null) {
  const labKey = labOrder[labIndex];
  const seats = overrideSeats || seatData[labKey] || [];

  // Update room name and clear previous seats
  roomName.textContent = `Room: ${labKey}`;
  seatLayout.innerHTML = seats.map((s, i) => {
    const seatNumber = i + 1;
    // Create seat element
    let html = `<div class="seat ${s.occupied ? 'occupied' : 'available'}">Seat ${seatNumber}`;
    if (s.occupied && s.user) {
      if (s.user.anonymous) {
        // Display anonymous user
        html += `<br><span style="font-size: 0.75rem;">Anonymous</span>`;
      } else {
        // Display user and redirect to profile
        html += `<br><a href="/profile/${encodeURIComponent(s.user.email)}">${s.user.name}</a>`;      }
    }
    html += `</div>`;
    return html;
  }).join('');
}

// Function to update seat availability based on selected date and time
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('reservationDate');
  const timeInput = document.getElementById('reservationTime');

  // Attach listeners after inputs exist
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

    // Check if response is successful
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


