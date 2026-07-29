import { EventEmitter } from "node:events";
import jwt from "jsonwebtoken"
import { HTMLFormat, sendEmail } from "../../utils/email/sendEmail.js";

const confirmEmailEvent = new EventEmitter()

confirmEmailEvent.on("sendConfirmEmail", async(email)=>{
    const confirmToken = jwt.sign({email}, process.env.JWT_CONFIRM_EMAIL_TOKEN_KEY,{expiresIn:'1h'})
    const html = HTMLFormat({header:"Welcome in Sarahe APP",
            description:"please confirm your email to be able to login in application",
            link:`http://127.0.0.1:5500/index.html/${confirmToken}`,
            button:"Click here to confirm your Email"        
    });
    const theemail = await sendEmail({to:email, subject:'Confirm your Saraha App Email', html})
    // console.log("🚀 ~ signUp ~ theemail:", theemail)
})

export {confirmEmailEvent}