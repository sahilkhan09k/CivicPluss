import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import nodemailer from 'nodemailer';

console.log('Testing Email Configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length);
console.log('EMAIL_PASSWORD value:', process.env.EMAIL_PASSWORD);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function testEmail() {
    try {
        console.log('\nVerifying transporter...');
        await transporter.verify();
        console.log('✓ Email configuration is valid!');
        
        console.log('\nSending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test Email from CivicPulse',
            text: 'This is a test email to verify email configuration.',
            html: '<p>This is a test email to verify email configuration.</p>'
        });
        
        console.log('✓ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('✗ Email test failed:');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        console.error('Command:', error.command);
    }
}

testEmail();
