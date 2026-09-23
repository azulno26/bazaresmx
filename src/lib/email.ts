export async function sendEmail({ to, bcc, subject, html }: { to: string; bcc?: string; subject: string; html: string }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("Missing RESEND_API_KEY");
    return { error: "Missing RESEND_API_KEY" };
  }

  try {
    const payload: any = {
      from: 'BazaresMX <contacto@bazaresmx.com.mx>',
      to: [to],
      subject: subject,
      html: html
    };
    if (bcc) {
      payload.bcc = [bcc];
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Failed to send email:", err);
      return { error: err };
    }
    
    return { ok: true };
  } catch (err: any) {
    console.error("Exception in sendEmail:", err);
    return { error: err.message };
  }
}
