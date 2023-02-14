import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import fs, { unlink, unlinkSync } from 'fs'
import path, { resolve } from 'path'
import { baseUrl, androidAppLink, serverUrl, bannerDir, emailTempletsDir } from '../config/constant.js'

/**  ====================================================
 *        import  Models
    ===================================================== */

import EmailTemplates from '../models/emailtemplatesModel.js'

/**  ====================================================
 *        import  Models
 ===================================================== */

import dotenv from 'dotenv'
import moment from 'moment';
import slugify from 'slugify'
import { commonSendMail, readHTMLFile, createEmailFile, adminEmail } from '../config/mail.js'
import handlebars from 'handlebars'
const __dirname = path.resolve()
dotenv.config()



export async function sendAdminContact(values) {
    
    var id = "63b51f2ddfa782f6e9c35aee";
    const emailTemplateValues = await EmailTemplates.findById(id)
    console.log(emailTemplateValues)
    readHTMLFile(__dirname + '/' + emailTempletsDir + emailTemplateValues.fileName + '.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = values;
        var htmlToSend = template(replacements);

        var mailOptions = {
            from: adminEmail,
            to: adminEmail,
            subject: emailTemplateValues.templateSubject,
            html: htmlToSend,

        }
        commonSendMail(mailOptions)
        return true;
    });


};





