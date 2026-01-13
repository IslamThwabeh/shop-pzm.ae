// Hardcoded fallback hours
const FALLBACK_WEEKDAY_TEXT = [
  "Monday: 8 AM – 12 AM",
  "Tuesday: 8 AM – 12 AM",
  "Wednesday: 8 AM – 12 AM",
  "Thursday: 8 AM – 12 AM",
  "Friday: 9:30 AM – 12 AM",
  "Saturday: 7 AM – 1 AM",
  "Sunday: 7 AM – 1 AM"
];

async function fetchBusinessHours() {
  try {
    const response = await fetch(PROXY_URL);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    const openingHours = data?.result?.opening_hours;
    if (!openingHours) throw new Error('No opening_hours');
    return {
      periods: openingHours.periods,
      weekdayText: openingHours.weekday_text,
      openNow: openingHours.open_now
    };
  } catch (error) {
    console.error('Error fetching business hours:', error);
    return null;
  }
}

async function updateStoreStatus() {
  const statusElement = document.getElementById('store-status');
  const hoursElement = document.querySelector('.hours');

  if (!statusElement || !hoursElement) return;

  const hoursData = await fetchBusinessHours();

  if (!hoursData) {
    // Fallback: unknown open/closed status, show fallback hours
    statusElement.innerHTML = '<span class="closed-status">Business Hours</span>';
    displayHours(FALLBACK_WEEKDAY_TEXT);
    return;
  }

  // Set status (open/closed)
  statusElement.innerHTML = hoursData.openNow
    ? '<span class="open-status">Open</span>'
    : '<span class="closed-status">Closed</span>';

  // Show the Google-formatted business hours
  displayHours(hoursData.weekdayText);
}

function displayHours(weekdayText) {
  const hoursElement = document.querySelector('.hours');
  if (!weekdayText || !Array.isArray(weekdayText)) {
    hoursElement.textContent = "Business hours unavailable.";
    return;
  }
  // Join using line breaks for readability
  hoursElement.textContent = weekdayText.join('\n');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  updateStoreStatus();
  // Update status every minute
  setInterval(updateStoreStatus, 60000);
});
