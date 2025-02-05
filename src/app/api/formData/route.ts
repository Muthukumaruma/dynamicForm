import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/mongodb";
import FormData from "@/models/formData";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const data = await req.json();

    // Validate required fields
    if (!data.primaryDetails || !data.otherDetails || !data.addressDetails || !data.members) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newForm = new FormData(data);
    await newForm.save();

    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    console.error("Error creating form data:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDb();
    const forms = await FormData.find();
    return NextResponse.json(forms, { status: 200 });
  } catch (error) {
    console.error("Error fetching form data:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDb();
    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required for update" }, { status: 400 });
    }

    const updatedForm = await FormData.findByIdAndUpdate(id, data, { new: true });

    if (!updatedForm) {
      return NextResponse.json({ message: "Form data not found" }, { status: 404 });
    }

    return NextResponse.json(updatedForm, { status: 200 });
  } catch (error) {
    console.error("Error updating form data:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDb();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required for deletion" }, { status: 400 });
    }

    const deletedForm = await FormData.findByIdAndDelete(id);

    if (!deletedForm) {
      return NextResponse.json({ message: "Form data not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Form data deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting form data:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
