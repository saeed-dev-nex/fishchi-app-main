import { generateEmbedding } from '../utils/aiService.js';
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
    },
    tags: [String],
    contentVector: {
      type: [Number], // آرایه‌ای از اعداد
      index: false, // ما از ایندکس MongoDB استفاده نمی‌کنیم
    },
    vectorGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
// --- هوک Post-Save برای تولید وکتور ---
noteSchema.post('save', function (doc) {
  // اگر محتوا تغییر کرده یا وکتور قبلا تولید نشده
  if (doc.isModified('content') || !doc.vectorGenerated) {
    // ما منتظر (await) نمی‌مانیم تا پاسخ کاربر مسدود نشود
    // این فرآیند در پس‌زمینه اجرا می‌شود
    generateEmbedding(doc.content)
      .then((vector) => {
        if (vector) {
          // به‌روزرسانی مستقیم سند با وکتور جدید
          doc.constructor
            .findByIdAndUpdate(doc._id, {
              contentVector: vector,
              vectorGenerated: true,
            })
            .exec();
        }
      })
      .catch((err) =>
        console.error(
          `[AI Vector] Failed to generate embedding for note ${doc._id}:`,
          err.message
        )
      );
  }
});
noteSchema.index({ content: 'text' });
const Note = model('Note', noteSchema);
export default Note;
