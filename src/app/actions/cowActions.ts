'use server';

import { revalidatePath } from 'next/cache';
// உங்கள் Prisma Client இறக்குமதியைச் சரிபார்க்கவும் (e.g., import { prisma } from '@/lib/prisma')
import { prisma } from '@/lib/prisma'; 

export async function getCattle() {
  try {
    const cattles = await prisma.cattle.findMany({
      include: {
        inseminations: true,
        vaccinations: true,
        notes: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
    return cattles;
  } catch (error) {
    console.error('Error fetching cattle:', error);
    return [];
  }
}

export async function addCattle(data: {
  name: string;
  type: 'COW' | 'CALF';
  birthDate: string;
  source: 'BORN_HERE' | 'PURCHASED';
  photoUrl?: string;
  motherId?: number;
}) {
  try {
    const newCattle = await prisma.cattle.create({
      data: {
        name: data.name,
        type: data.type,
        birthDate: new Date(data.birthDate),
        source: data.source,
        photoUrl: data.photoUrl || null,
        motherId: data.motherId || null,
      },
    });
    revalidatePath('/cow');
    return newCattle;
  } catch (error) {
    console.error('Error adding cattle:', error);
    throw new Error('Failed to add cattle');
  }
}

export async function addInsemination(cattleId: number, inseminationDate: string) {
  try {
    const insemDate = new Date(inseminationDate);
    const expectedDelivery = new Date(insemDate);
    expectedDelivery.setDate(expectedDelivery.getDate() + 283);

    const newInsemination = await prisma.insemination.create({
      data: {
        cattleId,
        inseminationDate: insemDate,
        expectedDeliveryDate: expectedDelivery,
      },
    });
    revalidatePath('/cow');
    return newInsemination;
  } catch (error) {
    console.error('Error adding insemination:', error);
    throw new Error('Failed to add insemination');
  }
}

export async function addVaccination(
  cattleId: number,
  name: string,
  date: string,
  description?: string
) {
  try {
    const newVaccination = await prisma.cattleVaccine.create({
      data: {
        cattleId,
        name,
        date: new Date(date),
        description: description || '',
      },
    });
    revalidatePath('/cow');
    return newVaccination;
  } catch (error) {
    console.error('Error adding vaccination:', error);
    throw new Error('Failed to add vaccination');
  }
}

export async function addNote(cattleId: number, date: string, text: string) {
  try {
    const newNote = await prisma.cattleNote.create({
      data: {
        cattleId,
        date: new Date(date),
        text,
      },
    });
    revalidatePath('/cow');
    return newNote;
  } catch (error) {
    console.error('Error adding note:', error);
    throw new Error('Failed to add note');
  }
}

export async function updateCattleType(cattleId: number, type: 'COW' | 'CALF') {
  try {
    const updated = await prisma.cattle.update({
      where: { id: cattleId },
      data: { type },
    });
    revalidatePath('/cow');
    return updated;
  } catch (error) {
    console.error('Error updating cattle type:', error);
    throw new Error('Failed to update cattle type');
  }
}

export async function deleteCattle(cattleId: number) {
  try {
    const deleted = await prisma.cattle.delete({
      where: { id: cattleId },
    });
    revalidatePath('/cow');
    return deleted;
  } catch (error) {
    console.error('Error deleting cattle:', error);
    throw new Error('Failed to delete cattle');
  }
}