import { EventEmitter } from "node:events";
import { HTMLFormat, sendEmail } from "../../email/sendEmail.js";

const sendOTPEvent = new EventEmitter();

sendOTPEvent.on("sendOTP", async (email, OTP, header, description, subject) => {
    try {
        const html = HTMLFormat({
            header: header,
            description: description,
            button: OTP
        });
        await sendEmail({to:email, subject: subject, html})
    } catch (error) {
        console.error(error)
    }
});

export {sendOTPEvent}