import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

// create User Schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      unique: true, // tow users can't have same email
    },
    password: {
      type: String,
      require: function () {
        return !this.googleId && !this.githubId; // Password required only for local auth
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    verificationCode: {
      type: String,
      default: null,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
      select: false,
    },
    resetPasswordCode: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordCodeExpires: {
      type: Date,
      default: null,
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    university: {
      type: String,
      default: null,
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      default: null,
      trim: true,
    },
    degree: {
      type: String,
      enum: ['دیپلم', 'کارشناسی', 'کارشناسی ارشد', 'دکتری', 'فوق دکتری', null],
      default: null,
    },
    bio: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    // OAuth fields
    googleId: {
      type: String,
      default: null,
      sparse: true, // Allow multiple null values
    },
    githubId: {
      type: String,
      default: null,
      sparse: true, // Allow multiple null values
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
  },
  {
    timestamps: true, // Add createAt and updateAt Automatically
  }
);

// Middlewares
// Hash Password before saving it to the database
userSchema.pre('save', async function (next) {
  // Skip password hashing for OAuth users
  if (this.provider !== 'local' || !this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Create User Model based on UserSchema
const User = model('User', userSchema);
export default User;
