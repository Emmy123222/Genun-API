const _ = require('lodash');

// Import Manufacturer model directly
const User = require('../models/manufacturer');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const conFig = require('../configure');

exports.createUser = async (req, res, next) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email });

        if (user) {
            const error = new Error('User already exists.');
            error.statusCode = 422;
            throw error;
        }

        const newUser = new User(_.pick(req.body, ['name', 'email', 'industry', 'password', 'address', 'idNumber']));

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);

        const result = await newUser.save();

        const pickedUser = _.pick(result, ['_id', 'name', 'email']);
        res.status(201).json({
            message: "User created successfully",
            user: pickedUser
        });
    } catch (err) {
        if (!err.statusCode) {
            console.log(err.message);
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.verifyEmailWithToken = async (req, res) => {
    const token = req.params.token;

    try {
        const decoded = jwt.verify(token, conFig.jwtKey);
        const userId = decoded.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isEmailVerified = true;
        await user.save();
        return res.status(200).json({ message: "Email verified" });
    } catch (error) {

        res.status(400).json({ message: 'Invalid or expired token' });
    }

}


exports.getUser = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const pickedUser = _.pick(user, [
            '_id', 'name', 'email', 'industry', 
            'address', 'idNumber', 'contractAddress', 
            'isFirstTimeLogin', 'isEmailVerified'
        ]);
        
        res.status(200).json({ 
            message: 'User fetched successfully', 
            user: pickedUser 
        });
    } catch (error) {
        console.error('Error in getUser:', error);
        const status = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(status).json({ message });
    }
};


exports.sendMailToUser = async (req, res, next) => {
    try {
        const email = req.body.email;
    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(400).json({ message: 'Invalid email' });
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email },
        conFig.jwtKey,
        { expiresIn: '1h' }
    );

    // Use configured frontend URL (defaults to localhost for development)
    const loginLink = `${conFig.frontendUrl}/signup/verify-account/${token}`;

    // Gmail configuration with App Password and better settings
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: conFig.hostMailAddress,
            pass: conFig.hostPass,
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: true,
        logger: true
    });

    const mailOptions = {
        from: `"POoS System" <${conFig.hostMailAddress}>`,
        to: user.email,
        subject: 'POoS Email Verification Link',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #235789;">Welcome to POoS System!</h2>
                <p>Thank you for registering with our Proof of Originality System.</p>
                <p>Please click the button below to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginLink}" 
                       style="background-color: #235789; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #666;">${loginLink}</p>
                <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    If you didn't create an account, please ignore this email.
                </p>
            </div>
        `,
        text: `Welcome to POoS System! Please verify your email by clicking this link: ${loginLink}`
    };

    // Verify transporter configuration first
    try {
        await transporter.verify();
        console.log('✅ SMTP Server is ready to take our messages');
    } catch (verifyError) {
        console.log('❌ SMTP Configuration Error:', verifyError);
        return res.status(500).json({ 
            message: 'Email service configuration error. Please contact support.',
            error: verifyError.message 
        });
    }

    // Send email and wait for result
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('📧 Recipient:', user.email);
        console.log('📨 Message ID:', info.messageId);
        console.log('📤 Response:', info.response);
        
        return res.status(200).json({ 
            message: 'Email verification link sent to your email',
            success: true 
        });
    } catch (emailError) {
        console.log('❌ Email sending failed:', emailError);
        console.log('Error code:', emailError.code);
        console.log('Error response:', emailError.response);
        
        return res.status(500).json({ 
            message: 'Failed to send verification email. Please try again or contact support.',
            error: emailError.message 
        });
    }
    } catch (error) {
        console.error('Error in sendMailToUser:', error);
        res.status(500).json({ message: 'Failed to send verification email' });
    }
};


exports.updateUser = (req, res, next) => {
    const userId = req.user.userId;
    User.findById(userId)
        .then(singleUser => {
            if (!singleUser) {
                const error = new Error('Could not find user.')
                error.statusCode = 404;
                throw error;
            }
            singleUser.contractAddress = req.body.contractAddress

            return singleUser.save()
                .then((newUser) => {
                    return res.status(200).json({
                        singleUser: newUser
                    })
                });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}

exports.deleteUser = (req, res, next) => {
    const user = req.user.userId;
    User.findById(user)
        .then(singleUser => {
            if (!singleUser) {
                const error = new Error('User not found')
                error.statusCode = 404;
                throw error;
            }
            return User.findByIdAndRemove(user);
        })
        .then(result => {
            return res.status(200).json({ message: 'Deleted User Successfully' });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            next(error);
        })
}

