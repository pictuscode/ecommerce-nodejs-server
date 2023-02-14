import mongoose from "mongoose";


const emailTemplatesSchema = mongoose.Schema({

    templateName:{
        type:String,
        require:true
    },
    templateSubject:{
        type:String,
        require:true
    },
    templateContent:{
        type:String,
        require:true
    },
    fileName:{
        type:String,
        require:true
    }

}, {
    timestamps: true
}
)




const emailTemplates = mongoose.model('emailTemplates', emailTemplatesSchema)

export default emailTemplates