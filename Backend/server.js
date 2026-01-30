const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(bodyParser.json());

// --- DATABASE CONFIGURATION ---
const dbConfig = {
  user: 'Tester',
  password: 'Asdfg@2026hjkl',
  server: '95.217.184.123',
  port: 1436,
  database: 'SCHOOL_PROJECT_TESTING',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
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

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// SIGNUP API
app.post('/signup', async (req, res) => {
  console.log('📩 Signup Data received for:', req.body.userName);

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
    console.error('❌ SQL Error (Signup):', err.message);
    res
      .status(500)
      .json({ success: false, message: 'Database Error', error: err.message });
  }
});

// LOGIN API
app.post('/login', async (req, res) => {
  console.log('🔑 Login Attempt for:', req.body.userName);

  const { userName, password } = req.body;

  if (!userName || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Username and Password required' });
  }

  try {
    let pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input('UserName', sql.NVarChar, userName)
      .input('Password', sql.NVarChar, password).query(`
        SELECT id, name, UserName, Class_Id, school 
        FROM dbo.signup 
        WHERE UserName = @UserName AND password = @Password
      `);

    if (result.recordset.length > 0) {
      const student = result.recordset[0];
      console.log('✅ Login Success:', student.name);
      res.json({
        success: true,
        message: 'Login Successful',
        student: student,
      });
    } else {
      console.log('❌ Login Failed: Invalid Credentials');
      res
        .status(401)
        .json({ success: false, message: 'Invalid Username or Password' });
    }
  } catch (err) {
    console.error('❌ SQL Error (Login):', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ==========================================
// 2. EXAM ROUTES
// ==========================================

// FETCH QUESTIONS API
app.post('/api/questions', async (req, res) => {
  // Frontend sends: { subject: 2, count: 10, classId: '12' }
  const { subject, count, classId } = req.body;

  console.log(`📚 Fetching questions for Subject ID: ${subject}`);

  try {
    let pool = await sql.connect(dbConfig);

    // Fetch random questions, HIDING correctanswer
    const result = await pool.request().input('SubjectId', sql.Int, subject)
      .query(`
        SELECT TOP ${count || 10} 
            id, 
            question AS question_text, 
            option1 AS option_a, 
            option2 AS option_b, 
            option3 AS option_c, 
            option4 AS option_d
        FROM [dbo].[objectiveques]
        WHERE subjectName_Id = @SubjectId 
        AND isActive = 1
        ORDER BY NEWID()
      `);

    console.log(`✅ Found ${result.recordset.length} questions`);
    res.json({ success: true, questions: result.recordset });
  } catch (err) {
    console.error('❌ SQL Error (Fetch Questions):', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// SUBMIT EXAM API (Saves to [student_score_result])
app.post('/api/submit-exam', async (req, res) => {
  // 1. Receive data from App
  const { answers, studentId, subjectId, classId, timeTaken } = req.body;

  console.log('📝 Submitting Exam for Student ID:', studentId);

  try {
    let pool = await sql.connect(dbConfig);
    let score = 0;

    // Calculate total attempted questions based on answers received
    // (If you want total *available* questions, pass 'count' from frontend)
    let totalQuestions = Object.keys(answers).length;

    // 2. Calculate Score
    for (const [questionId, userOption] of Object.entries(answers)) {
      const result = await pool
        .request()
        .input('QID', sql.Int, questionId)
        .query(
          'SELECT correctanswer FROM [dbo].[objectiveques] WHERE id = @QID',
        );

      if (result.recordset.length > 0) {
        const dbCorrectAnswer = result.recordset[0].correctanswer;
        // Compare Answer (Trim spaces for safety)
        if (String(userOption).trim() === String(dbCorrectAnswer).trim()) {
          score++;
        }
      }
    }

    const wrongAnswers = totalQuestions - score;

    // 3. Insert into [student_score_result]
    // We default TestType to 'Online' and Time to '10:00' (Total duration allowed)
    // TimeTake is the actual time the student spent
    await pool
      .request()
      .input('StudentId', sql.Int, studentId)
      .input('SubjectId', sql.Int, subjectId)
      .input('ClassId', sql.NVarChar, classId)
      .input('TestType', sql.NVarChar, 'Online')
      .input('NumOfQuestion', sql.Int, totalQuestions)
      .input('NoOfAnswered', sql.Int, totalQuestions)
      .input('Correct', sql.Int, score)
      .input('Wrong', sql.Int, wrongAnswers)
      .input('Time', sql.NVarChar, '10:00')
      .input('TimeTake', sql.NVarChar, timeTaken || '00:00').query(`
        INSERT INTO [dbo].[student_score_result]
        (StudentId, subjectName_Id, ClassName_Id, TestType, NumOfQuestion, NoOfAnswered, NoOfCorrectAnswered, NoOfWrongAnswered, Time, Time_Take, created_at, updated_at)
        VALUES 
        (@StudentId, @SubjectId, @ClassId, @TestType, @NumOfQuestion, @NoOfAnswered, @Correct, @Wrong, @Time, @TimeTake, GETDATE(), GETDATE())
      `);

    console.log(`✅ Result Saved! Score: ${score}/${totalQuestions}`);

    // 4. Send Response back to App
    const percentage =
      totalQuestions === 0 ? 0 : (score / totalQuestions) * 100;
    let message = 'Keep Trying!';
    if (percentage >= 80) message = 'Excellent Work!';
    else if (percentage >= 50) message = 'Good Job!';

    res.json({
      success: true,
      score: score,
      total: totalQuestions,
      message: message,
      percentage: percentage,
    });
  } catch (err) {
    console.error('❌ SQL Error (Submit Exam):', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
