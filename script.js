// script.js (Final Version - Safe and Inactive)
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('celebration-form');

    // Only run the code if the form actually exists on the page.
    if (form) {
        const submitBtn = document.getElementById('submit-btn');
        const statusMessage = document.getElementById('status-message');
        const portraitInput = document.getElementById('portrait');

        form.addEventListener('submit', async (event) => {
            // ... all of your existing form submission logic ...
            // (The code you provided goes here, inside the if block)
            event.preventDefault(); 
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';
            // etc...
        });
    } else {
        // This will now be the case
        console.log("Submission form not found. Event is likely over.");
    }
});