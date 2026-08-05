import { EventEmitter } from "node:events";
import { HTMLFormat, sendEmail } from "../../email/sendEmail.js";
import { generateToken } from "../../security/token.js";

const confirmEmailEvent = new EventEmitter();

confirmEmailEvent.on("sendConfirmEmail", async (email) => {
  try {
    const confirmToken = generateToken({payload:{email}, secretKey:process.env.JWT_CONFIRM_EMAIL_TOKEN_KEY, options:{ expiresIn: "1h" }})
    const html = HTMLFormat({
      header: "Welcome in Sarahe APP",
      description: "please confirm your email to be able to login in application",
      link: `http://127.0.0.1:5500/index.html/${confirmToken}`,
      button: "Click here to confirm your Email",
    });
    await sendEmail({
      to: email,
      subject: "Confirm your Saraha App Email",
      html,
    });
  } catch (error) {
    console.error(error)  
  }
});

export { confirmEmailEvent };
