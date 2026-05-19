// Video background
const vid = document.getElementById("video-background");
if (vid) {
    vid.disablePictureInPicture = true;
}

// Typing effect
const textElement = document.getElementById('typewriter-text');
const textToType = 'Alby08';
let i = 0;

function typeWriter() {
    if (i < textToType.length) {
        textElement.innerHTML += textToType.charAt(i);
        i++;
        // Randomize speed
        setTimeout(typeWriter, Math.floor(Math.random() * 100) + 100);
    }
}

// Start on load
window.onload = typeWriter;