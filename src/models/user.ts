import mongoose from 'mongoose';
import { components } from '../types/schema';

type IUser = components['schemas']['User'];

interface UserDoc extends mongoose.Document, IUser {}

interface UserModelInterface extends mongoose.Model<UserDoc> {
  build(attr: IUser): UserDoc;
  randomBuild(): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    identity: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    registered: {
      type: Boolean,
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    isEnabled: {
      type: Boolean,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    last_online: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

userSchema.statics.build = (attr: IUser) => {
  // TODO: Add timestamp verification
  return new User(attr);
};

const User = mongoose.model<UserDoc, UserModelInterface>('User', userSchema);

export { User, IUser, UserDoc };
