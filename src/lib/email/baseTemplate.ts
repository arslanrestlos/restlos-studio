// lib/email/baseTemplate.ts
export interface EmailTemplateData {
  firstName: string;
  lastName?: string;
  email: string;
  [key: string]: any;
}

export const getBaseEmailTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title} - Arslan Studio</title>
  <style>
    /* Reset und Base Styles */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6; 
      color: #1f2937; 
      background-color: #f8fafc;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    /* Container */
    .email-wrapper { 
      background-color: #f8fafc; 
      padding: 40px 20px; 
      min-height: 100vh;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    /* Header */
    .header { 
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
      position: relative;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)" /></svg>');
    }
    .header-content { position: relative; z-index: 1; }
    .logo { 
      font-size: 28px; 
      font-weight: 700; 
      margin-bottom: 12px;
      letter-spacing: -0.025em;
    }
    .header-title { 
      font-size: 24px; 
      font-weight: 600; 
      margin: 0;
      opacity: 0.95;
    }
    .header-subtitle { 
      font-size: 16px; 
      margin: 8px 0 0 0; 
      opacity: 0.8;
    }
    
    /* Content */
    .content { 
      padding: 40px 30px; 
    }
    .greeting { 
      font-size: 20px; 
      font-weight: 600; 
      color: #1f2937; 
      margin-bottom: 24px;
    }
    .intro { 
      font-size: 16px; 
      color: #4b5563; 
      margin-bottom: 32px; 
      line-height: 1.7;
    }
    
    /* Cards und Boxen */
    .card { 
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border-radius: 12px; 
      padding: 32px; 
      margin: 32px 0;
      border: 1px solid #e2e8f0;
      position: relative;
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #1f2937 0%, #374151 100%);
      border-radius: 12px 12px 0 0;
    }
    .card-title { 
      font-size: 18px; 
      font-weight: 600; 
      color: #1f2937; 
      margin-bottom: 16px;
      display: flex;
      align-items: center;
    }
    .card-content { 
      color: #4b5563; 
      font-size: 15px; 
      line-height: 1.6;
    }
    
    /* OTP Spezifisch */
    .otp-container { 
      text-align: center;
      background: white;
      border-radius: 16px;
      padding: 32px;
      margin: 32px 0;
      border: 2px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .otp-label { 
      font-size: 14px; 
      color: #64748b; 
      margin-bottom: 16px;
      font-weight: 500;
    }
    .otp-code { 
      font-size: 42px; 
      font-weight: 700; 
      color: #1f2937; 
      letter-spacing: 12px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      background: #f8fafc;
      padding: 24px 32px;
      border-radius: 12px;
      border: 2px solid #cbd5e1;
      display: inline-block;
      margin: 12px 0;
      text-align: center;
      min-width: 240px;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    }
    .otp-info { 
      font-size: 14px; 
      color: #64748b; 
      margin-top: 16px;
      line-height: 1.5;
    }
    
    /* Listen */
    .steps-list { 
      list-style: none; 
      padding: 0; 
      margin: 20px 0;
    }
    .step-item { 
      display: flex; 
      align-items: flex-start; 
      margin-bottom: 16px; 
      font-size: 15px; 
      color: #374151;
    }
    .step-number { 
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      color: white; 
      border-radius: 50%; 
      width: 28px; 
      height: 28px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 13px; 
      font-weight: 600; 
      margin-right: 16px; 
      flex-shrink: 0;
      margin-top: 2px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .step-text { 
      flex: 1; 
      line-height: 1.6; 
      padding-top: 4px;
    }
    
    /* Buttons */
    .button { 
      display: inline-block; 
      padding: 16px 32px; 
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      color: white; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 24px 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
    }
    .button:hover {
      background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
    
    /* Warnungen und Hinweise */
    .warning { 
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      border: 1px solid #f59e0b; 
      border-radius: 12px; 
      padding: 20px; 
      margin: 24px 0;
    }
    .warning-title { 
      font-weight: 600; 
      color: #92400e; 
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      font-size: 15px;
    }
    .warning-text { 
      color: #a16207; 
      font-size: 14px; 
      line-height: 1.5;
    }
    
    .success { 
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #10b981; 
      border-radius: 12px; 
      padding: 20px; 
      margin: 24px 0;
    }
    .success-title { 
      font-weight: 600; 
      color: #065f46; 
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      font-size: 15px;
    }
    .success-text { 
      color: #047857; 
      font-size: 14px; 
      line-height: 1.5;
    }
    
    .info { 
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid #3b82f6; 
      border-radius: 12px; 
      padding: 20px; 
      margin: 24px 0;
    }
    .info-title { 
      font-weight: 600; 
      color: #1e40af; 
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      font-size: 15px;
    }
    .info-text { 
      color: #1d4ed8; 
      font-size: 14px; 
      line-height: 1.5;
    }
    
    /* Footer */
    .footer { 
      background: #f8fafc; 
      padding: 32px 30px; 
      text-align: center; 
      border-top: 1px solid #e2e8f0;
    }
    .footer-text { 
      color: #64748b; 
      font-size: 13px; 
      line-height: 1.6;
    }
    .footer-link {
      color: #1f2937;
      text-decoration: none;
      font-weight: 500;
    }
    .footer-link:hover {
      text-decoration: underline;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 20px 10px; }
      .header { padding: 30px 20px; }
      .content { padding: 30px 20px; }
      .footer { padding: 24px 20px; }
      .logo { font-size: 24px; }
      .header-title { font-size: 20px; }
      .greeting { font-size: 18px; }
      .otp-code { 
        font-size: 32px; 
        letter-spacing: 8px;
        min-width: 200px;
        padding: 20px 24px;
      }
      .card { padding: 24px; margin: 24px 0; }
    }
    
    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .email-container { border: 1px solid #374151; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${content}
    </div>
  </div>
</body>
</html>
`;
