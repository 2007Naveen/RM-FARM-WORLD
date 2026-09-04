'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. அனைத்து ஆடுகளின் பட்டியலை பெற
export async function getGoats() {
  try {
    return await prisma.goat.findMany({
      include: {
        matingRecords: true,
        vaccinations: true,
        notes: true,
        mother: true,
        kids: true,
      },
      orderBy: { id: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching goats:', error);
    return [];
  }
}

// 2. புதிய ஆடு சேர்க்க
export async function addGoat(data: {
  name: string;
  type: 'GOAT' | 'KID';
  birthDate: string;
  source: 'BORN_HERE' | 'PURCHASED';
  photoUrl?: string;
  motherId?: number;
}) {
  try {
    const newGoat = await prisma.goat.create({
      data: {
        name: data.name,
        type: data.type,
        birthDate: new Date(data.birthDate),
        source: data.source,
        photoUrl: data.photoUrl || null,
        motherId: data.motherId ? Number(data.motherId) : null,
      },
    });

    revalidatePath('/goat');
    return newGoat;
  } catch (error) {
    console.error('Error adding goat:', error);
    throw new Error('Failed to add goat');
  }
}

// 3. இணைசேர்த்தல் (Mating) பதிவு சேர்க்க (150 நாட்கள்)
export async function addGoatMating(goatId: number, date: string) {
  try {
    const matingDate = new Date(date);
    const expectedDeliveryDate = new Date(matingDate);
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 150);

    const newRecord = await prisma.goatMating.create({
      data: {
        goatId: Number(goatId),
        matingDate,
        expectedDeliveryDate,
      },
    });

    revalidatePath('/goat');
    return newRecord;
  } catch (error) {
    console.error('Error adding mating record:', error);
    throw new Error('Failed to add mating record');
  }
}

// 4. சினைப் பதிவை நீக்க (DELETE MATING RECORD)
export async function deleteGoatMating(matingId: number) {
  try {
    const deleted = await prisma.goatMating.delete({
      where: { id: Number(matingId) },
    });

    revalidatePath('/goat');
    return deleted;
  } catch (error) {
    console.error('Error deleting mating record:', error);
    throw new Error('Failed to delete mating record');
  }
}

// 5. தடுப்பூசி பதிவு சேர்க்க
export async function addGoatVaccination(
  goatId: number,
  name: string,
  date: string,
  description?: string
) {
  try {
    const newVaccine = await prisma.goatVaccine.create({
      data: {
        goatId: Number(goatId),
        name,
        date: new Date(date),
        description: description || '',
      },
    });

    revalidatePath('/goat');
    return newVaccine;
  } catch (error) {
    console.error('Error adding vaccination:', error);
    throw new Error('Failed to add vaccination');
  }
}

// 6. தடுப்பூசி பதிவை நீக்க (DELETE VACCINATION)
export async function deleteGoatVaccination(vaccineId: number) {
  try {
    const deleted = await prisma.goatVaccine.delete({
      where: { id: Number(vaccineId) },
    });

    revalidatePath('/goat');
    return deleted;
  } catch (error) {
    console.error('Error deleting vaccination:', error);
    throw new Error('Failed to delete vaccination');
  }
}

// 7. குறிப்பு சேர்க்க
export async function addGoatNote(goatId: number, date: string, text: string) {
  try {
    const newNote = await prisma.goatNote.create({
      data: {
        goatId: Number(goatId),
        date: new Date(date),
        text,
      },
    });

    revalidatePath('/goat');
    return newNote;
  } catch (error) {
    console.error('Error adding note:', error);
    throw new Error('Failed to add note');
  }
}

// 8. குறிப்பை நீக்க (DELETE NOTE)
export async function deleteGoatNote(noteId: number) {
  try {
    const deleted = await prisma.goatNote.delete({
      where: { id: Number(noteId) },
    });

    revalidatePath('/goat');
    return deleted;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('Failed to delete note');
  }
}

// 9. ஆட்டின் வகையை மாற்ற (GOAT <-> KID)
export async function updateGoatType(goatId: number, type: 'GOAT' | 'KID') {
  try {
    const updated = await prisma.goat.update({
      where: { id: Number(goatId) },
      data: { type },
    });

    revalidatePath('/goat');
    return updated;
  } catch (error) {
    console.error('Error updating goat type:', error);
    throw new Error('Failed to update goat type');
  }
}
// goatActions.ts கோப்பில் சேர்க்கப்பட வேண்டிய ஃபங்ஷன்
export async function updateGoatDetails(
  id: number,
  data: {
    name?: string;
    type?: "GOAT" | "KID";
    birthDate?: string;
    source?: "BORN_HERE" | "PURCHASED";
    photoUrl?: string;
    motherId?: number;
  }
) {
  return await prisma.goat.update({
    where: { id },
    data: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
    },
  });
}

// 10. ஆட்டை நீக்க
export async function deleteGoat(goatId: number) {
  try {
    const deleted = await prisma.goat.delete({
      where: { id: Number(goatId) },
    });

    revalidatePath('/goat');
    return deleted;
  } catch (error) {
    console.error('Error deleting goat:', error);
    throw new Error('Failed to delete goat');
  }
}