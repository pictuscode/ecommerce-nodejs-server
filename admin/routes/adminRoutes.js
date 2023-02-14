import express from 'express'
const router = express.Router()

import {
    adminSettings,
    addEditAdminSettings,
    uploadSiteLogo,
    dashboard,
    generalReport
} from '../controllers/adminSettingsController.js'


import {
    addSeller,
    changeSellerStatus,
    displaySellerList,
    getSellerInfo
} from '../controllers/sellerController.js'






import {
    displayUserList,
    addEditUser,
    changeUserStatus
} from '../controllers/userController.js'

import {
    displayTemplatesList,
    addEditEmailTemplates
} from '../controllers/emailTemplatesController.js'


// AdminSetting 
router.post('/adminsettings', adminSettings)
router.post('/addeditadminsettings', addEditAdminSettings)
router.post('/uploadsitelogo', uploadSiteLogo)

// Dashboard

router.post('/dashboard', dashboard)
router.post('/generalreport', generalReport)


// Seller
router.post('/addseller', addSeller)
router.post('/changesellerstatus', changeSellerStatus)
router.post('/displaysellerlist', displaySellerList)
router.post('/getsellerinfo', getSellerInfo)


// User 

router.post('/displayuserlist', displayUserList)
router.post('/addedituser', addEditUser)
router.post('changeuserstatus', changeUserStatus)



// Email templates

router.post('/displayemailtemplateslist', displayTemplatesList)
router.post('/addeditemailtemplates', addEditEmailTemplates)



export default router