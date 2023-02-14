import asyncHandler from 'express-async-handler'
import path, { resolve } from 'path'
import { profilePicDir } from '../../config/constant.js'
import generateToken from '../../utils/generateToken.js'

/**  ====================================================
 *        import  Models
    ===================================================== */

import Seller from '../../models/sellerModel.js'

/**  ====================================================
 *        import  Models
 ===================================================== */


const sellerRegister = asyncHandler(async (req, res) => {

    var {
        email,
        phone,
        sellerName,
        companyName,
        password
    } = req.body;

    await Seller.create(
        {
            email: email,
            phone: phone,
            sellerName: sellerName,
            companyName: companyName,
            password: password

        }
    )

    res.status(200).json({ 'message': 'Successfully created your partner acoount.' })

})

const authSeller = asyncHandler(async (req, res) => {

    var {
        email,
        password
    } = req.body;

    if (password != '') {
        const sellerExist = await Seller.findOne({ email: email })
        if (sellerExist && await (sellerExist.matchPassword(password))) {

            if (sellerExist.isActive) {
                var data = {
                    "token": generateToken(sellerExist._id),
                    "sellerId": sellerExist._id,
                    "companyName": sellerExist.companyName,
                    "sellerName": sellerExist.sellerName,
                    "profilepic": sellerExist.image,

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





export {
    sellerRegister,
    authSeller,

}