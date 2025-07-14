// Remove all sessionStorage/sample data logic

// Render reservations table using backend data
function renderTable() {
  // 'reservations' is provided by Handlebars context
  const tbody = document.querySelector("#reservationsTable tbody");
  const noReservationsMsg = document.getElementById("noReservations");

  tbody.innerHTML = "";

  if (!reservations || reservations.length === 0) {
    noReservationsMsg.style.display = "block";
    return;
  }

  noReservationsMsg.style.display = "none";

  reservations.forEach((res, i) => {
    const statusClass = res.status === "Reserved" ? "status-confirmed" : (res.status === "Cancelled" ? "status-pending" : "");
    tbody.innerHTML += `
      <tr>
        <td>${res.lab}</td>
        <td>${res.reservationDate}</td>
        <td>${res.startTime} - ${res.endTime}</td>
        <td>${res.seat}</td>
        <td><span class="status-pill ${statusClass}">${res.status}</span></td>
        <td>
          <button class="action-btn edit-btn" onclick="editReservation(${i})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteReservation(${i})">Delete</button>
        </td>
      </tr>
    `;
  });
}

// Edit reservation
let currentEditIndex = null;

function editReservation(index) {
  const res = reservations[index];
  currentEditIndex = index;
  document.getElementById("editLab").value = res.lab;
  document.getElementById("editSeat").value = res.seat;
  document.getElementById("editDate").value = res.reservationDate;
  document.getElementById("editStart").value = res.startTime;
  document.getElementById("editEnd").value = res.endTime;
  document.getElementById("editStatus").value = res.status;
  document.getElementById("editModal").style.display = "block";
}

// Save edited reservation (placeholder, needs backend integration)
function saveEdit() {
  // Implement AJAX call to update reservation in backend
  closeModal();
  renderTable();
}

// Delete reservation (placeholder, needs backend integration)
function deleteReservation(index) {
  // Implement AJAX call to delete reservation in backend
  renderTable();
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
  currentEditIndex = null;
}

window.deleteReservation = function(index) {
  if (confirm('Are you sure you want to delete this reservation?')) {
    // Implement AJAX or redirect to a delete endpoint as needed
    window.location.href = `/reservations/delete/${index}`;
  }
};

document.addEventListener('DOMContentLoaded', function() {
  renderTable();
}); 