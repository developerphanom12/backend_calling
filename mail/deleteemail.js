const nodemailer = require('nodemailer')

function sendaccountinfo(email) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'ashimavineet2729@gmail.com',
            pass: 'suqo spfj ajsb fieb',
        }
    })
    const mailOptions = {
        from: 'ashimavineet2729@gmail.com',
        to: email,
        subject: 'Your Account Blocked',
        html: `
                     <p class="message">Unforunately Your Account Blocked</p>
            <p class="message">Please wait some time Notify after your account unblocked from admin</p>
        `,
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}




module.exports = {
    sendaccountinfo
}