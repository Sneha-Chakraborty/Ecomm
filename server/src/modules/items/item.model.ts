import { Schema, model, models, Model, Types, Document } from "mongoose";

export interface ItemDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category: string;
  brand?: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<ItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, lowercase: true },
    brand: { type: String, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

// Compound index for common filtering
ItemSchema.index({ category: 1, price: 1 });

// Text index for simple search by q
ItemSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 10, description: 5 }, name: "ItemTextIndex" }
);

export const Item: Model<ItemDocument> =
  (models.Item as Model<ItemDocument>) || model<ItemDocument>("Item", ItemSchema);
