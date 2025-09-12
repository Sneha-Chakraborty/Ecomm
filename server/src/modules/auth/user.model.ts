import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const toPlainOpts = {
  virtuals: true,
  versionKey: false as const, // removes __v automatically
  transform(_doc: unknown, ret: any) {
    // add id, remove _id and passwordHash from serialized output
    ret.id = String(ret._id);
    delete ret._id;
    if ("passwordHash" in ret) delete ret.passwordHash;
    return ret;
  },
};

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    toJSON: toPlainOpts,
    toObject: toPlainOpts,
  }
);

// IMPORTANT: do not also declare a duplicate index via UserSchema.index({ email: 1 })
// The field options above already create it.

type UserProps = InferSchemaType<typeof UserSchema>;
export type UserModel = Model<UserProps>;

export const User =
  (models.User as UserModel | undefined) || model<UserProps>("User", UserSchema);
