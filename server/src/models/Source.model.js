import { Schema, model } from 'mongoose';
import { generateEmbedding } from '../utils/aiService.js';

const authorSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
});

const sourceSchema = new Schema(
  {
    // --- Key links
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: [true, 'عنوان منبع الزامی است'],
      trim: true,
    },
    authors: [authorSchema],
    year: { type: Number },
    //   ---- Source type
    type: {
      type: String,
      enum: ['book', 'article', 'thesis', 'website', 'other'],
      default: 'book',
    },
    //   ---- Language
    language: {
      type: String,
      enum: ['persian', 'english'],
      default: 'english',
    },
    //   Publisher Detail
    publicationDetails: {
      journal: { type: String },
      publisher: { type: String },
      volume: { type: String },
      issue: { type: String },
      pages: { type: String },
    },
    //   ---- Links and identifiers
    identifiers: {
      doi: { type: String },
      isbn: { type: String },
      // issn: { type: String },
      url: { type: String },
    },
    abstract: { type: String, trim: true },
    tags: [String],

    rawCSL: {
      type: Object,
    },
    // --- فیلدهای جدید برای جستجوی معنایی ---
    searchVector: {
      type: [Number],
      index: false,
    },
    vectorGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Add indexes for fast searching and sorting
sourceSchema.index({ user: 1, createdAt: -1 });
sourceSchema.index({ user: 1, title: 1 });
sourceSchema.index({ user: 1, year: -1 });
sourceSchema.index({ user: 1, 'authors.firstname': 1 });
sourceSchema.index({ user: 1, 'authors.lastname': 1 });
sourceSchema.index({ user: 1, tags: 1 });
sourceSchema.index({ user: 1, language: 1 });

// --- هوک Post-Save برای تولید وکتور ---
sourceSchema.post('save', function (doc) {
  if (
    doc.isModified('title') ||
    doc.isModified('abstract') ||
    !doc.vectorGenerated
  ) {
    // ترکیب عنوان و چکیده برای یک وکتور بهتر
    const textToEmbed = `${doc.title || ''} ${doc.abstract || ''}`;

    generateEmbedding(textToEmbed)
      .then((vector) => {
        if (vector) {
          doc.constructor
            .findByIdAndUpdate(doc._id, {
              searchVector: vector,
              vectorGenerated: true,
            })
            .exec();
        }
      })
      .catch((err) =>
        console.error(
          `[AI Vector] Failed to generate embedding for source ${doc._id}:`,
          err.message
        )
      );
  }
});

const Source = model('Source', sourceSchema);
export default Source;
