import { Schema, model } from 'mongoose';

const noteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    source: {
      type: Schema.Types.ObjectId,
      ref: 'Source',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    pageRef: {
      type: String,
      required: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);
noteSchema.index({ content: 'text' });
const Note = model('Note', noteSchema);
export default Note;
