import mongoose from 'mongoose';

interface IUser {
  identity: string,
  email: string,
  firstName: string,
  lastName: string,
  registered: boolean,
  issueDate: Date,
  publicKey: string,
  lastOnline: string
}

interface UserModelInterface extends mongoose.Model<UserDoc> {
  build(attr: IUser): UserDoc
  randomBuild(): UserDoc
}

interface UserDoc extends mongoose.Document {
  identity: string,
  email: string,
  firstNamme: string,
  lastName: string,
  registered: boolean,
  issueDate: Date,
  publicKey: string,
  lastOnline: string
}

const userSchema = new mongoose.Schema({
  identity: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  registered: {
    type: Boolean,
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  last_online: {
    type: Date,
    required: true
  }
}, {
  versionKey: false
})


userSchema.statics.build = (attr: IUser) => {
  // TODO: Add timestamp verification
  return new User(attr);
}

const User = mongoose.model<UserDoc, UserModelInterface>('User', userSchema)

export { User, IUser, UserDoc }
