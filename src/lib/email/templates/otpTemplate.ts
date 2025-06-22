// lib/email/templates/otpTemplate.ts
import { getBaseEmailTemplate, EmailTemplateData } from '../baseTemplate';

interface OTPTemplateData extends EmailTemplateData {
  otp: string;
}

export const getOTPTemplate = (data: OTPTemplateData) => {
  const content = `
    <div class="header">
      <div class="header-content">
        <div class="logo">🔐 Arslan Studio</div>
        <h1 class="header-title">E-Mail-Bestätigung</h1>
        <p class="header-subtitle">Dein Bestätigungscode ist da</p>
      </div>
    </div>
    
    <div class="content">
      <div class="greeting">Hallo ${data.firstName}! 👋</div>
      
      <div class="intro">
        Vielen Dank für deine Registrierung bei <strong>Arslan Studio</strong>. Um deinen Account zu aktivieren, gib bitte den folgenden Bestätigungscode auf unserer Website ein:
      </div>
      
      <div class="otp-container">
        <div class="otp-label">Dein Bestätigungscode:</div>
        <div class="otp-code">${data.otp}</div>
        <div class="otp-info">
          ⏱️ Dieser Code ist <strong>15 Minuten</strong> gültig<br>
          🔗 Gib ihn auf der Bestätigungsseite ein
        </div>
      </div>
      
      <div class="card">
        <div class="card-title">📋 Was passiert als nächstes?</div>
        <div class="card-content">
          <ul class="steps-list">
            <li class="step-item">
              <span class="step-number">1</span>
              <span class="step-text">Gib den obigen Code auf der Bestätigungsseite ein</span>
            </li>
            <li class="step-item">
              <span class="step-number">2</span>
              <span class="step-text">Deine E-Mail-Adresse wird verifiziert</span>
            </li>
            <li class="step-item">
              <span class="step-number">3</span>
              <span class="step-text">Dein Account wird von unserem Team geprüft</span>
            </li>
            <li class="step-item">
              <span class="step-number">4</span>
              <span class="step-text">Du erhältst eine E-Mail, sobald alles freigeschaltet ist</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="warning">
        <div class="warning-title">⚠️ Wichtiger Sicherheitshinweis</div>
        <div class="warning-text">
          Falls du dich nicht bei Arslan Studio registriert hast, ignoriere diese E-Mail einfach. Der Code läuft automatisch ab und es werden keine weiteren Aktionen unternommen.
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        Bei Problemen oder Fragen? <a href="mailto:support@arslanstudio.de" class="footer-link">Kontaktiere unseren Support</a><br>
        © ${new Date().getFullYear()} Arslan Studio. Alle Rechte vorbehalten.
      </div>
    </div>
  `;

  const textContent = `
Hallo ${data.firstName}!

Vielen Dank für deine Registrierung bei Arslan Studio.

DEIN BESTÄTIGUNGSCODE: ${data.otp}

Dieser Code ist 15 Minuten gültig. Gib ihn auf der Bestätigungsseite ein, um deine E-Mail-Adresse zu verifizieren.

Was passiert als nächstes?
1. Code eingeben und E-Mail verifizieren
2. Account wird von unserem Team geprüft  
3. Du erhältst eine E-Mail bei Freischaltung

Falls du dich nicht registriert hast, ignoriere diese E-Mail.

Das Arslan Studio Team
Support: support@arslanstudio.de
  `.trim();

  return {
    html: getBaseEmailTemplate(content, 'E-Mail-Bestätigung'),
    text: textContent,
    subject: `🔐 Dein Bestätigungscode: ${data.otp}`,
  };
};
