import { model, Schema } from 'mongoose';

const projectSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'انتخاب عنوان برای پروژه الزامی است'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['در حال انجام', 'خاتمه یافته', 'کنسل شده'],
      default: 'در حال انجام',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    estimatedDuration: {
      type: Number, // تعداد روزهای تخمینی
    },
    priority: {
      type: String,
      enum: ['کم', 'متوسط', 'زیاد', 'فوری'],
      default: 'متوسط',
    },
    tags: [String],
    sources: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Source',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Project = model('Project', projectSchema);
export default Project;
