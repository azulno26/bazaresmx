import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

function emailInfoBox(contentHtml, borderColor = '#E2E8E2', bgColor = '#F5F7F5') {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 12px; margin: 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <tr>
        <td style="padding: 18px 20px; font-size: 14px; line-height: 1.6; color: #2C2C2A;">
          ${contentHtml}
        </td>
      </tr>
    </table>
  `;
}

function emailTemplate({ title, greeting, bodyHtml, ctaText, ctaUrl }) {
  const ctaButtonHtml = ctaText && ctaUrl
    ? `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 16px 0;">
        <tr>
          <td align="center">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaUrl}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="18%" stroke="f" fillcolor="#E8621A">
              <w:anchorlock/>
              <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">${ctaText}</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a href="${ctaUrl}" target="_blank" style="background-color: #E8621A; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(232, 98, 26, 0.25); text-align: center;">
              ${ctaText}
            </a>
            <!--<![endif]-->
          </td>
        </tr>
      </table>
    `
    : '';

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #F4F6F4;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
      max-width: 100%;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      padding: 0;
    }
    a {
      color: #1A7A52;
      text-decoration: underline;
    }
    .info-box {
      background-color: #F5F7F5;
      border: 1px solid #E2E8E2;
      border-radius: 12px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    @media only screen and (max-width: 620px) {
      .container-table {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content-padding {
        padding: 24px 20px !important;
      }
      .header-padding {
        padding: 28px 20px !important;
      }
      .footer-padding {
        padding: 28px 20px !important;
      }
      .headline-text {
        font-size: 22px !important;
        line-height: 28px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F6F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C2C2A;">
  <div style="display: none; font-size: 1px; color: #F4F6F4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${title} · BazaresMX
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F6F4; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px 40px 12px;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="container-table" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #E5EAE5;">
          
          <!-- HEADER -->
          <tr>
            <td align="center" class="header-padding" style="background-color: #1A7A52; padding: 32px 30px; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://www.bazaresmx.com.mx" target="_blank" style="text-decoration: none;">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                        Bazares<span style="color: #99E2C2;">MX</span>
                      </span>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 6px;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #D8F3E5; text-transform: uppercase; letter-spacing: 1px;">
                      Donde Crece tu Negocio
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td class="content-padding" style="padding: 36px 36px 28px 36px; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #2C2C2A;">
              
              ${greeting ? `
              <h1 class="headline-text" style="margin: 0 0 20px 0; font-size: 24px; line-height: 30px; font-weight: 800; color: #1A7A52;">
                ${greeting}
              </h1>` : ''}

              <div style="font-size: 15px; line-height: 1.6; color: #2C2C2A;">
                ${bodyHtml}
              </div>

              ${ctaButtonHtml}

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer-padding" style="background-color: #124B35; padding: 32px 30px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                
                <tr>
                  <td align="center" style="font-size: 15px; font-weight: 700; color: #FFFFFF; padding-bottom: 8px;">
                    BazaresMX — <a href="https://www.bazaresmx.com.mx" target="_blank" style="color: #99E2C2; text-decoration: none; font-weight: bold;">bazaresmx.com.mx</a>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="font-size: 12px; color: #B3D8C8; padding-bottom: 16px;">
                    El directorio digital de bazares y marcas locales en México
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 10px;">
                          <a href="https://www.instagram.com/bazaresmx.com.mx/" target="_blank" style="color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; background-color: rgba(255,255,255,0.12); padding: 6px 14px; border-radius: 20px; display: inline-block;">
                            📷 Instagram
                          </a>
                        </td>
                        <td style="padding: 0 10px;">
                          <a href="https://www.facebook.com/bazaresmx" target="_blank" style="color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; background-color: rgba(255,255,255,0.12); padding: 6px 14px; border-radius: 20px; display: inline-block;">
                            📘 Facebook
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="border-top: 1px solid rgba(255, 255, 255, 0.12); padding-top: 16px; font-size: 12px; color: #A0C8B6;">
                    <a href="https://www.bazaresmx.com.mx/terminos-y-condiciones" target="_blank" style="color: #D8F3E5; text-decoration: underline;">Términos y Condiciones</a>
                    &nbsp;·&nbsp;
                    <a href="https://www.bazaresmx.com.mx/aviso-de-privacidad" target="_blank" style="color: #D8F3E5; text-decoration: underline;">Aviso de Privacidad</a>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-top: 12px; font-size: 11px; color: #7CAE99;">
                    © 2026 BazaresMX. Todos los derechos reservados.
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

async function sendTest() {
  const nombreNegocio = 'Joyería Luna Artesanal';
  const nombreCompleto = 'Diego Castellanos';
  const planDisplay = 'Plan Medio (Catálogo + Destacado)';
  const montoACobrar = '$199 MXN/mes';
  const clabeVal = process.env.CLABE || '044180256056780253';
  const titularVal = process.env.TITULAR || 'Diego Castellanos Maya';
  const slug = 'joyeria-luna-artesanal-cdmx';

  const customerInstructionsHtml = `
    <h3 style="font-size: 16px; color: #1A7A52; margin: 24px 0 8px 0;">💳 Pasos para activar tu perfil público:</h3>
    <p style="margin-top: 0;">Para completar la activación de tu marca y catálogo en BazaresMX, realiza tu transferencia interbancaria (SPEI):</p>
    
    ${emailInfoBox(`
      <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
        <tr><td width="35%" style="color: #666; font-weight: bold;">Monto a pagar:</td><td><strong style="color: #E8621A; font-size: 16px;">${montoACobrar}</strong></td></tr>
        <tr><td style="color: #666; font-weight: bold;">Banco:</td><td><strong>Scotiabank</strong></td></tr>
        <tr><td style="color: #666; font-weight: bold;">CLABE:</td><td><code style="background-color: #E8EFEA; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1A7A52;">${clabeVal}</code></td></tr>
        <tr><td style="color: #666; font-weight: bold;">Titular:</td><td><strong>${titularVal}</strong></td></tr>
        <tr><td style="color: #666; font-weight: bold;">Concepto:</td><td>${nombreNegocio} + Plan Medio</td></tr>
        <tr><td style="color: #666; font-weight: bold;">Enviar comprobante:</td><td><a href="mailto:contacto@bazaresmx.com.mx" style="color: #1A7A52; font-weight: bold;">contacto@bazaresmx.com.mx</a></td></tr>
      </table>
    `, '#D2E8DC', '#F0F8F4')}
  `;

  const html = emailTemplate({
    title: `¡Bienvenido a BazaresMX, ${nombreNegocio}!`,
    greeting: `¡Gracias por unirte a BazaresMX, ${nombreCompleto}! 🎉`,
    bodyHtml: `
      <p style="margin-top: 0; font-size: 16px;">
        Hemos recibido con éxito el registro de tu marca <strong>${nombreNegocio}</strong> en el plan <strong>${planDisplay}</strong>.
      </p>

      ${emailInfoBox(`
        <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
          <tr><td width="40%" style="color: #666; font-weight: bold;">Marca:</td><td style="font-weight: bold; color: #111;">${nombreNegocio}</td></tr>
          <tr><td style="color: #666; font-weight: bold;">Plan:</td><td><strong style="color: #1A7A52;">${planDisplay}</strong></td></tr>
          <tr><td style="color: #666; font-weight: bold;">Enlace reservado:</td><td><a href="https://www.bazaresmx.com.mx/expositores/${slug}" target="_blank" style="color: #1A7A52; font-weight: bold;">bazaresmx.com.mx/expositores/${slug}</a></td></tr>
          <tr><td style="color: #666; font-weight: bold;">Estatus actual:</td><td><strong>⏳ Pendiente de validación de pago</strong></td></tr>
        </table>
      `)}

      ${customerInstructionsHtml}

      <p style="margin-top: 20px;">
        Pronto nos pondremos en contacto contigo vía WhatsApp para validar los últimos detalles y publicar tu catálogo ante cientos de organizadores de bazares en México.
      </p>

      <p style="margin-top: 24px; color: #555;">
        Atentamente,<br/>
        <strong style="color: #1A7A52;">El equipo de BazaresMX</strong>
      </p>
    `,
    ctaText: 'Ver Directorio de Bazares',
    ctaUrl: 'https://www.bazaresmx.com.mx'
  });

  console.log('Sending test email to azulno26@hotmail.com...');
  const result = await resend.emails.send({
    from: 'contacto@bazaresmx.com.mx',
    to: 'azulno26@hotmail.com',
    subject: `¡Bienvenido a BazaresMX, ${nombreNegocio}! (Correo de Prueba)`,
    html: html
  });

  console.log('Result:', result);
}

sendTest().catch(console.error);
