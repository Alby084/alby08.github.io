// Set the target date and time for the countdown
const countdownDate = new Date("Apr 16, 2024 00:00:00").getTime();

// Get the countdown element from the HTML
const countdownElement = document.getElementById("countdown");

// Update the countdown every second
const countdownTimer = setInterval(function() {
    // Get the current date and time
    const now = new Date().getTime();

    // Calculate the remaining time
    const remainingTime = countdownDate - now;

    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    // Display the countdown timer in the HTML element
    countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // Check if the countdown is finished
    if (remainingTime < 0) {
        clearInterval(countdownTimer);
        countdownElement.innerHTML = "Countdown finished!";
    }
}, 1000);