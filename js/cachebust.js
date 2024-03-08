// Manually specify the version number
var version = '0.1';

// Get current script element
var currentScript = document.currentScript;

// Create new script element
var newScript = document.createElement('script');
newScript.src = 'timer.js?v=' + version;

// Replace current script element with new one
currentScript.parentNode.replaceChild(newScript, currentScript);