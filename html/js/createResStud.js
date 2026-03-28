import seatData from './seatdata.js';

const seatLayout = document.getElementById('seat-layout');
const roomName = document.getElementById('room-name');
const labImage = document.getElementById('lab-image');
const anonymousCheckbox = document.getElementById('anonymous-checkbox');
const reserveButton = document.getElementById('reserve-button');

const labOrder = ["GK302A", "GK302B", "GK306A", "GK404A", "GK404B"];
const labImages = ["img/gk3.jpg", "img/gk3.jpg", "img/gk3.jpg", "img/gk404.jpeg", "img/gk404.jpeg"];
let currentLab = 0;
let selectedSeats = new Set();

function renderSeats(labIndex) {
    const labKey = labOrder[labIndex];
    const seats = seatData[labKey] || [];

    roomName.textContent = `Room: ${labKey}`;
    labImage.src = labImages[labIndex];
    seatLayout.innerHTML = '';
    selectedSeats.clear();

    seats.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = `seat ${s.occupied ? 'occupied' : 'available'}`;
        div.textContent = `Seat ${i + 1}`;

        if (s.occupied && s.user) {
            const userDisplay = document.createElement('div');
            userDisplay.style.fontSize = '0.75rem';
            userDisplay.innerHTML = s.user.anonymous ? 'Anonymous' : `<a href="profile.html?user=${encodeURIComponent(s.user.name)}">${s.user.name}</a>`;
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

document.querySelectorAll('.account-type-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.account-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentLab = index;
        renderSeats(currentLab);
    });
});


reserveButton.addEventListener('click', () => {
    const labKey = labOrder[currentLab];
    const isAnonymous = anonymousCheckbox.checked;

    selectedSeats.forEach(i => {
        seatData[labKey][i].occupied = true;
        seatData[labKey][i].user = {
          name: isAnonymous ? null : "You",
          anonymous: isAnonymous
        };
    });

    renderSeats(currentLab);
});


renderSeats(currentLab);
