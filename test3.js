const fs = require('fs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign({ userId: new mongoose.Types.ObjectId().toString(), role: 'candidate', email: 'test@test.com', name: 'Test' }, 'default_jwt_secret', { expiresIn: '1h' });
  
  // Use node fetch
  const FormData = require('form-data');
  const form = new FormData();
  fs.writeFileSync('test.pdf', 'fake pdf content');
  form.append('file', fs.createReadStream('test.pdf'));

  try {
    const res = await fetch('http://localhost:5000/api/v1/chat/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch (err) {
    console.log(err);
  }
}
test();
