'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. அனைத்து கோழிகளின் பட்டியலை பெற (தாய்/குஞ்சு உறவுகளுடன்)
export async function getHens() {
  try {
    return await prisma.hen.findMany({
      include: {
        incubations: true,
        vaccinations: true,
        notes: true,
        mother: true,
        chicks: true,
      },
      orderBy: { id: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching hens:', error);
    return [];
  }
}

// 2. புதிய கோழி / குஞ்சு சேர்க்க
export async function addHen(data: {
  name: string;
  type: 'HEN' | 'CHICK';
  birthDate: string;
  source: 'BORN_HERE' | 'PURCHASED';
  photoUrl?: string;
  motherId?: number;
}) {
  try {
    const newHen = await prisma.hen.create({
      data: {
        name: data.name,
        type: data.type,
        birthDate: new Date(data.birthDate),
        source: data.source,
        photoUrl: data.photoUrl || null,
        motherId: data.motherId ? Number(data.motherId) : null,
      },
    });

    revalidatePath('/poultry');
    return newHen;
  } catch (error) {
    console.error('Error adding hen:', error);
    throw new Error('Failed to add hen');
  }
}

// 3. அடைகாத்தல் (Incubation) பதிவு சேர்க்க (21 நாட்கள் அடைகாக்கும் காலம்)
export async function addIncubation(henId: number, startDate: string, eggCount: number) {
  try {
    const start = new Date(startDate);
    const expectedHatchDate = new Date(start);
    expectedHatchDate.setDate(expectedHatchDate.getDate() + 21);

    const newRecord = await prisma.incubation.create({
      data: {
        henId: Number(henId),
        startDate: start,
        expectedHatchDate,
        eggCount: Number(eggCount) || 0,
      },
    });

    revalidatePath('/poultry');
    return newRecord;
  } catch (error) {
    console.error('Error adding incubation:', error);
    throw new Error('Failed to add incubation record');
  }
}

// 4. தடுப்பூசி பதிவு சேர்க்க
export async function addPoultryVaccination(
  henId: number,
  name: string,
  date: string,
  description?: string
) {
  try {
    const newVaccine = await prisma.poultryVaccine.create({
      data: {
        henId: Number(henId),
        name,
        date: new Date(date),
        description: description || '',
      },
    });

    revalidatePath('/poultry');
    return newVaccine;
  } catch (error) {
    console.error('Error adding poultry vaccination:', error);
    throw new Error('Failed to add vaccination');
  }
}

// 5. குறிப்பு சேர்க்க
export async function addPoultryNote(henId: number, date: string, text: string) {
  try {
    const newNote = await prisma.poultryNote.create({
      data: {
        henId: Number(henId),
        date: new Date(date),
        text,
      },
    });

    revalidatePath('/poultry');
    return newNote;
  } catch (error) {
    console.error('Error adding poultry note:', error);
    throw new Error('Failed to add note');
  }
}

// 6. குஞ்சை பெரிய கோழியாக மாற்ற (HEN <-> CHICK)
export async function updateHenType(henId: number, type: 'HEN' | 'CHICK') {
  try {
    const updated = await prisma.hen.update({
      where: { id: Number(henId) },
      data: { type },
    });

    revalidatePath('/poultry');
    return updated;
  } catch (error) {
    console.error('Error updating hen type:', error);
    throw new Error('Failed to update hen type');
  }
}

// 7. கோழியை நீக்க
export async function deleteHen(henId: number) {
  try {
    const deleted = await prisma.hen.delete({
      where: { id: Number(henId) },
    });

    revalidatePath('/poultry');
    return deleted;
  } catch (error) {
    console.error('Error deleting hen:', error);
    throw new Error('Failed to delete hen');
  }
}

// 8. அடைகாத்தல் பதிவை நீக்க (DELETE INCUBATION)
export async function deleteIncubation(incubationId: number) {
  try {
    const deleted = await prisma.incubation.delete({
      where: { id: Number(incubationId) },
    });

    revalidatePath('/poultry');
    return deleted;
  } catch (error) {
    console.error('Error deleting incubation:', error);
    throw new Error('Failed to delete incubation');
  }
}

// 9. தடுப்பூசி பதிவை நீக்க (DELETE VACCINATION)
export async function deletePoultryVaccination(vaccineId: number) {
  try {
    const deleted = await prisma.poultryVaccine.delete({
      where: { id: Number(vaccineId) },
    });

    revalidatePath('/poultry');
    return deleted;
  } catch (error) {
    console.error('Error deleting poultry vaccination:', error);
    throw new Error('Failed to delete vaccination');
  }
}

// 10. குறிப்பை நீக்க (DELETE NOTE)
export async function deletePoultryNote(noteId: number) {
  try {
    const deleted = await prisma.poultryNote.delete({
      where: { id: Number(noteId) },
    });

    revalidatePath('/poultry');
    return deleted;
  } catch (error) {
    console.error('Error deleting poultry note:', error);
    throw new Error('Failed to delete note');
  }
}