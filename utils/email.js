const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user,url){
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = `Vaibhav Bansal <${process.env.EMAIL_FROM}>`

    }

    newTransport(){

        if(process.env.NODE_ENV === 'production'){
            //Sendgrid
            return nodemailer.createTransport({
                service:'SendGrid',
                auth:{
                    user:process.env.SENDGRID_USERNAME,
                    pass:process.env.SENDGRID_PASSWORD
                }
            })
        }
        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
        });
    }

    //Send Actual email
    async send(template,subject){
        //Render HTMl based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName:this.firstName,
            url:this.url,
            subject
        })
        //Define Mail options
        const mailOptions = {
            from:this.from,
            to:this.to,
            subject,
            html:html,
            text:htmlToText.fromString(html),
            //html:
        };
        //Create a transport and Send Email
        
        await this.newTransport().sendMail(mailOptions);

    }

    async sendWelcome(){
        await this.send('Welcome','Welcome to the Natours Family');
    }

    async sendPasswordReset(){
        await this.send('passwordReset','Reset Your Password');
    }
};
/*
const sendEmail = async options => {
    //1)Create a transporter
    /*const transporter = nodemailer.createTransport({
        //service:'Gmail',
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    });*/
    //2)Define the email options
    /*const mailOptions = {
        from:'Vaibhav Bansal <vaibhav@bansal.com>',
        to:options.email,
        subject:options.subject,
        text:options.message,
        //html:
    };*/
    //3)Actually send the email
  /*  await transporter.sendMail(mailOptions);
};
*/
//module.exports = sendEmail;