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

/**
 * Notification templates for challenge events
 */
const notificationTemplates = {
    challenge_accepted: {
        subject: 'CivicPulse - Challenge Accepted for Review',
        getHtml: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Challenge Accepted</h2>
                <p>Your challenge has been accepted and is now under super admin review.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #1f2937;">Challenge Details</h3>
                    <p><strong>Issue:</strong> ${data.issueTitle}</p>
                    <p><strong>Similarity Score:</strong> ${data.similarityScore}%</p>
                    <p><strong>Status:</strong> Under Review</p>
                    <p><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
                </div>
                
                <p>A super admin will review your challenge and make a final decision. You will be notified once the review is complete.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px;">CivicPulse - Smart City Issue Reporting</p>
            </div>
        `
    },
    
    challenge_rejected: {
        subject: 'CivicPulse - Challenge Rejected',
        getHtml: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ef4444;">Challenge Rejected</h2>
                <p>Unfortunately, your challenge has been rejected.</p>
                
                <div style="background-color: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <h3 style="margin-top: 0; color: #991b1b;">Rejection Details</h3>
                    <p><strong>Issue:</strong> ${data.issueTitle}</p>
                    <p><strong>Reason:</strong> ${data.rejectionReason}</p>
                    <p><strong>Similarity Score:</strong> ${data.similarityScore}%</p>
                    <p><strong>Required Score:</strong> Above 50%</p>
                </div>
                
                <p>Your challenge did not meet the minimum similarity threshold of 50%. The photos were determined to be too different to proceed with a super admin review.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px;">CivicPulse - Smart City Issue Reporting</p>
            </div>
        `
    },
    
    challenge_reviewed: {
        subject: 'CivicPulse - Challenge Review Complete',
        getHtml: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${data.decision === 'admin_wrong' ? '#10b981' : '#3b82f6'};">
                    Challenge Review Complete
                </h2>
                <p>A super admin has reviewed your challenge and made a final decision.</p>
                
                <div style="background-color: ${data.decision === 'admin_wrong' ? '#d1fae5' : '#dbeafe'}; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${data.decision === 'admin_wrong' ? '#10b981' : '#3b82f6'};">
                    <h3 style="margin-top: 0; color: #1f2937;">Review Decision</h3>
                    <p><strong>Issue:</strong> ${data.issueTitle}</p>
                    <p><strong>Decision:</strong> ${data.decision === 'admin_wrong' ? 'Admin Was Wrong - Issue Restored' : 'Admin Was Correct - Decision Upheld'}</p>
                    <p><strong>Similarity Score:</strong> ${data.similarityScore}%</p>
                    <p><strong>Reviewed:</strong> ${new Date(data.reviewedAt).toLocaleString()}</p>
                    ${data.reviewNotes ? `<p><strong>Notes:</strong> ${data.reviewNotes}</p>` : ''}
                </div>
                
                ${data.decision === 'admin_wrong' 
                    ? '<p style="color: #059669; font-weight: bold;">✓ Your issue has been restored to its original state. Thank you for helping maintain platform integrity.</p>'
                    : '<p>The original admin decision has been upheld after review. Thank you for your participation in the challenge process.</p>'
                }
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px;">CivicPulse - Smart City Issue Reporting</p>
            </div>
        `
    }
};

/**
 * Send a challenge notification email
 * 
 * @param {string} email - Recipient email address
 * @param {string} notificationType - Type of notification (challenge_accepted, challenge_rejected, challenge_reviewed)
 * @param {object} data - Dynamic data for the notification template
 * @returns {Promise<object>} - Resend API response
 */
export const sendChallengeNotification = async (email, notificationType, data) => {
    try {
        // Validate notification type
        if (!notificationTemplates[notificationType]) {
            throw new Error(`Invalid notification type: ${notificationType}`);
        }

        const template = notificationTemplates[notificationType];
        const resendClient = getResendClient();
        
        const { data: emailData, error } = await resendClient.emails.send({
            from: 'CivicPulse <onboarding@resend.dev>',
            to: [email],
            subject: template.subject,
            html: template.getHtml(data)
        });

        if (error) {
            throw error;
        }

        console.log(`✅ Challenge notification sent (${notificationType}):`, emailData);
        return emailData;
    } catch (error) {
        console.error(`❌ Failed to send challenge notification (${notificationType}):`, error);
        throw error;
    }
};

/**
 * Helper function to format rejection reason for display
 * 
 * @param {string} rejectionReason - Raw rejection reason from database
 * @returns {string} - Human-readable rejection reason
 */
export const formatRejectionReason = (rejectionReason) => {
    const reasonMap = {
        'location_too_far': 'You were too far from the issue location',
        'low_similarity': 'Photo similarity score below threshold',
        'invalid_photo': 'Invalid or corrupted photo'
    };
    
    return reasonMap[rejectionReason] || 'Challenge did not meet requirements';
};
