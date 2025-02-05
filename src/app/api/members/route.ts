import { NextRequest, NextResponse } from "next/server";
import connectDb from "../../../lib/mongodb";
import Member from "../../../models/members";
export async function POST(req: NextRequest) {  // Create a new member
  try {
    await connectDb();

    const body = await req.json(); // Read request body
    const { name, percentage }: { name: string; percentage: number } = body;

    if (!name || typeof percentage !== "number") {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const member = new Member({ name, percentage });
    await member.save();

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json({ message: "Error creating member" }, { status: 500 });
  }
}
