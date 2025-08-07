// netlify/functions/generate-card.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const busboy = require('busboy');
const crypto = require('crypto');

// --- Initialize S3 Client to connect to Cloudflare R2 ---
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Helper function to parse the multipart/form-data from the browser
const parseMultipartForm = (event) => {
  return new Promise((resolve) => {
    const fields = {};
    const bb = busboy({ headers: event.headers });

    bb.on('file', (name, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => {
        fields[name] = {
          filename,
          mimeType,
          content: Buffer.concat(chunks),
        };
      });
    });

    bb.on('field', (name, value) => {
      fields[name] = value;
    });

    bb.on('close', () => {
      resolve(fields);
    });

    bb.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    bb.end();
  });
};

// --- Main Handler ---
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 1. Parse the incoming form data
    const fields = await parseMultipartForm(event);
    const email = fields.email;
    const portraitFile = fields.portrait;
    const proceedGeneric = fields.proceedGeneric === 'true';

    // 2. Create a unique, URL-safe key for this submission
    // This prevents file overwrites and links the metadata to the image.
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString('hex');
    const sanitizedEmail = email.replace(/[^a-z0-9.-_@]/gi, '_').toLowerCase();
    const objectKey = `${sanitizedEmail}-${timestamp}-${randomString}`;

    console.log(`Received submission. Storing under key: ${objectKey}`);

    // 3. Prepare the files to be uploaded to R2
    // The portrait image itself
    const imageUploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${objectKey}.png`,
      Body: portraitFile.content,
      ContentType: portraitFile.mimeType,
    });

    // A small JSON file with the submission's metadata
    const metadataUploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${objectKey}.json`,
      Body: JSON.stringify({
        email: email,
        isGeneric: proceedGeneric,
        submittedAt: new Date().toISOString(),
        originalFilename: portraitFile.filename,
      }),
      ContentType: 'application/json',
    });

    // 4. Execute both uploads in parallel
    await Promise.all([
      s3Client.send(imageUploadCommand),
      s3Client.send(metadataUploadCommand),
    ]);

    // 5. Return a success message to the frontend
    // This is the same response the user's old function sent for email-not-found,
    // we adapt it for our purpose.
    if (!proceedGeneric) {
      const isKnownUser = true; // In the new architecture, we don't check this here.
                                // We just check if the user *wants* a generic card or not.
                                // For now, we will assume we need to check the DB.
      // Your logic here to check against a DB if needed, or simply trust the client.
      // Let's simplify and just use the `proceedGeneric` flag.
    }
    
    // The message flow in your original script.js is a bit complex.
    // Let's simplify the return and let the script.js handle the UI update.
    // We will just return a generic success message now.
    
    let userMessage = 'Your submission was received! We will process it soon.';
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success',
        message: userMessage,
      }),
    };

  } catch (error) {
    console.error('Error in generate-card function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: 'An internal error occurred.' }),
    };
  }
};