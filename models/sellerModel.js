import mongoose from "mongoose";
import bcrypt from "bcrypt";

const bankScehema = mongoose.Schema({


    holderName: {
        type: String,
        required: true,
    },
    acno: {
        type: String,
        required: true,
    },
    ifscCode: {
        type: String,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        required: true,
    },


},
    {
        timestamps: true
    }
)


const sellerSchema = mongoose.Schema({

    sellerName: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    companyAddress: {
        type: String,
        default: ""
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gstNumber: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    location: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0.00000000000000000, 0.00000000000000000]
        }
    },
    deliveryDistance: {
        type: Number,
        default: 100
    },
    productId: [{
        type: mongoose.Schema.ObjectId,
        ref: 'product',
        required: true,
    }],
    bankDetails: { bankScehema }


},
    {
        timestamps: true
    }
)
sellerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
sellerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

const seller = mongoose.model('seller', sellerSchema)

export default seller