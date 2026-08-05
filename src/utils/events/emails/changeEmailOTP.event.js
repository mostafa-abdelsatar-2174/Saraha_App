import { EventEmitter } from "node:events";
import { HTMLFormat, sendEmail } from "../../email/sendEmail.js";

const changeEmailOTPEvent = new EventEmitter();

changeEmailOTPEvent.on("sendOTP", async (email, OTP) => {
    try {
        const html = HTMLFormat({
            header: "change email OTP",
            description:"Use this OTP to confirm your new email address. Do not share this code with anyone.",
            button: OTP
        });
        await sendEmail({to:email, subject: "change your Email OTP", html})
    } catch (error) {
        console.error(error)
    }
});

export {changeEmailOTPEvent}