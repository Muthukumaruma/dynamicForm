import mongoose, { Document, Schema } from "mongoose";

// Defining the type for a Member
export interface Member extends Document {
  name: string;
  percentage: number;
}

const memberSchema = new Schema<Member>({
  name: { type: String, required: true },
  percentage: { type: Number, required: true },
});

const Member = mongoose.models.Member || mongoose.model<Member>("Member", memberSchema);

export default Member;
