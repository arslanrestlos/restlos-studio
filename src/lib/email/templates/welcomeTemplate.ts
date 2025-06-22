// lib/email/templates/welcomeTemplate.ts
import { getBaseEmailTemplate, EmailTemplateData } from '../baseTemplate';

export const getWelcomeTemplate = (data: EmailTemplateData) => {
  const content = `
    <div class="header">
      <div class="header-content">
        <div class="logo">🎉 Arslan Studio</div>
        <h1 class="header-title">Willkommen in unserem Team!</h1>
        <p class="header-subtitle">Dein Account ist jetzt aktiv</p>
      </div>
    </div>
    
    <div class="content">
      <div class="greeting">Hallo ${data.firstName} ${data.lastName || ''}! 🎨</div>
      
      <div class="intro">
        Herzlich willkommen bei <strong>Arslan Studio</strong>! Wir freuen uns sehr, dass du jetzt Teil unserer Community bist. Dein Account wurde erfolgreich freigeschaltet und du kannst jetzt alle Features nutzen.
      </div>
      
      <div class="success">
        <div class="success-title">🎯 Account erfolgreich aktiviert</div>
        <div class="success-text">
          Dein Arslan Studio Account ist jetzt vollständig eingerichtet und einsatzbereit. Du kannst dich jederzeit mit deinen Anmeldedaten einloggen.
        </div>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'https://arslanstudio.de'}/login" class="button">
          🚀 Jetzt einloggen
        </a>
      </div>
      
      <div class="card">
        <div class="card-title">✨ Was kannst du jetzt tun?</div>
        <div class="card-content">
          <ul class="steps-list">
            <li class="step-item">
              <span class="step-number">1</span>
              <span class="step-text"><strong>Profil vervollständigen:</strong> Füge weitere Informationen zu deinem Profil hinzu</span>
            </li>
            <li class="step-item">
              <span class="step-number">2</span>
              <span class="step-text"><strong>Features erkunden:</strong> Entdecke alle verfügbaren Tools und Funktionen</span>
            </li>
            <li class="step-item">
              <span class="step-number">3</span>
              <span class="step-text"><strong>Support kontaktieren:</strong> Bei Fragen stehen wir dir gerne zur Verfügung</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="info">
        <div class="info-title">💬 Hilfe benötigt?</div>
        <div class="info-text">
          Unser Support-Team ist gerne für dich da! Du kannst jederzeit auf diese E-Mail antworten oder uns direkt kontaktieren. Wir antworten in der Regel innerhalb von 24 Stunden.
        </div>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <p style="color: #4b5563; margin-bottom: 8px;">Beste Grüße</p>
        <p style="color: #1f2937; font-weight: 600; font-size: 16px;">Das Arslan Studio Team</p>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Wir freuen uns auf die Zusammenarbeit! 🤝</p>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        Diese E-Mail wurde automatisch generiert.<br>
        © ${new Date().getFullYear()} Arslan Studio. Alle Rechte vorbehalten.<br>
        <a href="mailto:support@arslanstudio.de" class="footer-link">support@arslanstudio.de</a>
      </div>
    </div>
  `;

  const textContent = `
Hallo ${data.firstName} ${data.lastName || ''}!

Herzlich willkommen bei Arslan Studio! 

Dein Account wurde erfolgreich freigeschaltet und du kannst jetzt alle Features nutzen.

Was kannst du jetzt tun?
1. Profil vervollständigen
2. Features erkunden  
3. Bei Fragen den Support kontaktieren

Login: ${process.env.NEXTAUTH_URL || 'https://arslanstudio.de'}/login

Bei Fragen einfach auf diese E-Mail antworten!

Das Arslan Studio Team
Wir freuen uns auf die Zusammenarbeit!

---
© ${new Date().getFullYear()} Arslan Studio. Alle Rechte vorbehalten.
  `.trim();

  return {
    html: getBaseEmailTemplate(content, 'Willkommen bei Arslan Studio'),
    text: textContent,
    subject: '🎉 Willkommen bei Arslan Studio - Account aktiviert!',
  };
};
