import { NextRequest, NextResponse } from "next/server";
import connectDb from "../../../../lib/mongodb";
import Member from "../../../../models/members";


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDb();
    const member = await Member.findById(params.id);

    if (!member) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching member" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDb();
    const { name, percentage }: { name: string; percentage: number } = await req.json();

    const member = await Member.findByIdAndUpdate(
      params.id,
      { name, percentage },
      { new: true }
    );

    if (!member) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDb();
    const member = await Member.findByIdAndDelete(params.id);

    if (!member) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Member deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting member" }, { status: 500 });
  }
}
