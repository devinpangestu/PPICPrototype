import nodemailer from "nodemailer";
import dotenv from "dotenv";
import env from "../validateEnv.js";
dotenv.config();
const sendEmailNotificationScheduleDebt = async (subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_SECURE,
      auth: {
        user: env.EMAIL_USERNAME,
        pass: env.EMAIL_PASSWORD,
      },
    });
    const baseUrl = `${process.env.BASE_URL}:${process.env.API_PORT}`;
    const mailOptions = {
      from: `PT. Bina Karya Prima - PPIC <${env.EMAIL_USERNAME}>`,
      to: env.EMAIL_USERNAME,
      subject: subject,
      text: text,
      html: `<!DOCTYPE html>
    
          <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
          <head>
          <title></title>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
          <meta content="width=device-width, initial-scale=1.0" name="viewport"/><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900" rel="stylesheet" type="text/css"/><!--<![endif]-->
          </head>
          <body style="margin: 0; background-color: #ffffff; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
          <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; background-image: none; background-position: top left; background-size: auto; background-repeat: no-repeat;" width="100%">
            <tbody>
                <tr>
                    <td>
                    ${text}
                    </td>
                </tr>
            </tbody>
          </table><!-- End -->
          </body>
          </html>`,
    //   attachments: [
    //     {
    //       filename: "download.jpg",
    //       path: "public/images/download.jpg",
    //       cid: "header_img", //same cid value as in the html img src
    //     },
    //     {
    //       filename: "Img1_2x.jpg",
    //       path: "public/images/Img1_2x.jpg",
    //       cid: "add_img", //same cid value as in the html img src
    //     },
    //     {
    //       filename: "favicon.png",
    //       path: "public/images/favicon.png",
    //       cid: "footer_icon", //same cid value as in the html img src
    //     },
    //     {
    //       filename: "instagram2x.png",
    //       path: "public/images/instagram2x.png",
    //       cid: "ig_img", //same cid value as in the html img src
    //     },
    //     {
    //       filename: "linkedin2x.png",
    //       path: "public/images/linkedin2x.png",
    //       cid: "linkedin_img", //same cid value as in the html img src
    //     },
    //     {
    //       filename: "Beefree-logo.png",
    //       path: "public/images/Beefree-logo.png",
    //       cid: "beefree_img", //same cid value as in the html img src
    //     },
    //   ],
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

export default sendEmailNotificationScheduleDebt;
