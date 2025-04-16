// Global variables
let inviteeData = null;
let weddingDate = new Date('2025-09-15T14:00:00');
let googleMapsAddress = '';
let mapInstance = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Get invitee ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const inviteeId = urlParams.get('id');
    
    // Enable music by default
    initMusic();
    
    // Set invitee ID in forms if it exists
    if (inviteeId) {
        localStorage.setItem('inviteeId', inviteeId); // Save it for future visits
        loadInviteeData(inviteeId);
    } else {
        // Try to get from localStorage if not in URL
        const savedId = localStorage.getItem('inviteeId');
        if (savedId) {
            loadInviteeData(savedId);
        } else {
            console.log('No invitee ID provided - showing generic invitation');
            // Show generic version or prompt for ID
        }
    }
    
    // Initialize countdown
    initCountdown();
});

// Initialize background music
function initMusic() {
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    
    // Start playing music
    bgMusic.volume = 0.5;
    
    // Add click event for music toggle
    musicToggle.addEventListener('click', function() {
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    });
    
    // Auto play music (this might be blocked by browsers)
    bgMusic.play().catch(function(error) {
        console.log('Auto-play was prevented. User needs to interact with the page first.');
        musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    });
}

// Initialize countdown timer
function initCountdown() {
    function updateCountdown() {
        // Wedding date - set to September 15, 2025 at 2:00 PM
        const weddingDate = new Date("September 15, 2025 14:00:00").getTime();
        
        // Current date
        const now = new Date().getTime();
        
        // Calculate time difference
        const timeDifference = weddingDate - now;
        
        // Calculate months, days, hours, minutes, seconds
        const months = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30.44)); // Average days in a month
        const days = Math.floor((timeDifference % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        
        // Update countdown elements
        document.getElementById("months").textContent = months.toString().padStart(2, '0');
        document.getElementById("days").textContent = days.toString().padStart(2, '0');
        document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
        document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").textContent = seconds.toString().padStart(2, '0');
        
        // Hide months container when there are less than 1 month left
        const monthsContainer = document.getElementById("months-container");
        if (months < 1) {
            monthsContainer.style.display = "none";
        } else {
            monthsContainer.style.display = "flex";
        }
        
        // If countdown is over, display a message
        if (timeDifference < 0) {
            document.getElementById("months").textContent = "00";
            document.getElementById("days").textContent = "00";
            document.getElementById("hours").textContent = "00";
            document.getElementById("minutes").textContent = "00";
            document.getElementById("seconds").textContent = "00";
            
            // You might want to add a message like "Wedding Day is here!"
            document.querySelector('.countdown-container h2').textContent = "¡El gran día ha llegado!";
        }
    }
    
    // Update the countdown every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Load invitee data from API
function loadInviteeData(inviteeId) {
    // Set invitee ID in forms
    document.getElementById('ceremonyInviteeId').value = inviteeId;
    document.getElementById('celebrationInviteeId').value = inviteeId;
    document.getElementById('musicInviteeId').value = inviteeId;
    
    // Fetch invitee data from API
    getInviteeData(inviteeId)
        .then(data => {
            inviteeData = data;
            
            // Update UI with invitee data
            updateInviteeUI(data);
        })
        .catch(error => {
            console.error('Error loading invitee data:', error);
        });
}

// Update UI with invitee data
function updateInviteeUI(data) {
    // Update guest counts
    document.getElementById('ceremonyGuestCount').textContent = data.maxGuests;
    document.getElementById('celebrationGuestCount').textContent = data.maxGuests;
    
    // Populate attending count dropdowns
    const ceremonySelect = document.getElementById('ceremonyAttendingCount');
    const celebrationSelect = document.getElementById('celebrationAttendingCount');
    
    // Clear previous options
    ceremonySelect.innerHTML = '';
    celebrationSelect.innerHTML = '';
    
    // Add options based on max guests
    for (let i = 1; i <= data.maxGuests; i++) {
        const ceremonyOption = document.createElement('option');
        ceremonyOption.value = i;
        ceremonyOption.textContent = i;
        ceremonySelect.appendChild(ceremonyOption);
        
        const celebrationOption = document.createElement('option');
        celebrationOption.value = i;
        celebrationOption.textContent = i;
        celebrationSelect.appendChild(celebrationOption);
    }
    
    // Set default values
    ceremonySelect.value = data.maxGuests;
    celebrationSelect.value = data.maxGuests;
}

// Open modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Confirm attendance
function confirmAttendance(eventType, isAttending) {
    const guestDetailsId = `${eventType}GuestDetails`;
    
    if (isAttending) {
        document.getElementById(guestDetailsId).style.display = 'block';
    } else {
        document.getElementById(guestDetailsId).style.display = 'none';
        document.getElementById(`${eventType}AttendingCount`).value = '0';
    }
}

// Submit confirmation
function submitConfirmation(eventType) {
    const form = document.getElementById(`${eventType}ConfirmForm`);
    const formData = new FormData(form);
    const data = {
        inviteeId: formData.get('inviteeId'),
        eventType: formData.get('eventType'),
        attending: document.getElementById(`${eventType}GuestDetails`).style.display !== 'none',
        attendingCount: parseInt(formData.get('attendingCount') || 0),
        comment: formData.get('comment')
    };
    
    // Submit data to API
    submitConfirmationData(data)
        .then(response => {
            alert('¡Gracias por confirmar tu asistencia!');
            closeModal(`${eventType}Confirm`);
        })
        .catch(error => {
            console.error('Error submitting confirmation:', error);
            alert('Hubo un problema al confirmar tu asistencia. Por favor, intenta de nuevo.');
        });
}

// Submit music suggestion
function submitMusicSuggestion() {
    const form = document.getElementById('musicSuggestionForm');
    const formData = new FormData(form);
    const data = {
        inviteeId: formData.get('inviteeId'),
        songTitle: formData.get('songTitle'),
        artist: formData.get('artist'),
        comment: formData.get('comment')
    };
    
    // Submit data to API
    submitMusicSuggestionData(data)
        .then(response => {
            alert('¡Gracias por tu sugerencia musical!');
            closeModal('musicSuggestion');
            form.reset();
        })
        .catch(error => {
            console.error('Error submitting music suggestion:', error);
            alert('Hubo un problema al enviar tu sugerencia. Por favor, intenta de nuevo.');
        });
}

// Open directions in Google Maps or Waze
function openDirections(address, app) {
    const encodedAddress = encodeURIComponent(address);
    
    if (app === 'google') {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    } else if (app === 'waze') {
        window.open(`https://waze.com/ul?q=${encodedAddress}`, '_blank');
    }
}

// Add to calendar
function addToCalendar(eventType) {
    let eventTitle, eventStart, eventEnd, eventLocation, eventDescription;
    
    if (eventType === 'ceremony') {
        eventTitle = 'Ceremonia de Boda - Danny y Sofía';
        eventStart = new Date('2025-09-15T14:00:00');
        eventEnd = new Date('2025-09-15T15:30:00');
        eventLocation = 'Parroquia Nuestra Señora de Lujan, Av. Pergamino 203, San José';
        eventDescription = 'Ceremonia de Matrimonio de Danny y Sofía';
    } else {
        eventTitle = 'Celebración de Boda - Danny y Sofía';
        eventStart = new Date('2025-09-15T15:30:00');
        eventEnd = new Date('2025-09-15T21:00:00');
        eventLocation = 'Salon de fiestas Avril, Av. Los Reartes 12, San José';
        eventDescription = 'Celebración de Matrimonio de Danny y Sofía';
    }
    
    // Format dates for calendar
    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startTime = formatDate(eventStart);
    const endTime = formatDate(eventEnd);
    
    // Generate calendar links
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}&sf=true&output=xml`;
    
    // Open Google Calendar in new tab
    window.open(googleCalendarUrl, '_blank');
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
}); 