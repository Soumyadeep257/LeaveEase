import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['employee', 'manager'],
      default: 'employee',
    },
    department: {
      type: String,
      required: true,
      default: 'Engineering',
    },
    leaveBalance: {
      casual: {
        type: Number,
        default: 12,
        min: 0,
      },
      sick: {
        type: Number,
        default: 10,
        min: 0,
      },
      earned: {
        type: Number,
        default: 18,
        min: 0,
      },
    },
    totalQuota: {
      casual: {
        type: Number,
        default: 12,
      },
      sick: {
        type: Number,
        default: 10,
      },
      earned: {
        type: Number,
        default: 18,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
