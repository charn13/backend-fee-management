const mongoose = require('mongoose')
const { Schema } = mongoose;

const courseSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    fee: {
        type: String,
        required: true,
    },
    durationInMonths: { 
        type: Number, 
        required: true 
    } // Course duration in months

})
module.exports = mongoose.model('Course', courseSchema)