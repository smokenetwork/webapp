import config from 'config';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(config.get('sendgrid.key'));

export default function sendEmail(template, to, params /*, from = null */) {
    // if (process.env.NODE_ENV !== 'production') {
    //     console.log(`mail: to <${to}>, from <${from}>, template ${template} (not sent due to not production env)`);
    //     return;
    // }

    const email_text = `Enter the link below to confirm your email: ${config.get('site_domain')}/confirm_email/${params.confirmation_code}`;
    const email_html = `Enter the link below to confirm your email: <a href="${config.get('site_domain')}/confirm_email/${params.confirmation_code}">${params.confirmation_code}</a>`;
    const msg = {
        to: `${to}`,
        from: config.get('sendgrid.from'),
        subject: `SMOKE: ${template}`,
        text: email_text,
        html: email_html
    };

    sgMail.send(msg, (error, info) => {
        if (error) {
            console.error(`failed to send '${template}' email to '${to}'`, error);
        }
    });
}
