import config from 'config';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(config.get('sendgrid.key'));

export default function sendEmail(template, to, params /*, from = null */) {
  // if (process.env.NODE_ENV !== 'production') {
  //     console.log(`mail: to <${to}>, from <${from}>, template ${template} (not sent due to not production env)`);
  //     return;
  // }

  const msg = {
    templateId: config.get('sendgrid.templates.' + template),
    substitutionWrappers: ['{{', '}}'],
    to: `${to}`,
    from: config.get('sendgrid.from'),
    substitutions: params
  };

  sgMail.send(msg, (error, info) => {
    if (error) {
      console.error(`failed to send '${template}' email to '${to}'`, error);
    }
  });
}
