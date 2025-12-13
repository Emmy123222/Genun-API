const nodemailer = require('nodemailer');
const conFig = require('./configure');

// Test email configuration
const testEmail = async () => {
    console.log('Testing email configuration...');
    console.log('Email:', conFig.hostMailAddress);
    console.log('Password length:', conFig.hostPass ? conFig.hostPass.length : 'Not set');

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

    // Verify connection
    try {
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!');
        
        // Send test email
        const testMailOptions = {
            from: `"POoS System Test" <${conFig.hostMailAddress}>`,
            to: conFig.hostMailAddress, // Send to yourself for testing
            subject: 'Test Email from POoS System',
            html: `
                <h2>Test Email</h2>
                <p>If you receive this email, your configuration is working!</p>
                <p>Time: ${new Date().toISOString()}</p>
            `
        };

        const info = await transporter.sendMail(testMailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        
    } catch (error) {
        console.log('❌ Email test failed:', error);
    }
};

testEmail();