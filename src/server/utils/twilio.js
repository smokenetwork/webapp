import twilio from 'twilio';
import config from 'config';

const accountSid = config.get('twilio.account_sid');
const authToken = config.get('twilio.auth_token');

const from_mobile = config.get('twilio.from_mobile');

let client;

export default function verify(phone, confirmation_code) {
  if (!client) client = require('twilio')(accountSid, authToken);

  return client.messages
    .create({
      body: `${confirmation_code} is your Smoke confirmation code`,
      to: `+${phone}`,  // Text this number
      from: from_mobile // From a valid Twilio number
    })
    .then(message => {
      console.log(JSON.stringify(message));
      return Promise.resolve('pass');
    })
    .catch(err => {
      console.log(JSON.stringify(err));
      return Promise.resolve('error');
    });
}
