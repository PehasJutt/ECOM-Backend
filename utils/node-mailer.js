import nodemailer from 'nodemailer';

const Transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD
  }
});

const sendForgotMail = (email, token) => {
  const ForgotPasswordMail = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: 'Confirm Email and Reset Password',
    html:
        '<p>Please click on the following link within 15 minutes to verify your email and set new password:</p>' +
        '<a target="_blank" href="http://localhost:3000/resetpassword?token=' +
        token +
        '">Click here to reset password' +
        '</a>'
  };
  Transporter.sendMail(ForgotPasswordMail, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const sendWelcomeMail = (email, name) => {
  const WelcomeMail = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: ' Welcome to E-Qomm - Your New Shopping Destination',
    html:
        `<h3>Dear ${name},</h3> ` +
        '<p>Welcome to Qbatch`s E-Qomm! Discover a world of endless possibilities with us. Happy shopping!</p>'
  };
  Transporter.sendMail(WelcomeMail, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const sendVerificationeMail = (email, token) => {
  const VerifyEmail = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: 'Confirm Email and Reset Password',
    html:
        '<p>Please click on the following link within 15 minutes to verify your email address:</p>' +
        '<a target="_blank" href="http://localhost:3000/resetpassword?token=' +
        token +
        '">Click here to verify email' +
        '</a>'
  };
  Transporter.sendMail(VerifyEmail, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

export {
  sendForgotMail,
  sendWelcomeMail,
  sendVerificationeMail
};