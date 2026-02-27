import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  email: string;
  passwordHash: string;
  name: string;
  institution?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    institution: { type: String },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);