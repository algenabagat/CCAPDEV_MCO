$(document).ready(function() {
    $('#search-form').submit(function(e) {
        e.preventDefault();
        
        // Get search parameters
        const date = $('#search-date').val();
        const time = $('#search-time').val();
        const lab = $('#search-lab').val();
        
        if (!date || !time || !lab) {
            alert('Please fill all search fields');
            return;
        }
        
        // Simulate search results (in a real app, this would be an API call)
        const results = generateMockResults(date, time, lab);
        displayResults(results);
        
        $('#search-results').show();
    });
    
    function generateMockResults(date, time, lab) {
        // This is just mock data - in a real app you would query your database
        const slots = [];
        const baseTime = new Date(`${date}T${time}`);
        
        for (let i = 0; i < 6; i++) {
            const slotTime = new Date(baseTime);
            slotTime.setHours(baseTime.getHours() + i);
            
            slots.push({
                start: slotTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                end: new Date(slotTime.getTime() + 60*60*1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                lab: $('#search-lab option:selected').text(),
                available: Math.random() > 0.3 // 70% chance of being available
            });
        }
        
        return slots;
    }
    
    function displayResults(results) {
        const $tbody = $('#results-body');
        $tbody.empty();
        
        results.forEach(slot => {
            const row = `
                <tr>
                    <td>${slot.start} - ${slot.end}</td>
                    <td>${slot.lab}</td>
                    <td>${slot.available ? 
                        '<span class="text-success">Available</span>' : 
                        '<span class="text-danger">Booked</span>'}</td>
                    <td>
                        ${slot.available ? 
                        '<a href="#" class="btn-reserve">Reserve</a>' : 
                        '<span class="text-muted">Unavailable</span>'}
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });
    }
});