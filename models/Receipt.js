const mongoose = require('mongoose')
const { Schema } = mongoose;

const receiptSchema = new Schema({
    student:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    }, // Reference to the student who made the payment
    amountPaid:
    {
        type: Number,
        required: true
    },
    dateOfPayment: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['Cash', 'Credit Card', 'Bank Transfer'], required: true },
    receiptNumber: { type: String, required: true },
    notes: { type: String },
    emailStatus: { type: String, enum: ['SENT', 'NOT_SENT'], default: 'NOT_SENT' } // Status of email notification
})
module.exports = mongoose.model('Receipt', receiptSchema)