import { Schema, model } from 'mongoose';

const authorSchema = new Schema({
  name: { type: String, require: true },
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
  },
  { timestamps: true }
);

// Add indexes for fast searching and sorting
sourceSchema.index({
  title: 'text',
  abstract: 'text',
  'authors.name': 'text',
  tags: 'text',
});
sourceSchema.index({ user: 1, createdAt: -1 });
sourceSchema.index({ user: 1, title: 1 });
sourceSchema.index({ user: 1, year: -1 });
sourceSchema.index({ user: 1, 'authors.name': 1 });
sourceSchema.index({ user: 1, tags: 1 });

const Source = model('Source', sourceSchema);
export default Source;
