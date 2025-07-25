import qrcode from 'qrcode-terminal';
import { networkInterfaces } from 'os';

// Get local IP address
function getLocalIpAddress() {
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  
  // Return the first non-internal IPv4 address
  for (const name of Object.keys(results)) {
    if (results[name][0]) {
      return results[name][0];
    }
  }
  
  return 'localhost';
}

const ip = getLocalIpAddress();
const port = 5173; // Default Vite port
const url = `http://${ip}:${port}`;

console.log('Scan this QR code with your phone to open the app:');
qrcode.generate(url, { small: true });
console.log(`Or open this URL in your mobile browser: ${url}`);
