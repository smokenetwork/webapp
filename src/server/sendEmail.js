// import sendgrid from 'sendgrid';
import config from 'config';

const nodemailer = require('nodemailer');
// const sg = sendgrid(config.get('sendgrid.key'));

// Use yandex for testing
const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: config.get('sendgrid.from'),
        pass: config.get('sendgrid.key')
    },
    logger: true,
    debug: true,
    disableUrlAccess: false
});

export default function sendEmail(template, to, params /*, from = null */) {
    /*******
    if (process.env.NODE_ENV !== 'production') {
        console.log(`mail: to <${to}>, from <${from}>, template ${template} (not sent due to not production env)`);
        return;
    }
    const tmpl_id = config.get('sendgrid.templates')[template];
    if (!tmpl_id) throw new Error(`can't find template ${template}`);

    const request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
            template_id: tmpl_id,
            personalizations: [
                {to: [{email: to}],
                 substitutions: params},
            ],
            from: {email: from || config.get('sendgrid.from')}
        }
    });

    sg.API(request)
    .then(response => {
        console.log(`sent '${template}' email to '${to}'`, response.statusCode);
    })
    .catch(error => {
        console.error(`failed to send '${template}' email to '${to}'`, error);
    });

    */

    /**
     * Use any mail for testing first, should be replaced by current smoke email service with custom domain eg smoke.io
     */
    const email_text = `Enter the link below to confirm your email:
    http://51.15.217.173/confirm_email/${params.confirmation_code}`;

    const email_html = `Enter the link below to confirm your email:
    <a href="http://51.15.217.173/confirm_email/${params.confirmation_code}">${params.confirmation_code}</a>`;

    const mailOptions = {
        from: config.get('sendgrid.from'),
        to: `${to}`,
        subject: `SMOKE: ${template}`,
        text: email_text,
        html: email_html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(JSON.stringify(info));
            return console.log(JSON.stringify(error));
        }
        return console.log('Message sent: %s', info.messageId);
    });
}
