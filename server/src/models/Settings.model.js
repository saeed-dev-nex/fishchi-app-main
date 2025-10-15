import { Schema, model } from 'mongoose';

// Settings Schema
const settingsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // General Settings
    general: {
      language: {
        type: String,
        enum: ['fa', 'en'],
        default: 'fa',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
      timezone: {
        type: String,
        default: 'Asia/Tehran',
      },
      dateFormat: {
        type: String,
        enum: ['jalali', 'gregorian'],
        default: 'jalali',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        projectUpdates: {
          type: Boolean,
          default: true,
        },
        sourceUpdates: {
          type: Boolean,
          default: true,
        },
        systemUpdates: {
          type: Boolean,
          default: true,
        },
      },
    },
    // Privacy Settings
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'private',
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showProjects: {
        type: Boolean,
        default: false,
      },
      allowSearch: {
        type: Boolean,
        default: true,
      },
      dataSharing: {
        analytics: {
          type: Boolean,
          default: true,
        },
        marketing: {
          type: Boolean,
          default: false,
        },
      },
    },
    // Application Settings
    application: {
      autoSave: {
        type: Boolean,
        default: true,
      },
      autoSaveInterval: {
        type: Number,
        default: 30, // seconds
        min: 5,
        max: 300,
      },
      defaultProjectView: {
        type: String,
        enum: ['grid', 'list'],
        default: 'grid',
      },
      defaultSourceView: {
        type: String,
        enum: ['grid', 'list'],
        default: 'list',
      },
      itemsPerPage: {
        type: Number,
        default: 20,
        min: 5,
        max: 100,
      },
      showTutorials: {
        type: Boolean,
        default: true,
      },
    },
    // Export Settings
    export: {
      defaultFormat: {
        type: String,
        enum: ['bibtex', 'ris', 'apa', 'mla', 'chicago'],
        default: 'bibtex',
      },
      includeAbstract: {
        type: Boolean,
        default: true,
      },
      includeKeywords: {
        type: Boolean,
        default: true,
      },
      includeDOI: {
        type: Boolean,
        default: true,
      },
      includeURL: {
        type: Boolean,
        default: false,
      },
    },
    // Backup Settings
    backup: {
      autoBackup: {
        type: Boolean,
        default: false,
      },
      backupFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly',
      },
      backupRetention: {
        type: Number,
        default: 30, // days
        min: 7,
        max: 365,
      },
      includeProjects: {
        type: Boolean,
        default: true,
      },
      includeSources: {
        type: Boolean,
        default: true,
      },
      includeNotes: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create Settings Model
const Settings = model('Settings', settingsSchema);

export default Settings;
