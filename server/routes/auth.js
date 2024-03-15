require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const transporter = require('../utils/transporter');

// ROUTE 1: Register user

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }).isAlphanumeric(),
  body('firstName').isLength({ min: 3 }),
  body('lastName').isLength({ min: 3 })
],
  async (req, res) => {
    // Validate email domain
    if (!req.body.email.endsWith('iitism.ac.in')) {
      return res.status(400).json({ error: 'Invalid email domain' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(501).send({ errors: errors.array() });
    }

    const user_check = await User.findOne({ email: req.body.email });
    if (user_check) {
      return res.status(501).json({ error: 'User with email address alreay exist!!' });
    }
    // Generate OTP
    const generateOtp = () => {
      const digits = '0123456789';
      let otp = '';
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
      }
      return otp;
    };
    const otp = generateOtp();

    // Store OTP in the database with expiration time
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = new User({ firstName: req.body.firstName, lastName: req.body.lastName, designantion: req.body.designantion, email: req.body.email, password: hashedPassword, otp, otpExpiresAt: Date.now() + 5 * 60 * 1000 }); // Expires in 5 minutes
    await user.save();

    // Send OTP email
    try {
      await transporter.sendMail({
        from: 'Power@iitism.ac.in',
        to: user.email,
        subject: 'Your OTP for Verification',
        text: `${user.firstName + user.lastName}, your OTP is ${otp}. It will expire in 5 minutes.`,
        html: `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta http-equiv="X-UA-Compatible" content="ie=edge" />
            
                <link
                  href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
                  rel="stylesheet"
                />
              </head>
              <body
                style="
                  margin: 0;
                  font-family: 'Poppins', sans-serif;
                  background: #ffffff;
                  font-size: 14px;
                "
              >
                <div
                  style="
                    max-width: 680px;
                    margin: 0 auto;
                    padding: 45px 30px 60px;
                    background: #f4f7ff;
                    background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
                    background-repeat: no-repeat;
                    background-size: 800px 452px;
                    background-position: top center;
                    font-size: 14px;
                    color: #434343;
                  "
                >
                  <header>
                    <table style="width: 100%;">
                      <tbody>
                        <tr style="height: 0;">
                          <td>
                            <img
                              src="https://i.ibb.co/gMPkrHs/IsmLogo.jpg" 
                              alt="IsmLogo" 
                              border="0"
                              height="80px"
                            />
                          </td>
                          <td style="text-align: right;">
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </header>
            
                  <main>
                    <div
                      style="
                        margin: 0;
                        margin-top: 70px;
                        padding: 92px 30px 115px;
                        background: #ffffff;
                        border-radius: 30px;
                        text-align: center;
                      "
                    >
                      <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                        <h1
                          style="
                            margin: 0;
                            font-size: 24px;
                            font-weight: 500;
                            color: #1f1f1f;
                          "
                        >
                        ${user.firstName + user.lastName}, your OTP
                        </h1>
                        <p
                          style="
                            margin: 0;
                            margin-top: 17px;
                            font-size: 16px;
                            font-weight: 500;
                          "
                        >
                          Hey ${user.firstName + user.lastName},
                        </p>
                        <p
                          style="
                            margin: 0;
                            margin-top: 17px;
                            font-weight: 500;
                            letter-spacing: 0.56px;
                          "
                        >
                          Use the following OTP
                          to complete the procedure to change your email address. OTP is
                          valid for
                          <span style="font-weight: 600; color: #1f1f1f;">5 minutes</span>.
                          Do not share this code with others.
                        </p>
                        <p
                          style="
                            margin: 0;
                            margin-top: 60px;
                            font-size: 40px;
                            font-weight: 600;
                            letter-spacing: 25px;
                            color: #ba3d4f;
                          "
                        >
                          ${otp}
                        </p>
                      </div>
                    </div>
            
                    
                  </main>
            
                  <footer
                    style="
                      width: 100%;
                      max-width: 490px;
                      margin: 20px auto 0;
                      text-align: center;
                      border-top: 1px solid #e6ebf1;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        margin-top: 40px;
                        font-size: 16px;
                        font-weight: 600;
                        color: #434343;
                      "
                    >
                      IIT DHANBAD
                    </p>
                  </footer>
                </div>
              </body>
            </html>`
      });

      res.status(202).json({ message: 'OTP sent to your email' });
    } catch (error) {
      console.error('Error sending OTP email:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });

// ROUTE 2: Verify OTP

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check OTP validity
    if (user.otp !== otp || Date.now() > user.otpExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // OTP verification successful
    User.findOneAndUpdate({ email }, { $unset: { otp: 1, otpExpiresAt: 1 } }).then(() => console.log('fields updated'))
      .catch(err => console.error(err));;

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
    res.status(200).json({
      token: token,
      message: 'OTP verified successfully'
    });
    console.log(res);
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// ROUTE 3: User login

router.post('/login', async (req, res) => {
  //domain check
  if (!req.body.email.endsWith('iitism.ac.in')) {
    return res.status(400).json({ error: 'Invalid email domain' });
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    //user doesn't exist
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    // matching password hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    // password match unsuccessfull
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    //JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

//ROUTE 4: Get User Details

router.post('/get-user', verifyToken, async (req, res) => {
  try {
    const id = req.userId;
    const user = await User.findOne({ _id: id }).select("-password");
    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;