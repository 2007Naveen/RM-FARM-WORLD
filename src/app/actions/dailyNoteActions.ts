'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. அனைத்து தினசரி குறிப்புகளையும் பெற
export async function getDailyNotes() {
  return await prisma.dailyNote.findMany({
    orderBy: { date: 'desc' },
  });
}

// 2. புதிய குறிப்பு சேர்க்க
export async function addDailyNote(data: { title: string; content: string; category?: string }) {
  const newNote = await prisma.dailyNote.create({
    data: {
      title: data.title,
      content: data.content,
      category: data.category || null,
    },
  });

  revalidatePath('/api/notes');
  return newNote;
}

// 3. குறிப்பை நீக்க
export async function deleteDailyNote(id: number) {
  await prisma.dailyNote.delete({
    where: { id },
  });

  revalidatePath('/api/notes');
}