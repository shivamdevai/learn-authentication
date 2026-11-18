export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPHtml = (otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table
                width="500"
                cellpadding="0"
                cellspacing="0"
                style="background: #ffffff; border-radius: 8px; padding: 40px;"
              >
                <tr>
                  <td align="center">
                    <h2 style="margin: 0; color: #333;">
                      Verify Your Email
                    </h2>

                    <p style="margin: 20px 0; color: #555; font-size: 16px;">
                      Use the OTP below to verify your email address.
                    </p>

                    <div
                      style="
                        display: inline-block;
                        padding: 15px 30px;
                        background: #2563eb;
                        color: #ffffff;
                        font-size: 28px;
                        font-weight: bold;
                        letter-spacing: 6px;
                        border-radius: 6px;
                      "
                    >
                      ${otp}
                    </div>

                    <p style="margin-top: 30px; color: #777;">
                      This OTP is valid for <strong>10 minutes</strong>.
                    </p>

                    <p style="color: #777;">
                      If you didn't request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};
