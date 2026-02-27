// This is a testing endpoint for database connections!

// app/api/test/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.user.findMany();
    return NextResponse.json({ 
      success: true, 
      message: "Database connected!",
      students 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Database connection failed", 
      error: String(error) 
    }, { status: 500 });
  }
}