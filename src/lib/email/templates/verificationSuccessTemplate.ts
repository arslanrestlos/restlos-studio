// lib/email/templates/verificationSuccessTemplate.ts
import { getBaseEmailTemplate, EmailTemplateData } from '../baseTemplate';

export const getVerificationSuccessTemplate = (data: EmailTemplateData) => {
  const content = `
    <div class="header">
      <div class="header-content">
        <div class="logo">✅ Arslan Studio</div>
        <h1 class="header-title">E-Mail erfolgreich bestätigt!</h1>
        <p class="header-subtitle">Dein Account ist fast bereit</p>
      </div>
    </div>
    
    <div class="content">
      <div class="greeting">Perfekt, ${data.firstName}! 🎉</div>
      
      <div class="intro">
        Deine E-Mail-Adresse wurde erfolgreich bestätigt. Du bist nur noch einen Schritt von deinem vollständig aktivierten Arslan Studio Account entfernt.
      </div>
      
      <div class="success">
        <div class="success-title">✨ E-Mail-Verifizierung abgeschlossen</div>
        <div class="success-text">
          Deine E-Mail-Adresse <strong>${data.email}</strong> ist jetzt verifiziert und dein Account-Profil ist vollständig.
        </div>
      </div>
      
      <div class="card">
        <div class="card-title">🚀 Was passiert jetzt?</div>
        <div class="card-content">
          <ul class="steps-list">
            <li class="step-item">
              <span class="step-number">1</span>
              <span class="step-text"><strong>Account-Prüfung:</strong> Dein Account wird von unserem Team sorgfältig geprüft und verifiziert</span>
            </li>
            <li class="step-item">
              <span class="step-number">2</span>
              <span class="step-text"><strong>Freischaltung:</strong> Du erhältst eine weitere E-Mail, sobald dein Account vollständig aktiviert wurde</span>
            </li>
            <li class="step-item">
              <span class="step-number">3</span>
              <span class="step-text"><strong>Login möglich:</strong> Danach kannst du dich mit deinen Anmeldedaten einloggen und alle Features nutzen</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="info">
        <div class="info-title">⏰ Wie lange dauert die Prüfung?</div>
        <div class="info-text">
          Normalerweise dauert die Account-Prüfung 1-2 Werktage. In seltenen Fällen kann es etwas länger dauern. Wir melden uns auf jeden Fall bei dir!
        </div>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <p style="color: #4b5563; margin-bottom: 16px;">Vielen Dank für deine Geduld!</p>
        <p style="color: #1f2937; font-weight: 600; font-size: 16px;">Das Arslan Studio Team</p>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        Fragen? <a href="mailto:support@arslanstudio.de" class="footer-link">support@arslanstudio.de</a><br>
        © ${new Date().getFullYear()} Arslan Studio. Alle Rechte vorbehalten.
      </div>
    </div>
  `;

  const textContent = `
Hallo ${data.firstName}!

Perfekt! Deine E-Mail-Adresse wurde erfolgreich bestätigt.

Was passiert jetzt?
1. Account-Prüfung: Dein Account wird von unserem Team geprüft
2. Freischaltung: Du erhältst eine E-Mail sobald er aktiviert ist
3. Login möglich: Danach kannst du dich anmelden

Die Prüfung dauert normalerweise 1-2 Werktage.

Vielen Dank für deine Geduld!
Das Arslan Studio Team

Support: support@arslanstudio.de
  `.trim();

  return {
    html: getBaseEmailTemplate(content, 'E-Mail erfolgreich bestätigt'),
    text: textContent,
    subject: '✅ E-Mail-Bestätigung erfolgreich!',
  };
};
