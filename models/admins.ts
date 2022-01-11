import mongoose from 'mongoose';
import { Request } from 'express'

interface IAdmin {
  uid: string,
}

interface IExpressUser extends Request {
  uid: string,
}

interface AdminModelInterface extends mongoose.Model<AdminDoc> {
  build(attr: IAdmin): AdminDoc
  randomBuild(): AdminDoc
}

interface AdminDoc extends mongoose.Document {
  uid: string,
}

const adminSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
}, {
  versionKey: false
})


adminSchema.statics.build = (attr: IAdmin) => {
  // TODO: Add timestamp verification
  return new Admin(attr);
}

const Admin = mongoose.model<AdminDoc, AdminModelInterface>('Admin', adminSchema)

export { Admin, IAdmin, IExpressUser }
