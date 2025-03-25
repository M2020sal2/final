import { Document, Types } from "mongoose";

export enum Roles {
  User = "user",
  Admin = "admin",
  Instructor = "instructor",
}

export interface Iuser extends Document {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  age?: number;
  phone?: string;
  role?: Roles;
  isConfirmed?: boolean;
  isOnline?: boolean;
  avatar?: string;
  jobTitle?: string;
  code?:number;
}


