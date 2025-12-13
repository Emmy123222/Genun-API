// Example email configuration for when you have Gmail App Password

// For Gmail (when you have App Password):
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'emmanuelogheneovo17@gmail.com',
        pass: 'your-16-character-app-password' // Get this from Google Account > Security > App Passwords
    }
});

// For development testing (Mailtrap):
const mailtrapTransporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "your-mailtrap-user",
        pass: "your-mailtrap-pass"
    }
});

// To use Gmail:
// 1. Go to https://myaccount.google.com/security
// 2. Enable 2-Step Verification
// 3. Go to "App passwords"
// 4. Select "Mail" and generate password
// 5. Replace 'your-16-character-app-password' with the generated password
// 6. Update your .env file with the app password