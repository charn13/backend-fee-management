const mongoose = require('mongoose')
const { Schema } = mongoose;

const teacherSchema = new Schema({
   
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    coursesAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]

})
module.exports = mongoose.model('teacher', teacherSchema)