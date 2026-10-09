// src/lib/email.ts — the mail sender the cron job talks to.
//
// The demo has no mail provider wired up, so `send` only logs. That is on
// purpose: the point of the exercise is the *scheduling*, not the SMTP.
//
// Two things about the shape:
//
//   1. It is an object with a method, not a bare exported function. That lets
//      a test do `vi.spyOn(mailer, "send")` and assert on the calls without
//      mocking the whole module. Spying on a plain function export does not
//      work — ES module bindings are read only.
//   2. `send` is async and returns a `Result`-ish boolean. A real provider is
//      a network call that can fail, and the job has to keep going for the
//      remaining recipients when one address bounces.
//
// Swapping in a real provider means replacing the body of `send`, nothing
// else. Cloudflare gives you two options:
//   - Email Routing's `send_email` binding, for addresses you have verified
//   - an HTTP API such as Resend or Postmark, with the API key in
//     `wrangler secret put`

export type EmailMessage = {
  to: string;
  subject: string;
  body: string;
};

export const mailer = {
  /**
   * "Sends" an e-mail. Returns false instead of throwing, so one bad address
   * does not abort the whole batch.
   */
  async send(message: EmailMessage): Promise<boolean> {
    // A real implementation would go here. For example, with Resend:
    //
    //   const response = await fetch("https://api.resend.com/emails", {
    //     method: "POST",
    //     headers: {
    //       Authorization: `Bearer ${env.RESEND_API_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       from: "oppgaver@example.com",
    //       to: message.to,
    //       subject: message.subject,
    //       text: message.body,
    //     }),
    //   });
    //   return response.ok;

    console.log(`[email] -> ${message.to}: ${message.subject}`);
    return true;
  },
};
