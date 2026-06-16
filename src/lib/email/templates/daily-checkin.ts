export function dailyCheckinEmail({ name, appUrl }: { name: string; appUrl: string }) {
  const greetings = [
    "Hey gorgeous,",
    "Hey love,",
    "Hey beautiful,",
    "Hi there,",
  ];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  const prompts = [
    "What's one thing that would make today feel like a win?",
    "What does your body need most today?",
    "What's the one thing only YOU can do today?",
    "If today were easy, what would you get done?",
    "What can you let go of today?",
  ];
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  const firstName = name?.split(" ")[0] || "friend";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Your daily check-in 🌸</title>
</head>
<body style="margin:0;padding:0;background:#fff1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff1f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <span style="font-size:28px;">🌸</span>
              <p style="margin:8px 0 0;font-size:13px;color:#be185d;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Softlivi</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;padding:36px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a0a10;">${greeting}</p>
              <p style="margin:0 0 24px;font-size:15px;color:#78716c;">Time for your daily check-in, ${firstName} ✨</p>

              <!-- Prompt box -->
              <div style="background:#fff1f5;border-left:3px solid #f43f5e;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px;">
                <p style="margin:0;font-size:15px;font-style:italic;color:#44403c;line-height:1.5;">"${prompt}"</p>
              </div>

              <p style="margin:0 0 24px;font-size:14px;color:#78716c;line-height:1.6;">
                Open your planner, take a breath, and spend just 5 minutes setting your intention. You don't have to do everything — just the next right thing.
              </p>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${appUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#f43f5e,#ec4899);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;">
                  Open my planner →
                </a>
              </div>

              <p style="margin:0;font-size:13px;color:#a8a29e;text-align:center;">
                You're doing better than you think 🌿
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#a8a29e;">
                You're receiving this because you set up a daily check-in in Softlivi.
              </p>
              <p style="margin:0;font-size:12px;color:#a8a29e;">
                <a href="${appUrl}/settings" style="color:#f43f5e;text-decoration:none;">Change notification time</a>
                &nbsp;·&nbsp;
                <a href="${appUrl}/settings" style="color:#f43f5e;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${greeting}

Time for your daily check-in, ${firstName} ✨

"${prompt}"

Open your planner and spend just 5 minutes setting your intention for the day.

Open my planner: ${appUrl}/dashboard

You're doing better than you think 🌿

---
Change notification settings: ${appUrl}/settings`;

  return { html, text, subject: `Your daily check-in 🌸` };
}
