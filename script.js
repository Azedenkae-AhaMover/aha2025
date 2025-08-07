// script.js (New Simplified Version)
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('celebration-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusMessage = document.getElementById('status-message');
    const portraitInput = document.getElementById('portrait');

    form.addEventListener('submit', async (event) => {
        // Stop the form from submitting the traditional way
        event.preventDefault(); 
        
        // --- UI Updates: Show the user we're working ---
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        statusMessage.textContent = 'Please wait, your submission is being uploaded.';
        statusMessage.style.color = '#333'; // Reset to default color

        // --- Data Validation ---
        if (!portraitInput.files || portraitInput.files.length === 0) {
            statusMessage.textContent = 'Please select a portrait image file to upload.';
            statusMessage.style.color = 'red';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate My Card';
            return;
        }

        // --- Prepare and Send Data ---
        try {
            // FormData will correctly package the form fields and the file
            const formData = new FormData(form);

            const response = await fetch('/.netlify/functions/generate-card', {
                method: 'POST',
                body: formData, // No need to set headers, FormData does it automatically
            });

            // Check if the network request itself was successful
            if (!response.ok) {
                // This catches server errors (like 500)
                throw new Error(`Server responded with an error: ${response.statusText}`);
            }

            const result = await response.json();

            // Check the logical result from our function's JSON response
            if (result.status === 'success') {
                statusMessage.textContent = 'Success! Your submission was received. We will process it and send the card to your email soon.';
                statusMessage.style.color = 'green';
                form.reset(); // Clear the form for the next user
            } else {
                // This catches logical errors we might have defined in the function
                throw new Error(result.message || 'An unknown error occurred on the server.');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            statusMessage.textContent = `Oops! Something went wrong. Error: ${error.message}`;
            statusMessage.style.color = 'red';
        
        } finally {
            // --- UI Cleanup: Re-enable the button after success or failure ---
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate My Card';
        }
    });
});