import {
  Schema,
  model,
  models,
  type Document,
  type Types,
  type Model,
} from "mongoose";

/** A single line in the cart */
export interface CartItem {
  item: Types.ObjectId; // ref: Item
  qty: number;
}

/** Cart doc: keyed by either userId (logged-in) or cartId (guest) */
export interface CartDocument extends Document {
  userId?: Types.ObjectId | null; // ref: User
  cartId?: string | null;         // guest cart stable ID (UUID from frontend)
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<CartItem>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const CartSchema = new Schema<CartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      sparse: true,
      default: null,
    },
    cartId: {
      type: String,
      index: true,
      sparse: true,
      default: null,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        // Cast to any to safely mutate and delete without TS complaining
        const r = ret as any;
        r.id = String(r._id);
        delete r._id;
        delete r.__v;
      },
    },
    toObject: {
      virtuals: true,
      transform(_doc, ret) {
        const r = ret as any;
        r.id = String(r._id);
        delete r._id;
        delete r.__v;
      },
    },
  }
);

/** Helpful indexes */
CartSchema.index({ userId: 1 });
CartSchema.index({ cartId: 1 });

export const Cart: Model<CartDocument> =
  (models.Cart as Model<CartDocument>) || model<CartDocument>("Cart", CartSchema);
