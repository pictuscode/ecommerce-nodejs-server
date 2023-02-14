import asyncHandler from 'express-async-handler'
import path, { join, resolve } from 'path'

import { baseUrl, profilePicDir, emailTempletsDir, emailTempletsImageDir, siteLogoDir } from '../../config/constant.js'
import generateToken from '../../utils/generateToken.js'

/**  ====================================================
 *        import  Models
    ===================================================== */

import User from '../../models/userModel.js'

/**  ====================================================
 *        import  Models
 ===================================================== */

import dotenv from 'dotenv'
import { commonSendMail, readHTMLFile, createEmailFile, adminEmail } from '../../config/mail.js'
import handlebars from 'handlebars'
import Twilio from 'twilio'
import otpTool from 'otp-without-db'


const __dirname = path.resolve()
dotenv.config()

const client = new Twilio(process.env.TWILLOSID, process.env.TWILLOTOKEN);

const loginCheck = asyncHandler(async (req, res) => {

    var phone = req.body.phone;

    if (phone != null && phone != '' && phone != 'undefined' && phone != undefined) {
        const otp = Math.floor(1000 + Math.random() * 9000);
        const hash = otpTool.createNewOTP(phone, otp, process.env.OTPSECRETKEY);
        var bodymsg = "[#] Use " + otp + " as your verification code on Myntra. The OTP expire with in 10min."
        var smsSendNumber = '+91' + phone;

        await client.messages
            .create({
                body: bodymsg,
                to: smsSendNumber,
                from: '+1 928 857 8858',
            })

        res.status(200).json({ 'verify': hash })
    } else {
        res.status(401).json({ 'message': 'Please enter your number.' })
    }

})
const resendOtp = asyncHandler(async (req, res) => {

    var phone = req.body.phone;

    if (phone != null && phone != '' && phone != 'undefined' && phone != undefined) {
        const otp = Math.floor(1000 + Math.random() * 9000);
        const hash = otpTool.createNewOTP(phone, otp, process.env.OTPSECRETKEY);
        var bodymsg = "[#] Use " + otp + " as your verification code on Myntra. The OTP expire with in 10min."
        var smsSendNumber = '+91' + phone;

        await client.messages
            .create({
                body: bodymsg,
                to: smsSendNumber,
                from: '+1 928 857 8858',
            })

        res.status(200).json({ 'verify': hash })
    } else {
        res.status(401).json({ 'message': 'Please enter your number.' })
    }

})

const otpVerify = asyncHandler(async (req, res) => {

    var {
        hash,
        otp,
        phone
    } = req.body;

    const otpVerify = otpTool.verifyOTP(phone, otp, hash, process.env.OTPSECRETKEY);
    if (otpVerify) {
        var newUser = true;
        var data = {};
        var phoneExist = await User.findOne({ 'phone': phone })
        if (phoneExist) {
            data.token = generateToken(phoneExist._id);
            data.id = phoneExist._id;
            newUser = false;
        }
        res.status(200).json({ 'status': 1, 'message': 'Successfully OTP Verifed.', 'newUser': newUser, 'data': data })
    } else {
        res.status(200).json({ 'message': 'Invalid OTP Number.', 'status': 0 })
    }


})

const authUser = asyncHandler(async (req, res) => {

    var {
        phone,
        password
    } = req.body;


    if (password != '') {
        const userExist = await User.findOne({ phone: phone })
        if (userExist && await (userExist.matchPassword(password))) {

            if (userExist.isActive) {

                var ip;
                if (req.headers['x-forwarded-for']) {
                    ip = req.headers['x-forwarded-for'].split(",")[0];
                } else {
                    ip = req.ip;

                }

                userExist.lastLoginIp = ip;
                userExist.lastLoginDate = new Date();
                await userExist.save();

                var data = {
                    "token": generateToken(userExist._id),
                    "userId": userExist._id,
                    "fullName": userExist.fullName,
                    "gender": userExist.gender,
                    "profilepic": userExist.profilepic,

                }
                res.status(200).json({ data, "imageDirectory": profilePicDir })
            } else {
                res.status(200).json({ "message": "Your account deactivated, Please contact admin." })
            }


        } else {
            res.status(200).json({ "message": "Invalid Password." })
        }
    } else {
        res.status(200).json({ "message": "Please Enter password." })
    }

})

const forgetPassword = asyncHandler(async (req, res) => {

    var {
        email
    } = req.body;

    const emailExist = await User.findOne({ email: email })
    if (emailExist) {

        const userDetails = await User.findById(emailExist._id)
        var password = await generateStrongPassword(10);
        userDetails.password = password;
        await userDetails.save()
        readHTMLFile(__dirname + '/' + emailTempletsDir + 'password-change.html', function (err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                pwd: password,
            };
            var htmlToSend = template(replacements);
            var mailOptions = {
                from: adminEmail,
                to: userDetails.email,
                subject: 'Forget password',
                html: htmlToSend,
                attachments: [
                    {
                        filename: 'siteLogo.png',
                        path: baseUrl + siteLogoDir,
                        cid: 'siteLogo'
                    },
                    {
                        filename: 'gif-resetpass.gif',
                        path: baseUrl + emailTempletsImageDir + 'gif-resetpass.gif',
                        cid: 'pasGif'
                    },
                    {
                        filename: 'facebook2x.png',
                        path: baseUrl + emailTempletsImageDir + 'facebook2x.png',
                        cid: 'fb'
                    },
                    {
                        filename: 'twitter2x.png',
                        path: baseUrl + emailTempletsImageDir + 'twitter2x.png',
                        cid: 'tw'
                    },
                    {
                        filename: 'instagram2x.png',
                        path: baseUrl + emailTempletsImageDir + 'instagram2x.png',
                        cid: 'ins'
                    },

                ]
            }
            commonSendMail(mailOptions)
            res.status(200).json({ "message": "Successfully send mail" })
        });

    } else {
        res.status(401).json({ 'message': 'Invalid email address' })
    }

})

const registerUser = asyncHandler(async (req, res) => {

    var {
        phone,
        password,
        fullName,
        email,
        gender,
        alternativePhone,
        hintName
    } = req.body;

    const phoneExist = await User.findOne({ phone: phone });
    if (phoneExist) {
        res.status(401).json({ 'message': 'Phone number already exist.' })
    } else {
        const emailExist = await User.findOne({ email: email })
        if (emailExist) {
            res.status(401).json({ 'message': 'Email address already exist.' })
        } else {

            const userDetails = await User.create(
                {
                    phone: phone,
                    email: email,
                    fullName: fullName,
                    password: password,
                    gender: gender,
                    alternativePhone: alternativePhone,
                    hintName: hintName
                }
            )
            var data = {
                'token': generateToken(userDetails._id),
                'fullName': userDetails.fullName
            }
            res.status(200).json(data)

        }
    }

})

async function generateStrongPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}


export {
    loginCheck,
    otpVerify,
    authUser,
    forgetPassword,
    registerUser,
    resendOtp,


}