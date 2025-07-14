document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const resultsSection = document.getElementById('search-results');
    const resultsHeader = document.getElementById('results-header');
    const lastUpdatedEl = document.getElementById('last-updated');
    const resultsBody = document.getElementById('results-body');
    let autoRefreshInterval;
    let currentLabId = null;
    let currentDate = null;

    // Set default date to today
    const today = new Date();
    const dateInput = document.getElementById('date-input');
    dateInput.valueAsDate = today;
    currentDate = dateInput.value;

    // Form submission handler
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await performSearch();
    });

    // Lab selection change handler
    document.getElementById('lab-select').addEventListener('change', async function() {
        currentLabId = this.value;
        if (currentLabId && currentDate) {
            await performSearch();
        }
    });

    // Date selection change handler
    dateInput.addEventListener('change', async function() {
        currentDate = this.value;
        if (currentLabId && currentDate) {
            await performSearch();
        }
    });

    // Technician reservation type toggle
    const reservationType = document.getElementById('reservation-type');
    if (reservationType) {
        reservationType.addEventListener('change', function() {
            document.getElementById('student-email-container').style.display = 
                this.value === 'walkin' ? 'block' : 'none';
        });
    }

    // Main search function
    async function performSearch() {
        const submitBtn = searchForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';
        
        try {
            const formData = new FormData(searchForm);
            currentLabId = formData.get('labId');
            currentDate = formData.get('date');
            const selectedTimeSlot = formData.get('timeSlot');
            
            const response = await fetch('/reservations/search-slots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    labId: currentLabId,
                    date: currentDate
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorData}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                showAlert('danger', data.error);
                return;
            }
            
            // Filter results if a specific time slot is selected
            if (selectedTimeSlot) {
                const [startTime, endTime] = selectedTimeSlot.split('-');
                data.seats = data.seats.map(seat => {
                    return {
                        ...seat,
                        timeSlots: seat.timeSlots.filter(slot => 
                            slot.startTime === startTime.trim() && 
                            slot.endTime === endTime.trim()
                        )
                    };
                }).filter(seat => seat.timeSlots.length > 0);
            }
            
            displayResults(data);
            setupAutoRefresh();
        } catch (error) {
            console.error('Search error:', error);
            showAlert('danger', error.message || 'Failed to search slots. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-search me-2"></i>Search Slots';
        }
    }
    
    // Display results in table
    function displayResults(data) {
        resultsHeader.textContent = `${data.labName} - ${formatDisplayDate(data.date)}`;
        lastUpdatedEl.textContent = `Last updated: ${formatTime(data.lastUpdated)}`;
        resultsBody.innerHTML = '';
        
        if (data.seats.length === 0) {
            resultsBody.innerHTML = '<tr><td colspan="5" class="text-center">No slots found</td></tr>';
            resultsSection.style.display = 'block';
            return;
        }
        
    data.seats.forEach(seat => {
        seat.timeSlots.forEach(timeSlot => {
            const row = document.createElement('tr');
            
            // Seat number
            const seatCell = document.createElement('td');
            seatCell.textContent = seat.seatNumber;
            row.appendChild(seatCell);
            
            // Time slot
            const timeCell = document.createElement('td');
            timeCell.textContent = `${timeSlot.startTime} - ${timeSlot.endTime}`;
            row.appendChild(timeCell);
            
            // Status
            const statusCell = document.createElement('td');
            const statusBadge = document.createElement('span');
            statusBadge.className = `badge bg-${getStatusColor(timeSlot.status)}`;
            statusBadge.textContent = timeSlot.status;
            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);
            
            // Reserved by
            const reservedCell = document.createElement('td');
            if (timeSlot.status === 'Reserved' && timeSlot.reservedBy) {
                const userLink = document.createElement('a');
                userLink.href = `/profile/${timeSlot.reservedBy.email}`;
                userLink.innerHTML = `
                    ${timeSlot.reservedBy.name}
                    ${timeSlot.reservedBy.profilePicture ? 
                        `<img src="${timeSlot.reservedBy.profilePicture}" class="rounded-circle ms-2" width="24" height="24" style="border: 1px solid black;">` : ''}
                `;
                reservedCell.appendChild(userLink);
            } else {
                reservedCell.textContent = '-';
            }
            row.appendChild(reservedCell);
                        
            resultsBody.appendChild(row);
        });
    });
    
    resultsSection.style.display = 'block';
    }

    // Setup auto-refresh every 30 seconds
    function setupAutoRefresh() {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
        
        autoRefreshInterval = setInterval(async () => {
            if (currentLabId && currentDate) {
                try {
                    const response = await fetch('/reservations/search-slots', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            labId: currentLabId,
                            date: currentDate
                        })
                    });
                    
                    const data = await response.json();
                    if (!data.error) {
                        displayResults(data);
                    }
                } catch (error) {
                    console.error('Auto-refresh error:', error);
                }
            }
        }, 30000); // 30 seconds
    }

    // Helper functions
    function formatDisplayDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function formatTime(date) {
        return new Date(date).toLocaleTimeString();
    }

    function getStatusColor(status) {
        switch(status) {
            case 'Available': return 'success';
            case 'Reserved': return 'warning';
            case 'Blocked': return 'danger';
            default: return 'secondary';
        }
    }

    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('.search-container');
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // Cleanup on page leave
    window.addEventListener('beforeunload', () => {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
    });
});