const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(bodyParser.json());

// --- CORRECTED CONFIGURATION ---
const dbConfig = {
  user: 'Tester',
  password: 'Asdfg@2026hjkl',
  server: '95.217.184.123',
  port: 1436,
  database: 'SCHOOL_PROJECT_TESTING',
  options: {
    encrypt: false, // <--- CHANGED: Must be true to match VS Code
    trustServerCertificate: true, // <--- CHANGED: Required for IP address connections
    enableArithAbort: true,
    connectTimeout: 30000, // Increased to 30 seconds
  },
};

// Test Connection Function
async function connectDB() {
  try {
    console.log('⏳ Attempting to connect to database...');
    await sql.connect(dbConfig);
    console.log('✅ Database Connected Successfully!');
  } catch (err) {
    console.error('❌ Database Connection Failed:', err.message);
  }
}

// Connect immediately when server starts
connectDB();

// API Endpoint
app.post('/signup', async (req, res) => {
  console.log('📩 Data received for:', req.body.userName);

  try {
    const {
      name,
      userName,
      password,
      confirmPassword,
      email,
      fatherName,
      dob,
      gender,
      contact,
      aadhaar,
      studentClass,
      stream,
      board,
      schoolName,
      address,
      schoolAddress,
    } = req.body;

    if (!name || !userName || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing mandatory fields' });
    }

    let pool = await sql.connect(dbConfig);

    await pool
      .request()
      .input('Name', sql.NVarChar, name)
      .input('FatherName', sql.NVarChar, fatherName)
      .input('UserName', sql.NVarChar, userName)
      .input('Password', sql.NVarChar, password)
      .input('ConfirmPassword', sql.NVarChar, confirmPassword)
      .input('Email', sql.NVarChar, email)
      .input('Aadhaar', sql.NVarChar, aadhaar)
      .input('Gender', sql.NVarChar, gender)
      .input('DateOfBirth', sql.NVarChar, dob)
      .input('Address', sql.NVarChar, address)
      .input('Class_Id', sql.NVarChar, studentClass)
      .input('Board', sql.NVarChar, board)
      .input('School', sql.NVarChar, schoolName)
      .input('SchoolAddress', sql.NVarChar, schoolAddress)
      .input('Contact', sql.NVarChar, contact)
      .input('OtherStream', sql.NVarChar, stream).query(`
                INSERT INTO dbo.signup 
                (name, fatherName, UserName, password, confirmPassword, email, aadhaar, gender, dateOfBirth, address, Class_Id, board, school, schoolAddress, contact, otherStream, created_at, updated_at)
                VALUES 
                (@Name, @FatherName, @UserName, @Password, @ConfirmPassword, @Email, @Aadhaar, @Gender, @DateOfBirth, @Address, @Class_Id, @Board, @School, @SchoolAddress, @Contact, @OtherStream, GETDATE(), GETDATE())
            `);

    console.log('✅ Inserted:', userName);
    res.json({ success: true, message: 'Student registered successfully!' });
  } catch (err) {
    console.error('❌ SQL Error:', err.message);
    res
      .status(500)
      .json({ success: false, message: 'Database Error', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
