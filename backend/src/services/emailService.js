/**
 * SafeCircle Backend Email Service
 * 
 * Supports configurable providers:
 * - Resend (REST API)
 * - SendGrid (REST API)
 * - Console Fallback (Local / Testing / Offline demo mode)
 * 
 * Never expose provider API keys in client-side applications.
 */

class EmailService {
  constructor() {
    this.provider = (process.env.EMAIL_PROVIDER || 'console').toLowerCase();
    this.apiKey = process.env.EMAIL_PROVIDER_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'SafeCircle Security <security@safecircle.app>';
  }

  /**
   * Dispatches a 6-digit verification code to the recipient email
   */
  async sendOtpEmail(email, otp, purpose = 'REGISTER') {
    const subjectMap = {
      REGISTER: 'Your SafeCircle Registration Verification Code',
      LOGIN: 'Your SafeCircle Login Security Code',
      FORGOT_PASSWORD: 'Your SafeCircle Password Reset Code'
    };

    const subject = subjectMap[purpose] || 'Your SafeCircle Security Verification Code';
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #fcf8f8; border-radius: 16px; border: 1px solid #fecdd3;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #e11d48, #f43f5e); border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 20px;">
            🛡️
          </div>
          <h2 style="color: #1c1917; margin: 12px 0 4px; font-size: 22px; font-weight: 800;">SafeCircle</h2>
          <p style="color: #e11d48; margin: 0; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase;">Privacy · Protection · Control</p>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f5e6e8; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <p style="color: #44403c; font-size: 14px; margin-top: 0;">Use the following one-time code to complete your verification:</p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #e11d48; padding: 16px 0; font-family: monospace;">
            ${otp}
          </div>
          <p style="color: #78716c; font-size: 12px; margin-bottom: 0;">
            This security code will expire in <strong>10 minutes</strong>.<br />
            If you did not request this verification, please disregard this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #a8a29e; font-size: 11px;">
          SafeCircle Privacy-First Emergency Protection System<br />
          The user controls who can see what.
        </div>
      </div>
    `;

    // 1. Resend Provider
    if (this.provider === 'resend' && this.apiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: email,
            subject,
            html: htmlContent
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to dispatch via Resend');
        }
        return { success: true, provider: 'resend', id: data.id };
      } catch (err) {
        console.error('[EmailService] Resend dispatch failed, falling back to console:', err.message);
      }
    }

    // 2. SendGrid Provider
    if (this.provider === 'sendgrid' && this.apiKey) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: this.fromEmail.includes('<') ? this.fromEmail.match(/<([^>]+)>/)[1] : this.fromEmail },
            subject,
            content: [{ type: 'text/html', value: htmlContent }]
          })
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`SendGrid returned ${response.status}: ${errText}`);
        }
        return { success: true, provider: 'sendgrid' };
      } catch (err) {
        console.error('[EmailService] SendGrid dispatch failed, falling back to console:', err.message);
      }
    }

    // 3. Fallback / Console / Local dev mode
    console.log('\n======================================================');
    console.log(`[SafeCircle Email] OTP for ${email} (${purpose}):`);
    console.log(`>>> SECURITY CODE: ${otp} <<<`);
    console.log(`[Expires in 10 minutes | Provider: ${this.provider}]`);
    console.log('======================================================\n');

    return {
      success: true,
      provider: 'console',
      message: 'OTP logged to server console (Development Mode)'
    };
  }
}

module.exports = new EmailService();
