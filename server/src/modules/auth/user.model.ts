import { Schema, model, models, Model, Types, Document } from "mongoose";

export interface UserDocument extends Document {
  _id: Types.ObjectId;      // concrete _id type so .toString() is known
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export const User: Model<UserDocument> =
  (models.User as Model<UserDocument>) || model<UserDocument>("User", UserSchema);
