'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. அனைத்து கோழிகளின் பட்டியலை பெற
export async function getHens() {
  return await prisma.hen.findMany({
    include: {
      incubations: true,
      vaccinations: true,
      notes: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// 2. புதிய கோழி / குஞ்சு சேர்க்க
export async function addHen(data: {
  name: string;
  type: 'HEN' | 'CHICK';
  birthDate: string;
  source: 'BORN_HERE' | 'PURCHASED';
  motherId?: number;
}) {
  const newHen = await prisma.hen.create({
    data: {
      name: data.name,
      type: data.type,
      birthDate: new Date(data.birthDate),
      source: data.source,
      motherId: data.motherId || null,
    },
  });

  revalidatePath('/poultry');
  return newHen;
}

// 3. அடைகாத்தல் (Incubation) பதிவு சேர்க்க
export async function addIncubation(henId: number, startDate: string, eggCount: number) {
  const start = new Date(startDate);
  // கோழி முட்டை பொரிக்க 21 நாட்கள்
  const expectedHatchDate = new Date(start);
  expectedHatchDate.setDate(expectedHatchDate.getDate() + 21);

  const newRecord = await prisma.incubation.create({
    data: {
      henId,
      startDate: start,
      expectedHatchDate,
      eggCount,
    },
  });

  revalidatePath('/poultry');
  return newRecord;
}

// 4. தடுப்பூசி பதிவு சேர்க்க
export async function addPoultryVaccination(henId: number, name: string, date: string, description?: string) {
  const newVaccine = await prisma.poultryVaccine.create({
    data: {
      henId,
      name,
      date: new Date(date),
      description,
    },
  });

  revalidatePath('/poultry');
  return newVaccine;
}

// 5. குறிப்பு சேர்க்க
export async function addPoultryNote(henId: number, date: string, text: string) {
  const newNote = await prisma.poultryNote.create({
    data: {
      henId,
      date: new Date(date),
      text,
    },
  });

  revalidatePath('/poultry');
  return newNote;
}