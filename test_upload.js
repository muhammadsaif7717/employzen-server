const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function test() {
  const form = new FormData();
  // Create a dummy file
  fs.writeFileSync('dummy.txt', 'Hello world');
  form.append('file', fs.createReadStream('dummy.txt'));

  try {
    // Need a valid token though to bypass auth(). 
    // Maybe we can check the server logs directly if we can grep them.
  } catch(e) {
    console.log(e);
  }
}
test();
