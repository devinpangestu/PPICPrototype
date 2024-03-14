import nodemailer from "nodemailer";
import dotenv from "dotenv";
import env from "../validateEnv.js";
dotenv.config();
const sendEmailNotificationPPICProc = async (subject, text, target) => {
  try {
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_SECURE ? env.EMAIL_PORT_SECURE : env.EMAIL_PORT,
      secure: env.EMAIL_SECURE,
      auth: {
        user: env.EMAIL_USERNAME,
        pass: env.EMAIL_PASSWORD,
      },
    });
    console.log(target);
    const mailOptions = {
      from: `PT. Bina Karya Prima - PPIC <${env.EMAIL_USERNAME}>`,
      to: target,
      subject: subject,
      text: text,
      html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
          <title></title>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
          <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet" type="text/css">
          <link href="https://fonts.googleapis.com/css?family=Playfair+Display" rel="stylesheet" type="text/css"><!--<![endif]-->
          <style>
              * {
                  box-sizing: border-box;
              }
      
              body {
                  margin: 0;
                  padding: 0;
              }
      
              a[x-apple-data-detectors] {
                  color: inherit !important;
                  text-decoration: inherit !important;
              }
      
              #MessageViewBody a {
                  color: inherit;
                  text-decoration: none;
              }
      
              p {
                  line-height: inherit
              }
      
              .desktop_hide,
              .desktop_hide table {
                  mso-hide: all;
                  display: none;
                  max-height: 0px;
                  overflow: hidden;
              }
      
              .image_block img+div {
                  display: none;
              }
      
              @media (max-width:700px) {
                  .mobile_hide {
                      display: none;
                  }
      
                  .row-content {
                      width: 100% !important;
                  }
      
                  .stack .column {
                      width: 100%;
                      display: block;
                  }
      
                  .mobile_hide {
                      min-height: 0;
                      max-height: 0;
                      max-width: 0;
                      overflow: hidden;
                      font-size: 0px;
                  }
      
                  .desktop_hide,
                  .desktop_hide table {
                      display: table !important;
                      max-height: none !important;
                  }
              }
          </style>
      </head>
      
      <body style="background-color: #f2fafc; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
          <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f2fafc;">
              <tbody>
                  <tr>
                      <td>
                          <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                              <tbody>
                                  <tr>
                                      <td>
                                          <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px; margin: 0 auto;" width="680">
                                              <tbody>
                                                  <tr>
                                                      <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                          <table class="paragraph_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                              <tr>
                                                                  <td class="pad">
                                                                      <div style="color:#00703c;font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:700;line-height:120%;text-align:center;mso-line-height-alt:36px;">
                                                                          <p style="margin: 0; word-break: break-word;"><span>Detail Jadwal PO</span></p>
                                                                      </div>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                          <table class="paragraph_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                              <tr>
                                                                  <td class="pad">
                                                                      <div style="color:#00703c;font-family:Nunito, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:700;line-height:120%;text-align:left;mso-line-height-alt:16.8px;">
                                                                          ${text}
                                                                      </div>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table><!-- End -->
      </body>
      
      </html>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return console.log(error);
      }

      console.log("Message sent: " + info.response);
    });
  } catch (error) {
    console.log("error sending email", error);
  }
};

export default sendEmailNotificationPPICProc;
