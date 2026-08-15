// தேதிகளுடன் நாட்களைக் கூட்டும் பங்க்ஷன்
export function addDays(date: Date | string, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// மாடு சினைக்காலம் கணக்கீடு (+280 நாட்கள்)
export function calculateCowDeliveryDate(inseminationDate: Date | string): Date {
  return addDays(inseminationDate, 280);
}

// ஆடு சினைக்காலம் கணக்கீடு (+150 நாட்கள்)
export function calculateGoatDeliveryDate(inseminationDate: Date | string): Date {
  return addDays(inseminationDate, 150);
}

// ஆடு/மாடு சினைக்கால 30 நாள் சிவப்பு நிறக் குறியீடுகள் (Red Marks)
export function getMonthlyRedMarks(inseminationDate: Date | string, totalMonths: number) {
  const marks = [];
  const start = new Date(inseminationDate);
  for (let i = 1; i <= totalMonths; i++) {
    const nextMonth = addDays(start, i * 30);
    marks.push({
      month: i,
      date: nextMonth.toISOString().split("T")[0],
      label: `${i}-ஆம் மாதம் நிறைவு`,
    });
  }
  return marks;
}

// கோழிப் பண்ணை தடுப்பூசி அட்டவணை தானியங்கி கணிப்பு
export function calculatePoultrySchedule(hatchDate: Date | string) {
  return {
    day7VaccineDate: addDays(hatchDate, 7),     // F1 / B1
    day12VaccineDate: addDays(hatchDate, 12),   // IBD / Gumboro
    day22VaccineDate: addDays(hatchDate, 22),   // Lasota Booster
    beakTrimmingDate: addDays(hatchDate, 14),   // மூக்கு வெட்டுதல்
    immutonDate: addDays(hatchDate, 3),         // Immuton
    bactinilDate: addDays(hatchDate, 5),        // Bactinil
  };
}

// தேதிகளுக்கு இடையிலான நாட்களைக் கணக்கிடுதல்
export function calculateDateDifference(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  return { totalDays, months, days };
}

// வட்டி கணக்கீடு (மாத வட்டி)
export function calculateSimpleInterest(principal: number, monthlyRate: number, months: number) {
  const monthlyInterest = (principal * monthlyRate) / 100;
  const totalInterest = monthlyInterest * months;
  const totalAmount = principal + totalInterest;

  return { totalInterest, totalAmount };
}