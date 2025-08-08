// netlify/functions/generate-card.js (Final "Disabled" Version)

exports.handler = async (event) => {
  // Immediately return an error message stating the event is over.
  // We use status code 410 "Gone", which is semantically correct for a resource
  // that is intentionally no longer available.
  
  return {
    statusCode: 410, 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'error',
      message: 'This event has ended and submissions are no longer accepted. We welcomed your participation. Thank you very much!',
    }),
  };
};