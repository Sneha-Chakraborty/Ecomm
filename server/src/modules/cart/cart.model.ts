import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const CartItemSchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    qty: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const toPlainOpts = {
  virtuals: true,
  versionKey: false as const,
  transform(_doc: unknown, ret: any) {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
};

const CartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", default: null }, // no index:true here
    cartId: { type: String, default: null },                      // no index:true here
    items: { type: [CartItemSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: toPlainOpts,
    toObject: toPlainOpts,
  }
);

// Create indexes here (and ONLY here) to avoid duplicate-index warnings
CartSchema.index({ userId: 1 });
CartSchema.index({ cartId: 1 });

type CartProps = InferSchemaType<typeof CartSchema>;
export type CartModel = Model<CartProps>;

export const Cart =
  (models.Cart as CartModel | undefined) || model<CartProps>("Cart", CartSchema);
