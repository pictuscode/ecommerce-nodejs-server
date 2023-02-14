import express from 'express'
const router = express.Router()

import {
    userProduct
} from '../../middleware/authMiddleware.js'

import {
    loginCheck,
    otpVerify,
    resendOtp,
    authUser,
    forgetPassword,
    registerUser,
} from '../controllers/userController.js'



router.post('/logincheck', userProduct,loginCheck)
router.post('/otpverify', userProduct,otpVerify)
router.post('/resendotp', userProduct,resendOtp)
router.post('/authuser', userProduct,authUser)
router.post('/registeruser', userProduct,registerUser)
router.post('/forgetpassword', userProduct,forgetPassword)





export default router