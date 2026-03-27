import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

if(process.env.RESEND_API ) {
    console.log("API key is set so proceeding with sending email");
}
const resend = new Resend(process.env.RESEND_API);
const sendEmail =  async ({name,sendTo,subject,html})=>{
    try {
        const { data, error } = await resend.emails.send({
            from: 'LEARN_MICROSERVICE <onboarding@resend.dev>',
            to: sendTo,
            subject: subject,
            html: html,
        });
        if(error){
            return console.error({ error });
        }
        return data;
    } catch (error) {
        console.error({ error });
    }
    

}

export default sendEmail;