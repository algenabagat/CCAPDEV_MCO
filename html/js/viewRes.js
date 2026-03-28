    import seatData from './seatdata.js';

    const seatLayout = document.getElementById('seat-layout');
    const roomName = document.getElementById('room-name');
    const carousel = document.getElementById('carouselExampleCaptions');

    const labOrder = ["GK302A", "GK302B", "GK306A", "GK404A", "GK404B"];
    let currentLab = 0;

    function renderSeats(labIndex) {
      const labKey = labOrder[labIndex];
      const seats = seatData[labKey] || [];

      roomName.textContent = `Room: ${labKey}`;
      seatLayout.innerHTML = seats.map((s, i) => {
        const seatNumber = i + 1;
        let html = `<div class="seat ${s.occupied ? 'occupied' : 'available'}">Seat ${seatNumber}`;
        if (s.occupied && s.user) {
          if (s.user.anonymous) {
            html += `<br><span style="font-size: 0.75rem;">Anonymous</span>`;
          } else {
            html += `<br><a href="profile.html?user=${encodeURIComponent(s.user.name)}">${s.user.name}</a>`;
          }
        }
        html += `</div>`;
        return html;
      }).join('');
    }

    carousel.addEventListener('slid.bs.carousel', function (e) {
      currentLab = e.to;
      renderSeats(currentLab);
    });

    renderSeats(currentLab);