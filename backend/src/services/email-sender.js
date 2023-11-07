require('dotenv').config();
const path = require("path");
//require("dotenv").config({ path: path.resolve(__dirname, '..', '.env') });
const Email = require('email-templates');
const root = path.join(__dirname, 'emails');
const emailsFile = require("../data/emails.json");

const mail = new Email({
    message: {
        from: {
            name: 'WizardGuard',
            address: 'merlin@wizardguard.org'
        }
    },
    send: true,
    preview: false,
    transport: {
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PSWD
        }
    },
    views: { root }
});

const getLocalsVariablesByLanguage = (language, type) => {
    language = language !== undefined ? language : 'en';
    const elem = emailsFile.themes[type];
    return {
        hi: emailsFile.hi[language],
        footerText: emailsFile.footerText[language],
        regards: emailsFile.regards[language],
        linkText: emailsFile.linkText[language],
        subject: elem.subject[language],
        topText: elem.topText[language],
        bottomText: elem.bottomText[language],
        buttonText: elem.buttonText[language],
        buttonColors: elem.buttonColors,
        image: elem.image
    }
}

const sendEmail = async (name, email, link, language, type, addition = '', template = 'simple') => {
    const data = getLocalsVariablesByLanguage(language, type);
    await mail.send({
        template: template,
        message: {
            to: email
        },
        locals: {
            subject: data.subject,
            hi: data.hi,
            name: name.firstName,
            link: link,
            topText: data.topText.concat(addition),
            bottomText: data.bottomText,
            buttonText: data.buttonText,
            buttonColorBase: data.buttonColors.base,
            buttonColorHover: data.buttonColors.hover,
            image: data.image,
            linkText: data.linkText,
            regards: data.regards,
            footerText: data.footerText
        }
    });
}

exports.sendWelcome = async (name, email, link, language = 'en') => {
    await sendEmail(name, email, link, language, 'welcome');
}

exports.sendGoodbye = async (name, email, link, language = 'en') => {
    await sendEmail(name, email, link, language, 'goodbye');
}

exports.sendResetPassword = async (name, email, link, language = 'en') => {
    await sendEmail(name, email, link, language, 'password');
}

exports.sendNewLocation = async (name, email, location, link, language = 'en') => {
    await sendEmail(name, email, link, language, 'location', location.concat("</strong>"));
}
