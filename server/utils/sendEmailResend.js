import { Resend } from 'resend';

let resend = null;

const getResendClient = () => {
    if (!resend) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured in environment variables');
        }
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
};

export const sendOTPEmail = async (email, otp) => {
    try {
        const resendClient = getResendClient();
        
        const { data, error } = await resendClient.emails.send({
            from: 'CivicPulse <onboarding@resend.dev>', // Use your verified domain or resend.dev for testing
            to: [email],
            subject: 'CivicPulse - Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">CivicPulse Email Verification</h2>
                    <p>Your OTP for email verification is:</p>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px;">CivicPulse - Smart City Issue Reporting</p>
                </div>
            `
        });

        if (error) {
            throw error;
        }

        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Resend email error:', error);
        throw error;
    }
};
