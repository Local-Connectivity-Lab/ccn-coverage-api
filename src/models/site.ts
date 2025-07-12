import mongoose from 'mongoose';
import { components } from '../types/schema';

type ISite = components['schemas']['Site'];

interface SiteDoc extends mongoose.Document, ISite {}

interface SiteModelInterface extends mongoose.Model<SiteDoc> {
  build(attr: ISite): SiteDoc;
}

const siteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'confirmed', 'in-conversation'],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    cell_id: {
      type: [String],
      required: true,
    },
    color: {
      type: String,
      required: false,
    },
    boundary: {
      type: [[Number]],
      validate: {
        validator: function (val: number[][]) {
          return val.every(pair => pair.length === 2);
        },
        message: 'Each boundary coordinate must be a pair of [latitude, longitude]',
      },
      required: false,
    },
  },
  {
    versionKey: false,
  }
);

siteSchema.statics.build = (attr: ISite) => {
  return new Site(attr);
};

const Site = mongoose.model<SiteDoc, SiteModelInterface>('Site', siteSchema);

export { Site, ISite, SiteDoc };
