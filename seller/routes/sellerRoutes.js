import express from 'express'
const router = express.Router()

import {
    sellerprotect
} from '../../middleware/authMiddleware.js'

import {
    sellerRegister,
    authSeller,


} from '../controllers/sellerController.js'


router.post('/sellerregister', sellerRegister)
router.post('/authseller', authSeller)







export default router