import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// அனைத்து குறிப்புகளையும் பெறுதல் (Get all notes)
export async function GET() {
  try {
    const notes = await prisma.dailyNote.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

// புதிய குறிப்பை சேமித்தல் (Create a new note)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const newNote = await prisma.dailyNote.create({
      data: { title: "Daily note", content: text },
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

// குறிப்பை நீக்குதல் (Delete a note)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.dailyNote.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}