const mongoose = require('mongoose')

const { Schema } = mongoose;

const StudentSchema = new Schema({
    name: 
    {   
        type: String, 
        required: true 
    },
    email: {
        type: String, 
        required: true 
    },
    course: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Reference to Course model
    admissionDate: { 
        type: Date, 
        default: Date.now 
    },
    totalFeesPaid: { 
        type: Number, 
        default: 0 
    },
    scholarshipAmount: { 
        type: Number, 
        default: 0 
    },
    pendingFees: { 
        type: Number, 
        default: 0 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    // lastFeePaymentDate: { type: Date, default: Date.now }, // Track last fee payment date
    // nextFeeDueDate: { type: Date, required: true } // Calculate next fee due date based on course duration

  });

  module.exports = mongoose.model('student',StudentSchema)