import mongoose, { Schema, Document } from "mongoose";

export interface Member {
  id: string;
  percentage: string;
}

export interface FormData extends Document {
  primaryDetails: {
    name: string;
    email: string;
    mobile: string;
    gender: string;
  };
  otherDetails: {
    annualIncome: string;
    occupation: string;
  };
  addressDetails: {
    address1: string;
    address2: string;
    zipcode: string;
    state: string;
    city: string;
    district: string;
  };
  members: Member[];
}

const FormDataSchema = new Schema<FormData>({
  primaryDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    gender: { type: String, required: true },
  },
  otherDetails: {
    annualIncome: { type: String, required: true },
    occupation: { type: String, required: true },
  },
  addressDetails: {
    address1: { type: String, required: true },
    address2: { type: String, required: true },
    zipcode: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
  },
  members: [
    {
      id: { type: String, required: true },
      percentage: { type: String, required: true },
    },
  ],
});

export default mongoose.models.FormData || mongoose.model<FormData>("FormData", FormDataSchema);
