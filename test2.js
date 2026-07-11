const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign({ userId: new mongoose.Types.ObjectId().toString(), role: 'candidate', email: 'test@test.com', name: 'Test' }, 'default_jwt_secret', { expiresIn: '1h' });
  const form = new FormData();
  fs.writeFileSync('test.pdf', 'fake pdf content');
  form.append('file', fs.createReadStream('test.pdf'));

  try {
    const res = await axios.post('http://localhost:5000/api/v1/chat/upload', form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
    });
    console.log(res.status, res.data);
  } catch (err) {
    console.log(err.response?.status, err.response?.data);
  }
}
test();
