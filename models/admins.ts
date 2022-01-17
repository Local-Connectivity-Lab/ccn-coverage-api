import mongoose from 'mongoose';
import { Request } from 'express'

interface IAdmin {
  uid: string,
  token: string,
  expiration: Date
}


interface ITokenRequest extends Request {
  uid: string,
  token: string
}
interface IExpressUser extends Request {
  uid: string,
}

interface AdminModelInterface extends mongoose.Model<AdminDoc> {
  build(attr: IAdmin): AdminDoc
}

interface AdminDoc extends mongoose.Document {
  uid: string,
  token: string,
  exp: Date
}

const adminSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  exp: {
    type: Date,
    required: true
  }
}, {
  versionKey: false
})


adminSchema.statics.build = (attr: IAdmin) => {
  // TODO: Add timestamp verification
  return new Admin(attr);
}

const Admin = mongoose.model<AdminDoc, AdminModelInterface>('Admin', adminSchema)

export { Admin, IAdmin, AdminDoc, IExpressUser, ITokenRequest }
