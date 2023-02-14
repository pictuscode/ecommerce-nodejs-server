import asyncHandler from 'express-async-handler'
import fs, { unlink, unlinkSync } from 'fs'
import path, { resolve } from 'path'

/**  ====================================================
 *        import  Models
    ===================================================== */
import EmailTemplates from '../../models/emailtemplatesModel.js'

/**  ====================================================
 *        import  Models
 ===================================================== */

import dotenv from 'dotenv'
import slugify from 'slugify'
import validUrl from 'valid-url'
import { commonSendMail, readHTMLFile, createEmailFile, adminEmail } from '../../config/mail.js'

const __dirname = path.resolve()
dotenv.config()

const displayTemplatesList = asyncHandler(async (req, res) => {

    var {
        page,
        limit,
        search
    } = req.body;

    var skip = (page - 1) * limit;

    var matchCondition = {};
    if (search != null && search != "") {
        matchCondition = {
            $or: [
                { templateName: { $regex: search, $options: "i" } },
                { templateSubject: { $regex: search, $options: "i" } }
            ]
        };
    }

    const emailtemplatesList = await EmailTemplates.aggregate([
        {
            $match: matchCondition
        }, {
            $facet: {
                'data': [
                    {
                        $skip: skip
                    }, {
                        $limit: limit
                    }
                ],
                'totalCount': [
                    {
                        $count: 'count'
                    }
                ]
            }
        }, {
            $project: {
                'data.templateName': 1,
                'data.templateSubject': 1,
                'totalCount': {
                    $first: '$totalCount'
                }
            }
        }
    ])
    res.status(200).json({ 'emailtemplatesList': emailtemplatesList })
})

const addEditEmailTemplates = asyncHandler(async (req, res) => {

    var {
        id,
        templateName,
        templateSubject,
        templateContent
    } = req.body;

    if (id != null) {
        const emailTemplate = await EmailTemplates.findById(id)
        if (emailTemplate) {
            const nameExistCheck = await EmailTemplates.findOne({ templateName: templateName, _id: { $ne: id } });
            if (nameExistCheck) {
                res.status(200).json({ 'message': 'Email Templates Already Exists.', 'status': 0 });
            } else {
                emailTemplate.templateName = templateName
                emailTemplate.templateContent = templateContent
                emailTemplate.templateSubject = templateSubject
                var fileName = slugify(templateName)
                emailTemplate.fileName = fileName

                try {
                    unlinkSync(__dirname + '/uploads/emailtemplets/' + emailTemplate.fileName + ".html")
                    var message = '';
                    message += '<!DOCTYPE HTML><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width" /><title></title><body>';
                    message += templateContent;
                    message += '</body></html>';
                    createEmailFile(__dirname + '/uploads/emailtemplets/' + fileName + '.html', message, function (err, html) {

                    });

                } catch (error) {
                    console.log(error)
                }

                await emailTemplate.save()

                var resp = {
                    "status": 1,
                    "emailTemplateData": "Successfully updated email template."
                }
                res.status(200).json(resp)
            }

        }
        else {
            var resp = {
                "status": 0,
                "message": "invalied Template Id"
            }
            res.status(200).json(resp)
        }
    } else {

        const templateExists = await EmailTemplates.findOne({ 'templateName': templateName })
        if (templateExists) {
            res.status(200).json({ 'message': "Email Templates Already Exists." })
        } else {
            var fileName = slugify(templateName)
            var message = '';
            message += '<!DOCTYPE HTML>< html ><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width" /><title></title><body>';
            message += templateContent;
            message += '</body></html>';

            await createEmailFile(__dirname + '/uploads/emailtemplets/' + fileName + '.html', message, function (err, html) { });
            await EmailTemplates.create(
                {
                    templateName,
                    templateSubject,
                    templateContent,
                    fileName
                }
            )
        }

        res.status(200).json({ 'status': 1, 'message': 'Successfully created.' })
    }



})


export {
    displayTemplatesList,
    addEditEmailTemplates
}