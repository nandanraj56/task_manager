const sdgrid = require('@sendgrid/mail')



sdgrid.setApiKey(process.env.SENDGRID_API)


const sendWelcomeEmail = (name,email)=>{
   sdgrid.send({
        to:email,
        from:"nandanraj56@gmail.com",
        subject:"Welcome to Task Manager App",
        text:`Hi ${name}, let me know how you get along this app.`
    
    })
}
const sendCancellationEmail = (name,email)=>{
    sdgrid.send({
        to:email,
        from:"nandanraj56@gmail.com",
        subject:"Sad to see you go..",
        text:`Hi ${name}, We are sad to see you go, is there isnything we could have done to keep things better.`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}