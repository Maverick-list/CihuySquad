const http = require('http');

// Test emergency endpoint
const testEmergency = () => {
    const data = JSON.stringify({
        lat: -6.2088,
        lng: 106.8456,
        emergencyType: 'test',
        description: 'Test emergency call'
    });

    const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/health/emergency',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);

        res.on('data', (chunk) => {
            console.log(`Response: ${chunk}`);
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(data);
    req.end();
};

// Wait a bit then test
setTimeout(testEmergency, 2000);