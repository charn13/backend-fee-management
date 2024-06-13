const express = require('express')
const Student = require('../models/Student')
const Teacher = require('../models/Teacher')
const Course = require('../models/Courses')
const Admin = require('../models/Admin')
const Receipt = require('../models/Receipt')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const axios = require('axios')
const fetch = require('../middleware/fetchdetails');
const jwtSecret = "HaHa"
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


// Create a Multer storage configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Set the destination folder for file uploads
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Set a unique filename for each uploaded file
    },
  });
  
  const upload = multer({ storage: storage });



// var foodItems= require('../index').foodData;
// require("../index")
//Creating a user and storing data to MongoDB Atlas, No Login Requiered
router.post('/createuser', [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('username').isLength({ min: 3 }),
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }
    // console.log(req.body)
    // let user = await User.findOne({email:req.body.email})
    const salt = await bcrypt.genSalt(10)
    let securePass = await bcrypt.hash(req.body.password, salt);
    try {
        await Admin.create({
            username: req.body.username,
            password: securePass,
            email: req.body.email,
            role: req.body.role
        }).then(user => {
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, jwtSecret);
            success = true
            res.json({ success, authToken })
        })
            .catch(err => {
                console.log(err);
                res.json({ error: "Please enter a unique value." })
            })
    } catch (error) {
        console.error(error.message)
    }
})








router.post('/createstudent', [
  body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('course').isMongoId().withMessage('Invalid course ID'),
  body('admissionDate').optional().isISO8601().toDate().withMessage('Invalid admission date'),
  body('totalFeesPaid').optional().isNumeric().withMessage('Total Fees Paid must be a number'),
  body('phoneNumber').optional().isNumeric().withMessage('phoneNumber must be a number'),
  body('batch').optional().isNumeric().withMessage('batch no must be a number'),
  body('scholarshipAmount').optional().isNumeric().withMessage('Scholarship Amount must be a number'),
  body('pendingFees').optional().isNumeric().withMessage('Pending Fees must be a number'),
  body('isActive').optional().isBoolean().withMessage('Is Active must be a boolean')
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const { name, email, course, batch, phoneNumber, admissionDate, totalFeesPaid, scholarshipAmount, pendingFees, isActive } = req.body;

  try {
    // Check if a student with the same email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ success: false, error: 'Student with this email already exists.' });
    }

    // Fetch the course details
    const courseDetails = await Course.findById(course);
    if (!courseDetails) {
      return res.status(400).json({ success: false, error: 'Course not found.' });
    }

    // Create the student record
    const student = await Student.create({
      name,
      email,
      course,
      phoneNumber,
      batch,
      admissionDate,
      totalFeesPaid,
      scholarshipAmount,
      pendingFees,
      isActive,
    });

    // Configure the email transport using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use your email service provider
      auth: {
        user: "jdwebservices1@gmail.com",
        pass: "cwoxnbrrxvsjfbmr"
      },
    });

    // Define the email options with HTML content
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: student.email,
      subject: 'Welcome to Our School',
      html: `
 <html xmlns:v="urn:schemas-microsoft-com:vml">
                <head>
               
                </head>
                <style>
                    body {
                        margin: auto;
                        background-color:#c5c1c187; 
                        margin-top: 40px;
                    }
                    section{
                        font-family:sans-serif;
                         width: 75%;
                          margin: auto;
                    }
                    @media only screen and (min-width: 320px) and (max-width: 479px) {
                        .logo {
                            width: 100%;
                        }
                        body {
                            text-align: center;
                            width: 100%;
                        }
                        section{
                            width: 100%;
                        }
                    }
                  
                  </style>
                <body >
                    <section >
                        <header style="background-color: #fff; padding: 20px; border: 1px solid #faf8f8;">
                            <div style="width: 100%; margin: auto;  align-items: center;">
                                <div style="width: 50%; margin: auto;" class="logo">
                                    <img src="https://careerengine.in/wp-content/uploads/2023/02/logo.png" alt="welcome image">
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div>
                                <h2 style="text-align: center;">Welcome to Career Engine!</h2>
                              
                                <p style="text-align: center;">Hi ${student.name},</p>
                                <p> Thank you for choosing the Career Engine. Your Course Batch ${student.batch}. Your course fee is ${student.totalFeesPaid}. We are pleased to inform you that you have been awarded a scholarship of ${student.scholarshipAmount}, which will be deducted from your total fee. Your pending fee is ${student.pendingFees}.</p>
                                <p>If you have any questions, feel free to contact us at <a style="text-decoration: none;" href="tel:+919041619321">+919041619321</a>.</p>
                                <p>Career Engine</p>
                            </div>
                        </header>
                        <footer style="background-color:#f5f5f587; border: 1px solid #f5f5f587; padding: 20px; color: #888; text-align: center;">
                            <div>
                                <p>&copy; Copyright © 2024 All Rights Reserved. Made with Love by Career Engine</p>
                                <p>Contact us: Info@careerengine.in | Phone: 9041619321</p>
                                <h4>Available On</h4>
                                <div class="social-icons">
                                    <ul style="text-align: center; display: inline-flex; list-style: none; padding-left: 0px;">
                                        <li>
                                            <a href="https://www.facebook.com/careerengine1">
                                                <img src="https://static.xx.fbcdn.net/rsrc.php/yb/r/hLRJ1GG_y0J.ico" alt="facebook icon" style="margin: 0px 5px;">
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://www.instagram.com/career_engine1/">
                                                <img src="https://static.cdninstagram.com/rsrc.php/y4/r/QaBlI0OZiks.ico" alt="instagram icon" style="margin: 0px 5px;">
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </footer>
                    </section>
                </body>
                </html> `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ success: false, error: 'Failed to send email' });
      } else {
        console.log('Email sent:', info.response);
      }
    });

    success = true;
    res.json({ success, student });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;

// Route to get all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;


// Route to retrieve a specific student by ID
router.get('/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to update a specific student by ID
router.post('/updatestudents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, course, admissionDate, totalFeesPaid, scholarshipAmount, pendingFees, isActive} = req.body;
  try {
    let student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update the student record
    student = await Student.findByIdAndUpdate(id, {
      name,
      email,
  
      course,
      admissionDate,
      totalFeesPaid,
      scholarshipAmount,
      pendingFees,
      isActive
     
    }, { new: true });

    res.json(student);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/deletestudent/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete the student record
    await Student.findByIdAndDelete(id);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to create a new course
router.post('/createcourse', [
  body('name').isLength({ min: 3 }),
  body('fee').isNumeric(),
  body('durationInMonths').isInt({ min: 1 }), // Assuming duration is specified in months
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const { name, fee, durationInMonths } = req.body;

  try {
    // Check if a course with the same name already exists
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
      return res.status(400).json({ success, error: 'Course with this name already exists.' });
    }

    // Create the course record
    const course = await Course.create({
      name,
      fee,
      durationInMonths,
    });

    success = true;
    res.json({ success, course });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success, error: 'Server Error' });
  }
});

// Route to retrieve all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to retrieve a specific course by ID
router.get('/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to update a specific course by ID
router.put('/coursesupdate/:id', async (req, res) => {
  const { id } = req.params;
  const { name, fee, durationInMonths } = req.body;
  try {
    let course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Update the course record
    course = await Course.findByIdAndUpdate(id, {
      name,
      fee,
      durationInMonths,
    }, { new: true });

    res.json(course);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to delete a specific course by ID
router.get('/deletecourses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete the course record
    await Course.findByIdAndDelete(id);

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to create a new teacher
router.post('/teacher', [
  body('name').isLength({ min: 3 }),
  body('email').isEmail(),
  body('coursesAssigned').isArray({ min: 1 }).withMessage('At least one course must be assigned'),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const { name, email, coursesAssigned } = req.body;

  try {
    // Check if a teacher with the same email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ success, error: 'Teacher with this email already exists.' });
    }

    // Check if all assigned courses exist
    const existingCourses = await Course.find({ _id: { $in: coursesAssigned } });
    if (existingCourses.length !== coursesAssigned.length) {
      return res.status(400).json({ success, error: 'One or more assigned courses do not exist.' });
    }

    // Create the teacher record
    const teacher = await Teacher.create({
      name,
      email,
      coursesAssigned,
    });

    success = true;
    res.json({ success, teacher });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success, error: 'Server Error' });
  }
});

// Route to retrieve all teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to retrieve a specific teacher by ID
router.get('/teachers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to update a specific teacher by ID
router.put('/teachersupdate/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const { name, email, coursesAssigned } = req.body;
  console.log("name",name, "Email: ", email, "Course", coursesAssigned );
  try {
    let teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Update the teacher record
    teacher = await Teacher.findByIdAndUpdate(id, {
      name,
      email,
      coursesAssigned,
    }, { new: true });

    res.json(teacher);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to delete a specific teacher by ID
router.get('/deleteteachers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Delete the teacher record
    await Teacher.findByIdAndRemove(id);

    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

//Get a Product
// Endpoint for fetching product details
router.get('/getproducts/:productId', async (req, res) => {
    try {
      const productId = req.params.productId;
      const product = await Products.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(
        {
            status: 'success',
            data: product
        }
      )
     
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

// Create a Product

router.post('/products', async(req, res) => {
    console.log("Products");

    try {
        console.log("start try");
        const newProduct = new Products(req.body);
        const savedProduct = await newProduct.save();
        res.json(savedProduct);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}) 




// Authentication a User, No login Requiered
router.post('/login', [
    body('email', "Enter a Valid Email").isEmail(),
    body('password', "Password cannot be blank").exists(),
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;
    try {
        let user = await Admin.findOne({ email });  //{email:email} === {email}
        if (!user) {
            return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
        }

        const pwdCompare = await bcrypt.compare(password, user.password); // this return true false.
        if (!pwdCompare) {
            return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
        }
        const data = {
            user: {
                id: user.id,
                role: user.role
            }
        }
        console.log(data, "data");
        success = true;
        const authToken = jwt.sign(data, jwtSecret);
        res.json({ success, authToken, role:data.user.role})


    } catch (error) {
        console.error(error.message)
        res.send("Server Error")
    }
})
router.post('/createreceipt', [
  body('student').isMongoId().withMessage('Invalid student ID'),
  body('amountPaid').isNumeric(),
  body('paymentMethod').isIn(['Cash', 'UPI', 'Bank Transfer']),
  body('receiptNumber').isString().notEmpty(),
  body('notes').optional().isString(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const { student, amountPaid, paymentMethod, receiptNumber, notes } = req.body;

  try {
    // Create the receipt record
    const receipt = await Receipt.create({
      student,
      amountPaid,
      paymentMethod,
      receiptNumber,
      notes,
    });

    const studentRecord = await Student.findById(student);
if (!studentRecord) {
  return res.status(404).json({ success: false, error: 'Student not found' });
}

const studentEmail = studentRecord.email;

// Email options
const mailOptions = {
  from: 'jdwebservices1@gmail.com',
  to: studentEmail,
  subject: 'Fee Receipt',
  html: `
   <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: auto;
              background-color: #fff;
              padding: 20px;
              border: 1px solid #ddd;
            }
            .header, .footer {
              text-align: center;
              padding: 10px 0;
            }
            .header img {
              max-width: 150px;
            }
            .content {
              text-align: left;
            }
            .content h1 {
              font-size: 24px;
              margin-bottom: 20px;
            }
            .details, .receipts-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .details th, .details td, .receipts-table th, .receipts-table td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            .details th, .receipts-table th {
              background-color: #f2f2f2;
              text-align: left;
            }
            .total {
              font-weight: bold;
            }
            .footer p {
              color: #888;
              font-size: 12px;
              margin: 0;
            }
            .social-icons img {
              width: 24px;
              margin: 0 5px;
            }
            @media only screen and (max-width: 600px) {
              .container {
                width: 100%;
                padding: 10px;
              }
              .content h1 {
                font-size: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
           <p>Receipt Number: ${receiptNumber}</p>
            <div class="header">
              <img src="https://careerengine.in/wp-content/uploads/2023/02/logo.png" alt="Career Engine">
              <h2>Welcome to Career Engine!</h2>
               <h2>Fee Receipt</h2>
            </div>
            <div class="content">
             
             
              <p>Student: ${studentRecord.name}</p>
         
              <p>Payment Method: ${paymentMethod}</p>
              <p>Notes: ${notes || 'N/A'}</p>
              <table class="receipts-table">
                <tr>
                  <th>Pay Fee</th>
                  <td>${amountPaid}</td>
                </tr>
                <tr>
                  <th>Total Pending</th>
                  <td>${studentRecord.pendingFees}</td>
                </tr>
              </table>
              <p>If you have any questions, feel free to contact us at <a href="tel:+919041619321">+919041619321</a>.</p>
              <p>Career Engine</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 All Rights Reserved. Made with Love by Career Engine</p>
              <p>Contact us: Info@careerengine.in | Phone: 9041619321</p>
              <h4>Available On</h4>
              <div class="social-icons">
                <a href="https://www.facebook.com/careerengine1">
                  <img src="https://static.xx.fbcdn.net/rsrc.php/yb/r/hLRJ1GG_y0J.ico" alt="Facebook">
                </a>
                <a href="https://www.instagram.com/career_engine1/">
                  <img src="https://static.cdninstagram.com/rsrc.php/y4/r/QaBlI0OZiks.ico" alt="Instagram">
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>


  `
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
secure: false,
auth: {
    user: "jdwebservices1@gmail.com",
    pass: "cwoxnbrrxvsjfbmr"
},
tls:{
  rejectUnauthorized: false
}
});
// Send email
await transporter.sendMail(mailOptions);

success = true;
res.json({ success, receipt });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success, error: 'Server Error' });
  }
});








// Route to create a new receipt
// router.post('/createreceipt', [
//   body('student').isMongoId().withMessage('Invalid student ID'),
//   body('amountPaid').isNumeric(),
//   body('paymentMethod').isIn(['Cash', 'Credit Card', 'Bank Transfer']),
//   body('receiptNumber').isString().notEmpty(),
//   body('notes').optional().isString(),
// ], async (req, res) => {
//   let success = false;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ success, errors: errors.array() });
//   }

//   const { student, amountPaid, paymentMethod, receiptNumber, notes } = req.body;

//   try {
//     // Create the receipt record
//     const receipt = await Receipt.create({
//       student,
//       amountPaid,
//       paymentMethod,
//       receiptNumber,
//       notes,
//     });

//     success = true;
//     res.json({ success, receipt });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success, error: 'Server Error' });
//   }
// });






// Route to retrieve all receipts
router.get('/receipts', async (req, res) => {
  try {
    const receipts = await Receipt.find();
    res.json(receipts);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});
router.get('/receipts/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  console.log("studentId:", studentId);

  try {
    const receipts = await Receipt.find({ student:studentId });
    if (receipts.length === 0) {
      return res.status(404).json({ message: 'No receipts found for this student ID' });
    } else {
      console.log("receipts", receipts);
      return res.json(receipts);
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: 'Server Error' });
  }
});
// Route to retrieve a specific receipt by ID
router.get('/receipt/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    res.json(receipt);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to update a specific receipt by ID
router.put('/updatereceipts/:id', async (req, res) => {
  const { id } = req.params;
  const { student, amountPaid,courseName,courseAmount, paymentMethod, receiptNumber, notes } = req.body;
  try {
    let receipt = await Receipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Update the receipt record
    receipt = await Receipt.findByIdAndUpdate(id, {
      student,
      courseName,
      courseAmount,
      amountPaid,
      paymentMethod,
      receiptNumber,
      notes,
    }, { new: true });

    res.json(receipt);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to delete a specific receipt by ID
router.post('/receipts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Delete the receipt record
    await Receipt.findByIdAndRemove(id);

    res.json({ success: true, message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get logged in User details, Login Required.
router.post('/getuser', fetch, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await Student.findById(userId).select("-password") // -password will not pick password from db.
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.send("Server Error")

    }
})
// Get logged in User details, Login Required.
router.post('/getlocation', async (req, res) => {
    try {
        let lat = req.body.latlong.lat
        let long = req.body.latlong.long
        console.log(lat, long)
        let location = await axios
            .get("https://api.opencagedata.com/geocode/v1/json?q=" + lat + "+" + long + "&key=74c89b3be64946ac96d777d08b878d43")
            .then(async res => {
                // console.log(`statusCode: ${res.status}`)
                console.log(res.data.results)
                // let response = stringify(res)
                // response = await JSON.parse(response)
                let response = res.data.results[0].components;
                console.log(response)
                let { village, county, state_district, state, postcode } = response
                return String(village + "," + county + "," + state_district + "," + state + "\n" + postcode)
            })
            .catch(error => {
                console.error(error)
            })
        res.send({ location })

    } catch (error) {
        console.error(error.message)
        res.send("Server Error")

    }
})
router.post('/foodData', async (req, res) => {
    try {
        // console.log( JSON.stringify(global.foodData))
        // const userId = req.user.id;
        // await database.listCollections({name:"food_items"}).find({});
        res.send([global.foodData, global.foodCategory])

    } catch (error) {
        console.error(error.message)
        res.send("Server Error")

    }
})

router.post('/orderData', async (req, res) => {
    let data = req.body.order_data
    await data.splice(0,0,{Order_date:req.body.order_date})
    console.log("1231242343242354",req.body.email)

    //if email not exisitng in db then create: else: InsertMany()
    let eId = await Order.findOne({ 'email': req.body.email })    
    console.log(eId)
    if (eId===null) {
        try {
            console.log(data)
            console.log("1231242343242354",req.body.email)
            await Order.create({
                email: req.body.email,
                order_data:[data]
            }).then(() => {
                res.json({ success: true })
            })
        } catch (error) {
            console.log(error.message)
            res.send("Server Error", error.message)

        }
    }

    else {
        try {
            await Order.findOneAndUpdate({email:req.body.email},
                { $push:{order_data: data} }).then(() => {
                    res.json({ success: true })
                })
        } catch (error) {
            console.log(error.message)
            res.send("Server Error", error.message)
        }
    }
})

router.post('/myOrderData', async (req, res) => {
    try {
        console.log(req.body.email)
        let eId = await Order.findOne({ 'email': req.body.email })
        //console.log(eId)
        res.json({orderData:eId})
    } catch (error) {
        res.send("Error",error.message)
    }
    

});

router.get('/products/:productId', async (req, res) => {
    try {
      const productId = req.params.productId;
      const product = await Products.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  // Define a route to handle product creation
router.post('/api/products', upload.single('img'), async (req, res) => {
    
    try {
      // Extract product data from the request body
      const { name, description, CategoryName, options } = req.body;
      const img = req.file.filename;
      //   const optionss = JSON.parse(options);
      console.log(img);
      // Create a new product instance
      const newProduct = new Products({
          name,
          description,
          CategoryName,
          img:`https://foodcareerengine.onrender.com/${img}`,
          options: JSON.parse(options)
        });
        
        console.log(newProduct.options);
        console.log(newProduct.CategoryName);
     
  
      // Save the product to the database
      const savedProduct = await newProduct.save();
        res.status(201).json({
            status: 'success',
            data: savedProduct
          });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Define a route to handle product creation
router.post('/api/category', upload.single('catimg'), async (req, res) => {
    
    try {
      // Extract product data from the request body
      const { CategoryName } = req.body;
      const img = req.file.filename;
      //   const optionss = JSON.parse(options);
      console.log(img);
      // Create a new product instance
      const newCategory = new Category({
         
          CategoryName,
          img:`https://foodcareerengine.onrender.com/${img}`,
        });
        
      
  
      // Save the product to the database
      const savedCategory = await newCategory.save();
        res.status(201).json({
            status: 'success',
            data: savedCategory
          });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

//get a list of Category
  router.get('/categories', async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  //forgotPassword api
  const resetTokens = {};
  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
      // Check if the email exists in MongoDB
      const user = await Student.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'Email not found.' });
      }
  
      // Generate a unique reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
  
      // Save the reset token and its expiry date in the database
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
      await user.save();
  
  
    // Send a password reset email to the user
    const transporter = nodemailer.createTransport({
      service: "Gmail",
    secure: false,
    auth: {
        user: "jdwebservices1@gmail.com",
        pass: "cwoxnbrrxvsjfbmr"
    },
    tls:{
      rejectUnauthorized: false
    }
    });
  
    const mailOptions = {
        from: 'jdwebservices1@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: http://localhost:3000/reset-password/${resetToken}`,
      };
  
      await transporter.sendMail(mailOptions);
      res.json({ 
        message: 'Password reset email sent. Check your inbox.',
        resetToken:resetToken
     });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while processing the request.' });
    }
  });


  // Reset password endpoint
  router.post('/reset-password/:resetToken', async (req, res) => {
    const { resetToken } = req.params;
    const { password } = req.body;
  
    try {
      // Find user by reset token
      const user = await Student.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
      }
  
      const salt = await bcrypt.genSalt(10)
      let securePass = await bcrypt.hash(password, salt);

      // Update password and reset token
      user.password = securePass; // In a real-world scenario, remember to hash the password
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
  
      // Save the updated user
      await user.save();
  
      return res.json({ message: 'Password reset successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  });


 
// send receipt on mail
// router.get('/sendmail/:stuid/:recid', async (req, res) => {
//   const { stuid, recid } = req.params;

//   try {
//     // Retrieve student information
//     const student = await Student.findById(stuid);
//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     // Retrieve receipt information
//     const receipt = await Receipt.findById(recid);
//     if (!receipt) {
//       return res.status(404).json({ error: 'Receipt not found' });
//     }

//     // Generate receipt content
//     const receiptContent = `
  
//       <div style="font-family: Arial, sans-serif;
//       background-color: black;"></div>
//       <div style="  max-width: 600px;
//       margin: 50px auto;
//       padding: 20px;
//       background-color: black;
//       color: white;
//       border-radius: 10px;
//       box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
//           <h2 style="  text-align: center;
//           margin-bottom: 20px;">Fee Receipt</h2>
//           <table style=" width: 100%;
//           margin-bottom: 20px;
//           border-collapse: collapse;">
//               <tr>
//                   <th>Field</th>
//                   <th>Details</th>
//               </tr>
//               <tr>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;"><strong>Student Name</strong></td>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;">${student.name}</td>
//               </tr>
//               <tr>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;"><strong>Email</strong></td>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;">${student.email}</td>
//               </tr>
//               <tr>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;"><strong>Amount Paid</strong></td>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;">${receipt.amountPaid}</td>
//               </tr>
//               <tr>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;"><strong>Payment Method</strong></td>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;">${receipt.paymentMethod}</td>
//               </tr>
//               <tr>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;"><strong>Receipt Number</strong></td>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;">${receipt.receiptNumber}</td>
//               </tr>
//               <tr>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;"><strong>Notes</strong></td>
//                   <td style =" padding: 10px;
//               border-bottom: 1px solid #fff;
//               text-align: left;">${receipt.notes || '-'}</td>
//               </tr>
//           </table>
//       </div>
//       </div>
//     `;

//     // Setup Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: "jdwebservices1@gmail.com",
//         pass: "cwoxnbrrxvsjfbmr"
//       }
//     });

//     // Mail options
//     const mailOptions = {
//       from: 'ggumber1998@gmail.com',
//       to: student.email,
//       subject: 'Fee Receipt',
//       html: receiptContent,
//       attachments: [
//         {
//           filename: 'receipt.pdf',
//           content: 'PDF content here', // Add PDF content here
//           contentType: 'application/pdf'
//         }
//       ]
//     };

//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Error sending email' });
//       } else {
//         console.log('Email sent: ' + info.response);
//         res.json({ message: 'Email sent successfully' });
//       }
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: 'Server Error' });
//   }
// });


module.exports = router