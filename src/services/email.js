/**
 * Email service
 *
 * This is a minimum settings to send email to user
 * We use Mailgun
 */

require("dotenv").config();

const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_KEY,
  url: process.env.MAILGUN_URL,
});

module.exports = {
  /**
   * Send email with template
   *
   * @param {*} to Recipient email
   * @param {*} subject Email subject
   * @param {*} template Email template
   * @param {*} variables Payload variables
   */
  sendWithTemplate(to, subject, template, variables) {
    mg.messages
      .create(process.env.MAILGUN_DOMAIN, {
        from: `KMS <no-reply@${process.env.MAILGUN_DOMAIN}>`,
        to: to,
        subject: subject,
        template: template,
        "h:X-Mailgun-Variables": JSON.stringify(variables),
      })
      .then((msg) => {
        console.log("Sending email status:", msg);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  sendWithoutTemplate(to, subject, html) {
    mg.messages
      .create(process.env.MAILGUN_DOMAIN, {
        from: `KMS <no-reply@${process.env.MAILGUN_DOMAIN}>`,
        to: to,
        subject: subject,
        html: html,
      })
      .then((msg) => {
        console.log("Sending email status:", msg);
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
