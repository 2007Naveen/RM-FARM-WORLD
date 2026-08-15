import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, category } = body;

    if (!transcript) {
      return NextResponse.json({ error: "குரல் பதிவு உரை கிடைக்கவில்லை" }, { status: 400 });
    }

    // இங்கு குரல் பதிவை தரவுத்தளத்தில் சேமிக்கலாம்
    const newLog = {
      id: Date.now(),
      transcript,
      category: category || "GENERAL",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "குரல் பதிவைச் சேமிப்பதில் பிழை ஏற்பட்டது" }, { status: 500 });
  }
}