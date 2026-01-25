import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String,
  createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  attendedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
}, {
  timestamps: true
});

// Hook para hashear password antes de guardar
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

export default mongoose.model('User', userSchema);
