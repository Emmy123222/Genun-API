const nodemailer = require('nodemailer');
const conFig = require('./configure');

// Comprehensive email test with detailed diagnostics
const testEmailConfiguration = async () => {
    console.log('\n🔍 Testing Email Configuration...\n');
    
    // Check environment variables
    console.log('📋 Configuration Check:');
    console.log('  Email:', conFig.hostMailAddress || '❌ NOT SET');
    console.log('  Password:', conFig.hostPass ? `✅ Set (${conFig.hostPass.length} chars)` : '❌ NOT SET');
    console.log('  Frontend URL:', conFig.frontendUrl || '❌ NOT SET');
    console.log('');

    if (!conFig.hostMailAddress || !conFig.hostPass) {
        console.log('❌ Missing email credentials in .env file!');
        console.log('\nPlease set:');
        console.log('  HOST_ADDRESS=your-email@gmail.com');
        console.log('  HOST_PASSWORD=your-16-char-app-password');
        console.log('\n📖 To get Gmail App Password:');
        console.log('  1. Go to https://myaccount.google.com/security');
        console.log('  2. Enable 2-Step Verification');
        console.log('  3. Go to "App passwords"');
        console.log('  4. Generate password for "Mail"');
        return;
    }

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
        }
    });

    // Test 1: Verify SMTP connection
    console.log('🔌 Test 1: Verifying SMTP connection...');
    try {
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');
    } catch (error) {
        console.log('❌ SMTP connection failed!');
        console.log('Error:', error.message);
        console.log('\n💡 Common issues:');
        console.log('  - Wrong email or password');
        console.log('  - Need to use App Password (not regular password)');
        console.log('  - 2-Step Verification not enabled');
        console.log('  - "Less secure app access" disabled (use App Password instead)');
        return;
    }

    // Test 2: Send actual test email
    console.log('📧 Test 2: Sending test email...');
    const testMailOptions = {
        from: `"POoS System Test" <${conFig.hostMailAddress}>`,
        to: conFig.hostMailAddress, // Send to yourself
        subject: 'POoS Email Test - ' + new Date().toLocaleString(),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #235789;">✅ Email Configuration Working!</h2>
                <p>Your POoS System email configuration is working correctly.</p>
                <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
                <p><strong>From:</strong> ${conFig.hostMailAddress}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                    This is an automated test email from your POoS API.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(testMailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('📨 Message ID:', info.messageId);
        console.log('📤 Response:', info.response);
        console.log('\n✨ Check your inbox:', conFig.hostMailAddress);
        console.log('\n🎉 Email system is working! Users should now receive verification emails.');
    } catch (error) {
        console.log('❌ Failed to send test email!');
        console.log('Error:', error.message);
        if (error.code) console.log('Error Code:', error.code);
        if (error.response) console.log('SMTP Response:', error.response);
    }
};

testEmailConfiguration();
