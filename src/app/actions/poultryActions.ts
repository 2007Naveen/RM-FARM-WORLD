'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ==========================================
// 1. அனைத்து கோழிகளின் பட்டியலை பெற (தாய்/குஞ்சு உறவுகளுடன்)
// ==========================================
export async function getHens() {
  try {
    const hens = await prisma.hen.findMany({
      include: {
        incubations: {
          orderBy: { startDate: 'desc' },
        },
        vaccinations: {
          orderBy: { date: 'desc' },
        },
        notes: {
          orderBy: { date: 'desc' },
        },
        mother: true,
        chicks: true,
      },
      orderBy: { id: 'desc' },
    });
    return { success: true, data: hens };
  } catch (error) {
    console.error('கோழிகளின் பட்டியலை எடுப்பதில் பிழை:', error);
    return { success: false, error: 'கோழிகளின் பட்டியலை பெற முடியவில்லை' };
  }
}

// ==========================================
// 2. புதிய கோழி / குஞ்சு சேர்க்க
// ==========================================
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
    return { success: true, data: newHen };
  } catch (error) {
    console.error('கோழியை சேர்ப்பதில் பிழை:', error);
    return { success: false, error: 'கோழியை சேர்க்க முடியவில்லை' };
  }
}

// ==========================================
// 3. அடைகாத்தல் (Incubation) பதிவு சேர்க்க (21 நாட்கள்)
// ==========================================
export async function addIncubation(
  henId: number,
  startDate: string,
  eggCount: number
) {
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
    return { success: true, data: newRecord };
  } catch (error) {
    console.error('அடைகாத்தல் பதிவை சேர்ப்பதில் பிழை:', error);
    return { success: false, error: 'அடைகாத்தல் பதிவை சேர்க்க முடியவில்லை' };
  }
}

// ==========================================
// 4. தடுப்பூசி பதிவு சேர்க்க
// ==========================================
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
    return { success: true, data: newVaccine };
  } catch (error) {
    console.error('தடுப்பூசி பதிவை சேர்ப்பதில் பிழை:', error);
    return { success: false, error: 'தடுப்பூசி பதிவை சேர்க்க முடியவில்லை' };
  }
}

// ==========================================
// 5. குறிப்பு (Note) சேர்க்க
// ==========================================
export async function addPoultryNote(
  henId: number,
  date: string,
  text: string
) {
  try {
    const newNote = await prisma.poultryNote.create({
      data: {
        henId: Number(henId),
        date: new Date(date),
        text,
      },
    });

    revalidatePath('/poultry');
    return { success: true, data: newNote };
  } catch (error) {
    console.error('குறிப்பை சேர்ப்பதில் பிழை:', error);
    return { success: false, error: 'குறிப்பை சேர்க்க முடியவில்லை' };
  }
}

// ==========================================
// 6. குஞ்சை பெரிய கோழியாக மாற்ற (HEN <-> CHICK)
// ==========================================
export async function updateHenType(henId: number, type: 'HEN' | 'CHICK') {
  try {
    const updated = await prisma.hen.update({
      where: { id: Number(henId) },
      data: { type },
    });

    revalidatePath('/poultry');
    return { success: true, data: updated };
  } catch (error) {
    console.error('கோழியின் வகையை மாற்றுவதில் பிழை:', error);
    return { success: false, error: 'கோழியின் வகையை மாற்ற முடியவில்லை' };
  }
}

// ==========================================
// 7. கோழியின் விவரங்களை புதுப்பிக்க (Update Hen Details)
// ==========================================
export async function updateHenDetails(
  henId: number,
  data: {
    name?: string;
    type?: 'HEN' | 'CHICK';
    birthDate?: string;
    source?: 'BORN_HERE' | 'PURCHASED';
    photoUrl?: string;
    motherId?: number | null;
  }
) {
  try {
    const updatedHen = await prisma.hen.update({
      where: { id: Number(henId) },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
        ...(data.source && { source: data.source }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
        ...(data.motherId !== undefined && {
          motherId: data.motherId ? Number(data.motherId) : null,
        }),
      },
    });

    revalidatePath('/poultry');
    return { success: true, data: updatedHen };
  } catch (error) {
    console.error('கோழி விவரங்களை புதுப்பிப்பதில் பிழை:', error);
    return { success: false, error: 'கோழி விவரங்களை புதுப்பிக்க முடியவில்லை' };
  }
}

// ==========================================
// 8. கோழியை நீக்க (Delete Hen)
// ==========================================
export async function deleteHen(henId: number) {
  try {
    const deleted = await prisma.hen.delete({
      where: { id: Number(henId) },
    });

    revalidatePath('/poultry');
    return { success: true, data: deleted };
  } catch (error) {
    console.error('கோழியை நீக்குவதில் பிழை:', error);
    return { success: false, error: 'கோழியை நீக்க முடியவில்லை' };
  }
}

// ==========================================
// 9. அடைகாத்தல் பதிவை நீக்க (Delete Incubation)
// ==========================================
export async function deleteIncubation(incubationId: number) {
  try {
    const deleted = await prisma.incubation.delete({
      where: { id: Number(incubationId) },
    });

    revalidatePath('/poultry');
    return { success: true, data: deleted };
  } catch (error) {
    console.error('அடைகாத்தல் பதிவை நீக்குவதில் பிழை:', error);
    return { success: false, error: 'அடைகாத்தல் பதிவை நீக்க முடியவில்லை' };
  }
}

// ==========================================
// 10. தடுப்பூசி பதிவை நீக்க (Delete Vaccination)
// ==========================================
export async function deletePoultryVaccination(vaccineId: number) {
  try {
    const deleted = await prisma.poultryVaccine.delete({
      where: { id: Number(vaccineId) },
    });

    revalidatePath('/poultry');
    return { success: true, data: deleted };
  } catch (error) {
    console.error('தடுப்பூசி பதிவை நீக்குவதில் பிழை:', error);
    return { success: false, error: 'தடுப்பூசி பதிவை நீக்க முடியவில்லை' };
  }
}
// ==========================================
// கோழி விவரங்கள் மற்றும் புகைப்படத்தை எடிட் செய்ய (Edit Hen Details & Photo)
// ==========================================
export async function editHen(
  henId: number,
  data: {
    name: string;
    birthDate: string;
    source: 'BORN_HERE' | 'PURCHASED';
    photoUrl?: string | null;
    motherId?: number | null;
  }
) {
  try {
    const updatedHen = await prisma.hen.update({
      where: { id: Number(henId) },
      data: {
        name: data.name,
        birthDate: new Date(data.birthDate),
        source: data.source,
        photoUrl: data.photoUrl || null,
        motherId: data.motherId ? Number(data.motherId) : null,
      },
    });

    revalidatePath('/poultry');
    return { success: true, data: updatedHen };
  } catch (error) {
    console.error('கோழி விவரங்களை திருத்துவதில் பிழை:', error);
    return { success: false, error: 'விவரங்களை புதுப்பிக்க முடியவில்லை' };
  }
}
// ==========================================
// 11. குறிப்பை நீக்க (Delete Note)
// ==========================================
export async function deletePoultryNote(noteId: number) {
  try {
    const deleted = await prisma.poultryNote.delete({
      where: { id: Number(noteId) },
    });

    revalidatePath('/poultry');
    return { success: true, data: deleted };
  } catch (error) {
    console.error('குறிப்பை நீக்குவதில் பிழை:', error);
    return { success: false, error: 'குறிப்பை நீக்க முடியவில்லை' };
  }
}