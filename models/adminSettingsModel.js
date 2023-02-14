import mongoose from 'mongoose';



const adminSettingSchema = mongoose.Schema({

    metaTitle: {
        type: String,
        required: true,
    },
    metaDescription: {
        type: String,
        required: true,
    },
    metaKeywords: {
        type: String,
        required: true,
    },
    siteLogo: {
        type: String,
        required: true,
    },
    siteLogo1: {
        type: String,
    },
    siteFavicon: {
        type: String,
        required: true,
    },
    fbAppId: {
        type: String,
        default: ""
    },
    fbAppSecret: {
        type: String,
        default: ""
    },
    twitterAppId: {
        type: String,
        default: ""
    },
    twitterName: {
        type: String,
        default: ""
    },
    homeTitle1: {
        type: String,
        default: ""
    },
    homeTitle2: {
        type: String,
        default: ""
    },
    copyRight: {
        type: String,
        default: ""
    },
    gmailClientId: {
        type: String,
        default: ""
    },
    gmailClientSecret: {
        type: String,
        default: ""
    },
    gmailRedirectUrl: {
        type: String,
        default: ""
    },
    gmapKey: {
        type: String,
        default: ""
    },
    googleDataStudioLink: {
        type: String,
        default: ""
    },
    googleAnalytics: {
        type: String,
        default: ""
    },
    twilloSid: {
        type: String,
        default: ""
    },
    twilloToken: {
        type: String,
        default: ""
    },
    geoMapKey: {
        type: String,
        default: ""
    },
    bingMapSportal: {
        type: String,
        default: ""
    },
},
    {
        timestamps: true
    }
)



const AdminSettings = mongoose.model('adminSetting', adminSettingSchema)

export default AdminSettings
