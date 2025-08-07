document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('celebration-form');
    const emailInput = document.getElementById('email');
    const portraitInput = document.getElementById('portrait');
    const submitBtn = document.getElementById('submit-btn');
    const statusMessage = document.getElementById('status-message');

    let wantsGenericCard = false;

    // <<< THE FIX IS HERE >>>
    // Add an event listener to the email input field.
    emailInput.addEventListener('input', () => {
        // If the user starts typing a new email, reset the "generic card" state.
        if (wantsGenericCard) {
            console.log('User is correcting email. Resetting state.');
            wantsGenericCard = false;
            submitBtn.textContent = 'Generate My Card';
            statusMessage.textContent = ''; // Clear the warning message
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating...';
        statusMessage.textContent = 'Please wait, the magic is happening!';
        statusMessage.style.color = '#333';

        const email = emailInput.value;
        const portraitFile = portraitInput.files[0];

        if (!portraitFile) {
            statusMessage.textContent = 'Please select an image file to upload.';
            statusMessage.style.color = 'red';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate My Card';
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('portrait', portraitFile);
        
        if (wantsGenericCard) {
            formData.append('proceedGeneric', 'true');
        }

        try {
            const response = await fetch('/.netlify/functions/generate-card', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.status === 'success') {
                statusMessage.textContent = result.message;
                statusMessage.style.color = 'green';
                form.reset();
                wantsGenericCard = false; 
            } else if (result.status === 'email_not_found') {
                statusMessage.textContent = result.message;
                statusMessage.style.color = '#FF6600';
                submitBtn.textContent = 'Yes, Continue with this Email';
                wantsGenericCard = true;
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            statusMessage.textContent = 'Oops! Something went wrong. Please try again.';
            wantsGenericCard = false;
        } finally {
            if (!wantsGenericCard) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Generate My Card';
            } else {
                submitBtn.disabled = false;
            }
        }
    });
});