import mongoose from "mongoose";
import bcrypt from "bcrypt";

const addressSchema = mongoose.Schema(
    {

        name: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: Number,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        locality: {
            type: String,
            required: true
        },
        typeAddress: {
            type: String,
            default: "Home"
        }

    },
    {
        timestamps: true
    }
);

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        default: "Female"
    },
    dob: {
        type: Date,
    },
    profilepic: {
        type: String,
        default: ""
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
    address: [addressSchema],
    lastLoginIp: {
        type: String,
        default: ""
    },
    lastLoginDate: {
        type: Date,
        default: new Date()
    }



},
    {
        timestamps: true
    }
)

userSchema.index({ location: '2dsphere' });
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

const user = mongoose.model('user', userSchema)

export default user