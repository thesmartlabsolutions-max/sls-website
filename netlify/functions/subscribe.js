const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid body' }) };
  }

  if (!email || !email.includes('@')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email invalide' }) };
  }

  const payload = JSON.stringify({ email, listIds: [5], updateEnabled: true });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: '/v3/contacts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 201 || res.statusCode === 204) {
            resolve({ statusCode: 200, body: JSON.stringify({ success: true }) });
          } else {
            resolve({ statusCode: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', (err) => {
      resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
    });
    req.write(payload);
    req.end();
  });
};
