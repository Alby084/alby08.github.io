document.addEventListener('DOMContentLoaded', function () {
    const countdownDate = new Date("Dec 31, 2023 23:59:59").getTime();

    // Check if countdown date is in future
    if (countdownDate > new Date().getTime()) {
        const countdownInterval = setInterval(function() {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById("countdown").innerHTML = formatTime(days) + "d " + formatTime(hours) + "h "
                + formatTime(minutes) + "m " + formatTime(seconds) + "s ";

            if (distance < 0) {
                clearInterval(countdownInterval);
                document.getElementById("countdown").innerHTML = "EXPIRED";
            }
        }, 1000);
    } else {
        document.getElementById("countdown").innerHTML = "EXPIRED";
    }

    // Helper function to format time values with leading zeros
    function formatTime(time) {
        return time < 10 ? "0" + time : time;
    }
});
