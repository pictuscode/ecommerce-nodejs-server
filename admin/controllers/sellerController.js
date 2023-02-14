import asyncHandler from 'express-async-handler'
import fs, { unlink, unlinkSync } from 'fs'
import path, { resolve } from 'path'
import multer from 'multer'
import { profilePicDir } from '../../config/constant.js'


/**  ====================================================
 *        import  Models
    ===================================================== */

import Seller from '../../models/sellerModel.js'
import User from '../../models/userModel.js'

/**  ====================================================
 *        import  Models
 ===================================================== */



const __dirname = path.resolve()
dotenv.config()

const addSeller = asyncHandler(async (req, res) => {

    uploadImage(req, res, function (err) {

        if (err instanceof multer.MulterError) {
            err['status'] = "0"
            return res.status(201).json(err)
        } else if (err) {
            err['status'] = "0"
            return res.status(201).json(err)
        }

        addNewSeller(req, res)

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

const addNewSeller = asyncHandler(async (req, res) => {

    var {
        id,
        sellerName,
        companyName,
        companyAddress,
        email,
        password,
        gstNumber,
        phone
    } = req.body;

    console.log(req.body)

    if (id != null) {

        const sellerDetails = await Seller.findById(id);
        if (sellerDetails) {
            if (sellerDetails.email != email) {
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

                            if (sellerDetails.image != '') {
                                try {
                                    await unlinkSync(__dirname + '/' + profilePicDir + sellerDetails.image);
                                } catch (error) {
                                    console.log(error)
                                }
                            }
                            sellerDetails.image = req.file.filename;
                        }

                        sellerDetails.email = email;
                        sellerDetails.sellerName = sellerName;
                        sellerDetails.companyName = companyName;
                        sellerDetails.companyAddress = companyAddress;
                        sellerDetails.phone = phone;
                        if (password != null) {
                            sellerDetails.password = password;
                        }
                        sellerDetails.gstNumber = gstNumber;
                        await sellerDetails.save();
                        res.status(200).json({ 'message': 'Successfully updated.' })

                    }

                }
            } else {

                if (req.file) {

                    if (sellerDetails.image != '') {
                        try {
                            await unlinkSync(__dirname + '/' + profilePicDir + sellerDetails.image);
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    sellerDetails.image = req.file.filename;
                }

                sellerDetails.email = email;
                sellerDetails.sellerName = sellerName;
                sellerDetails.companyName = companyName;
                sellerDetails.companyAddress = companyAddress;
                sellerDetails.phone = phone;
                if (password != '' && password != null) {

                    sellerDetails.password = password;
                }
                sellerDetails.gstNumber = gstNumber;
                await sellerDetails.save();
                res.status(200).json({ 'message': 'Successfully updated.' })
            }


        } else {
            res.status(401).json({ 'message': 'Invalid seller details.' })
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

                await Seller.create(
                    {
                        sellerName: sellerName,
                        companyName: companyName,
                        companyAddress: companyAddress,
                        phone: phone,
                        email: email,
                        password: password,
                        gstNumber: gstNumber,
                        image: req.file.filename

                    }
                )
                res.status(200).json({ 'message': 'Successfully seller created.' })

            }

        }

    }

})

const changeSellerStatus = asyncHandler(async (req, res) => {

    var {
        id,
        status
    } = req.body;

    const sellerDetails = await Seller.findById(id);
    if (sellerDetails) {
        sellerDetails.isActive = status;
        await sellerDetails.save();

        await Product.updateMany({
            _id: { $in: [...sellerDetails.productId] }
        }, {
            $set: {
                isActive: status
            }
        })

        res.status(200).json({ 'message': 'Successfully changed status.' })

    } else {
        res.status(401).json({ 'message': 'Invalid seller details.' })
    }

})



const displaySellerList = asyncHandler(async (req, res) => {

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
                { sellerName: { $regex: search, $options: "i" } },
                { companyName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ]
        };
    }

    const sellerList = await Seller.aggregate(
        [
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
                    'data.sellerName': 1,
                    'data.companyName': 1,
                    'data.image': 1,
                    'data.email': 1,
                    'data.phone': 1,
                    'data.isActive': 1,
                    'data._id': 1,
                    'totalCount': {
                        $first: '$totalCount'
                    }
                }
            }
        ]
    )


    res.status(200).json({ 'profilePicDir': profilePicDir, 'sellerList': sellerList })

})

const getSellerInfo = asyncHandler(async (req, res) => {

    const sellerInfo = await Seller.findById(req.body.id).select('-productId')
    if (sellerInfo) {
        res.status(200).json(sellerInfo)
    } else {
        res.status(401).json({ 'message': 'Invalid seller information.' })
    }

})



export {
    addSeller,
    changeSellerStatus,
    displaySellerList,
    getSellerInfo
}