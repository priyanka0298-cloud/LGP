export function weeklyCheckinEmail({ name, appUrl }: { name: string; appUrl: string }) {
  const firstName = name?.split(" ")[0] || "friend";

  const intentions = [
    "What does a good week look like for you?",
    "What's one thing you want to feel proud of by Friday?",
    "What would make this week feel easy and full?",
    "If this week had a theme, what would it be?",
    "What does your body and mind need most this week?",
  ];
  const intention = intentions[Math.floor(Math.random() * intentions.length)];

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>New week, fresh start 🌿</title>
</head>
<body style="margin:0;padding:0;background:#fff1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff1f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <span style="font-size:28px;">🌿</span>
              <p style="margin:8px 0 0;font-size:13px;color:#be185d;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Lazy Girl Planner</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;padding:36px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#f43f5e;text-transform:uppercase;letter-spacing:0.06em;">New week</p>
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a0a10;">Happy Monday, ${firstName} ✨</p>
              <p style="margin:0 0 24px;font-size:15px;color:#78716c;">A fresh week means a fresh start. No baggage from last week — just possibility.</p>

              <!-- Intention prompt -->
              <div style="background:#fff1f5;border-radius:16px;padding:20px;margin-bottom:28px;text-align:center;">
                <p style="margin:0 0 8px;font-size:13px;color:#be185d;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">This week's question</p>
                <p style="margin:0;font-size:16px;font-style:italic;color:#44403c;line-height:1.5;">"${intention}"</p>
              </div>

              <!-- 3 prompts -->
              <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#1a0a10;">Spend 5 minutes on these:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #fce7f3;">
                    <span style="font-size:16px;">🎯</span>
                    <span style="font-size:14px;color:#44403c;margin-left:10px;">Set your 3 big things for the week</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #fce7f3;">
                    <span style="font-size:16px;">🌿</span>
                    <span style="font-size:14px;color:#44403c;margin-left:10px;">Check in on your habits — which one needs love?</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:16px;">💆</span>
                    <span style="font-size:14px;color:#44403c;margin-left:10px;">Schedule one thing just for you</span>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${appUrl}/planner" style="display:inline-block;background:linear-gradient(135deg,#f43f5e,#ec4899);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;">
                  Plan my week →
                </a>
              </div>

              <p style="margin:0;font-size:13px;color:#a8a29e;text-align:center;">
                You don't have to do it all. Just start. 🌸
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#a8a29e;">
                You're receiving this because you set up weekly check-ins in Lazy Girl Planner.
              </p>
              <p style="margin:0;font-size:12px;color:#a8a29e;">
                <a href="${appUrl}/settings" style="color:#f43f5e;text-decoration:none;">Change notification settings</a>
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

  const text = `Happy Monday, ${firstName} ✨

A fresh week means a fresh start.

"${intention}"

This week, spend 5 minutes on:
🎯 Set your 3 big things for the week
🌿 Check in on your habits — which one needs love?
💆 Schedule one thing just for you

Plan my week: ${appUrl}/planner

You don't have to do it all. Just start. 🌸

---
Change notification settings: ${appUrl}/settings`;

  return { html, text, subject: "New week, fresh start 🌿" };
}
