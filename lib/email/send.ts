import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.RESEND_FROM_EMAIL || "ClimaTech <noreply@climatech.app>";

  const { data, error } = await getResend().emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
  return data;
}
