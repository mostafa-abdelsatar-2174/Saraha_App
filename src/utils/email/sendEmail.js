import nodemailer from "nodemailer"




export const sendEmail = async ({ to="", cc="", bcc="", subject="Saraha_App", text="", html="", attachments = []} = {}) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth:{
               user:process.env.COMPANY_EMAIL,
               pass:process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false 
            }
        });

        // console.log({html});

        const info = await transporter.sendMail({
            from: `"Saraha APP" <${process.env.COMPANY_EMAIL}>`,
            to, cc, bcc, 
            subject, 
            text,
            html, 
            attachments
        });
        return info
    } catch (err) {
        return err
    }
}

export const HTMLFormat = ({header, description, link, button})=>{
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#faebd7; padding:40px 20px;">
    <tr>
        <td align="center">

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="500" style="background:#faebd7;">
                
                <tr>
                    <td align="center" style="padding-bottom:20px;">
                        <h1 style="
                            margin:0;
                            padding:15px 20px;
                            background:#ff3b30;
                            color:#ffffff;
                            font-size:48px;
                            font-family:Arial,Helvetica,sans-serif;
                            border-radius:8px;
                        ">
                            ${header}
                        </h1>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="
                        padding:20px 10px;
                        font-size:24px;
                        font-family:Arial,Helvetica,sans-serif;
                        color:#333333;
                    ">
                        ${description}
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding-top:10px;">
                        <a href="${link}"
                           target="_blank"
                           style="
                                display:inline-block;
                                background:#6c757d;
                                color:#ffffff;
                                text-decoration:none;
                                font-size:24px;
                                font-family:Arial,Helvetica,sans-serif;
                                padding:14px 32px;
                                border-radius:20px;
                                font-weight:bold;
                           ">
                            ${button}
                        </a>
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>
`
}