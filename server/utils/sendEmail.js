import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

export const sendOTPEmail = async (email, otp) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `CivicPulse <${process.env.EMAIL_USER}>`,
        to: email,
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
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
};

export const sendIssueResolvedEmail = async (email, issueData) => {
    const transporter = createTransporter();
    const { issue, resolvedScore } = issueData;

    const mailOptions = {
        from: `CivicPulse <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✅ Your Issue Has Been Resolved - CivicPulse',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="background-color: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 15px;">
                            ✅
                        </div>
                        <h1 style="color: #10b981; margin: 0;">Issue Resolved Successfully!</h1>
                    </div>
                    
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 25px;">
                        <h2 style="color: #166534; margin: 0 0 10px 0; font-size: 18px;">Issue Details</h2>
                        <p style="margin: 5px 0; color: #166534;"><strong>Title:</strong> ${issue.title}</p>
                        <p style="margin: 5px 0; color: #166534;"><strong>Issue ID:</strong> #${issue._id.slice(-6)}</p>
                        <p style="margin: 5px 0; color: #166534;"><strong>Location:</strong> ${issue.city}</p>
                    </div>

                    ${resolvedScore ? `
                    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 25px;">
                        <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">🤖 AI Verification Score</h3>
                        <div style="background-color: #e5e7eb; height: 10px; border-radius: 5px; margin: 10px 0;">
                            <div style="background-color: ${resolvedScore >= 80 ? '#10b981' : resolvedScore >= 60 ? '#f59e0b' : '#ef4444'}; height: 10px; border-radius: 5px; width: ${resolvedScore}%;"></div>
                        </div>
                        <p style="margin: 5px 0; color: #1e40af; font-weight: bold;">${resolvedScore}% - ${resolvedScore >= 80 ? 'Excellent Resolution' : resolvedScore >= 60 ? 'Good Resolution' : 'Needs Improvement'}</p>
                    </div>
                    ` : ''}

                    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
                        <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">⚖️ Not Satisfied? You Can Challenge</h3>
                        <p style="color: #92400e; margin: 0 0 10px 0;">If you believe the issue is not properly resolved, you have <strong>24 hours</strong> to file a challenge.</p>
                        <p style="color: #92400e; margin: 0; font-size: 14px;">• Review the resolution photo in your dashboard<br>• File a challenge if the work is incomplete<br>• Our team will review your challenge within 48 hours</p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/user/issue/${issue._id}" 
                           style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            View Issue Details
                        </a>
                    </div>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
                        CivicPulse - Smart City Issue Reporting<br>
                        This email was sent because your issue status was updated.
                    </p>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Issue resolved email sent to ${email}`);
};

export const sendIssueSpamEmail = async (email, issueData) => {
    const transporter = createTransporter();
    const { issue, reportedBy } = issueData;

    const mailOptions = {
        from: `CivicPulse <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '⚠️ Issue Marked as Spam - Action Required - CivicPulse',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="background-color: #ef4444; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 15px;">
                            ⚠️
                        </div>
                        <h1 style="color: #ef4444; margin: 0;">Issue Marked as Spam/Fake</h1>
                    </div>
                    
                    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 25px;">
                        <h2 style="color: #991b1b; margin: 0 0 10px 0; font-size: 18px;">Issue Details</h2>
                        <p style="margin: 5px 0; color: #991b1b;"><strong>Title:</strong> ${issue.title}</p>
                        <p style="margin: 5px 0; color: #991b1b;"><strong>Issue ID:</strong> #${issue._id.slice(-6)}</p>
                        <p style="margin: 5px 0; color: #991b1b;"><strong>Location:</strong> ${issue.city}</p>
                        <p style="margin: 5px 0; color: #991b1b;"><strong>Reported by Admin:</strong> ${reportedBy?.name || 'System Admin'}</p>
                    </div>

                    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
                        <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">🚨 Important: Action Required</h3>
                        <p style="color: #92400e; margin: 0 0 15px 0;">Your issue has been marked as spam or fake by an admin. This means:</p>
                        <ul style="color: #92400e; margin: 0 0 15px 0; padding-left: 20px;">
                            <li>The admin believes this report is not genuine</li>
                            <li>Your trust score will be reduced if you don't challenge</li>
                            <li>You have <strong>24 hours</strong> to file a challenge</li>
                        </ul>
                        <p style="color: #92400e; margin: 0; font-weight: bold;">If you don't challenge within 24 hours, a trust score penalty will be applied automatically.</p>
                    </div>

                    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 25px;">
                        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">⚖️ How to Challenge This Decision</h3>
                        <ol style="color: #1e40af; margin: 0; padding-left: 20px;">
                            <li>Click the button below to view your issue</li>
                            <li>Take a new photo at the same location</li>
                            <li>Submit your challenge with evidence</li>
                            <li>Our super admin will review within 48 hours</li>
                        </ol>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/user/issue/${issue._id}" 
                           style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
                            File Challenge Now
                        </a>
                        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/user/dashboard" 
                           style="background-color: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            View Dashboard
                        </a>
                    </div>

                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #374151; margin: 0; font-size: 14px; text-align: center;">
                            <strong>Deadline:</strong> ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}<br>
                            <span style="color: #ef4444;">⏰ Time remaining: 24 hours from now</span>
                        </p>
                    </div>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
                        CivicPulse - Smart City Issue Reporting<br>
                        This email was sent because your issue was marked as spam/fake.
                    </p>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Issue spam email sent to ${email}`);
};