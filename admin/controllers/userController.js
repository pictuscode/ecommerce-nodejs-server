import asyncHandler from 'express-async-handler'
import fs, { unlink, unlinkSync } from 'fs'
import path, { resolve } from 'path'
import multer from 'multer'
import {profilePicDir } from '../../config/constant.js'


/**  ====================================================
 *        import  Models
    ===================================================== */

import User from '../../models/userModel.js'
import Seller from '../../models/sellerModel.js'

/**  ====================================================
 *        import  Models
 ===================================================== */

import dotenv from 'dotenv'


const __dirname = path.resolve()
dotenv.config()


const displayUserList = asyncHandler(async (req, res) => {

    var {
        page,
        search,
        limit
    } = req.body;

    var skip = (page - 1) * limit;

    var matchCondition = {};
    if (search != null && search != "") {
        matchCondition = {
            $or: [
                { fullName: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        };
    }

    const userList = await User.aggregate(
        [
            {
                $match: matchCondition
            },
            {
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
                    'data.fullName': 1,
                    'data.email': 1,
                    'data.phone': 1,
                    'data.gender': 1,
                    'data.profilepic': 1,
                    'data.isActive': 1,
                    'data._id': 1,
                    'totalCount': {
                        $first: '$totalCount'
                    }
                }
            }
        ]
    )

    res.status(200).json(userList)

})


const addEditUser = asyncHandler(async (req, res) => {

    uploadImage(req, res, function (err) {

        if (err instanceof multer.MulterError) {
            err['status'] = "0"
            return res.status(201).json(err)
        } else if (err) {
            err['status'] = "0"
            return res.status(201).json(err)
        }

        addNewUser(req, res)

    })


})

/* to save the image in draft folder with userId as file name */
var draftmusicstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profilePicDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.parse(new Date()) + '' + path.extname(file.originalname))
    }
})



/* check the image file extension */
export function checkImageFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb({ "name": "MulterError", "message": "Invalid File Type" })
    }
}

var uploadImage = multer({
    storage: draftmusicstorage,
    limits: {
        fileSize: 9000000  // 
    },
    fileFilter: function (req, file, cb) {
        checkImageFileType(file, cb)
    },
}).single('image')


const addNewUser = asyncHandler(async (req, res) => {

    var {
        fullName,
        email,
        password,
        phone,
        id
    } = req.body;

    if (id != null) {

        const userDetails = await User.findById(id);
        if (userDetails) {
            if (userDetails.email != email) {
                const userEmailExist = await User.findOne({ email: email })
                if (userEmailExist) {
                    if (req.file) {
                        try {
                            await unlinkSync(__dirname + '/' + profilePicDir + req.file.filename);
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    res.status(401).json({ 'message': 'This email already exist in user.' })

                } else {

                    const emailExist = await Seller.findOne({ email: email, _id: { $ne: id } })
                    if (emailExist) {
                        if (req.file) {
                            try {
                                await unlinkSync(__dirname + '/' + profilePicDir + req.file.filename);
                            } catch (error) {
                                console.log(error)
                            }
                        }
                        res.status(401).json({ 'message': 'Seller email already exist.' })
                    } else {

                        if (req.file) {

                            if (userDetails.image != '') {
                                try {
                                    await unlinkSync(__dirname + '/' + profilePicDir + userDetails.image);
                                } catch (error) {
                                    console.log(error)
                                }
                            }
                            userDetails.image = req.file.filename;
                        }

                        userDetails.email = email;
                        userDetails.fullName = fullName;
                        userDetails.phone = phone;
                        if (password != null) {
                            userDetails.password = password;
                        }
                        await userDetails.save();
                        res.status(200).json({ 'message': 'Successfully updated.' })

                    }

                }
            } else {

                if (req.file) {

                    if (userDetails.image != '') {
                        try {
                            await unlinkSync(__dirname + '/' + profilePicDir + userDetails.image);
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    userDetails.image = req.file.filename;
                }

                userDetails.email = email;
                userDetails.fullName = fullName;
                userDetails.phone = phone;
                if (password != '' && password != null) {

                    userDetails.password = password;
                }
                await userDetails.save();
                res.status(200).json({ 'message': 'Successfully updated.' })
            }


        } else {
            res.status(401).json({ 'message': 'Invalid User details.' })
        }

    } else {
        const userEmailExist = await User.findOne({ email: email })

        if (userEmailExist) {
            if (req.file) {
                try {
                    await unlinkSync(__dirname + '/' + profilePicDir + req.file.filename);
                } catch (error) {
                    console.log(error)
                }
            }
            res.status(401).json({ 'message': 'This email already used user.' })
        } else {

            const emailExist = await Seller.findOne({ email: email })

            if (emailExist) {
                if (req.file) {
                    try {
                        await unlinkSync(__dirname + '/' + profilePicDir + req.file.filename);
                    } catch (error) {
                        console.log(error)
                    }
                }
                res.status(401).json({ 'message': 'Seller email already exist.' })
            } else {

                await User.create(
                    {
                        fullName,
                        email,
                        password,
                        phone,
                    }
                )
                res.status(200).json({ 'message': 'Successfully user created.' })

            }

        }
    }

})

const changeUserStatus = asyncHandler(async (req, res) => {

    var {
        id,
        status
    } = req.body;

    const userDetails = await User.findById(id);
    if (userDetails) {
        userDetails.isActive = status;
        await userDetails.save();
        res.status(200).json({ 'status': 1, 'message': "Successfully changed status." })
    } else {
        res.status(200).json({ 'message': "Invalid user details.", 'status': 0 })
    }

})

export {
    displayUserList,
    addEditUser,
    changeUserStatus

}