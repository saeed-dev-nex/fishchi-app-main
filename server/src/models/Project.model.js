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
    tags: [String],
  },
  {
    timestamps: true,
  }
);

const Project = model('Project', projectSchema);
export default Project;
