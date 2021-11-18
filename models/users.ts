import mongoose from 'mongoose';

interface IUser {
  identity: string,
  public_key: string,
  last_online: string
}

interface UserModelInterface extends mongoose.Model<UserDoc> {
  build(attr: IUser): UserDoc
  randomBuild(): UserDoc
}

interface UserDoc extends mongoose.Document {
  identity: string,
  public_key: string,
  last_online: string
}

const userSchema = new mongoose.Schema({
  identity: {
    type: String,
    required: true
  },
  public_key: {
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

export { User, IUser }
