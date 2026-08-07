export interface CalendarInfo {
  date: Date;
  isHoliday: boolean;
  isFestival: boolean;
  eventDescription?: string;
  loadImpactMultiplier: number; // e.g., 0.8 for holidays (lower industrial load), 1.2 for festivals (higher residential load)
}

export class CalendarService {
  /**
   * Identifies if a given date is a major holiday or festival.
   * Uses a static rule-based approach to avoid external API rate limits.
   */
  public getCalendarInfo(targetDate: Date = new Date()): CalendarInfo {
    const month = targetDate.getMonth() + 1; // 1-12
    const day = targetDate.getDate();
    
    let isHoliday = false;
    let isFestival = false;
    let eventDescription = '';
    let loadImpactMultiplier = 1.0;

    // Fixed Holidays (Example: Global / US / India mix for demo)
    if (month === 1 && day === 1) {
      isHoliday = true;
      eventDescription = "New Year's Day";
      loadImpactMultiplier = 0.85; // Offices closed
    } else if (month === 12 && day === 25) {
      isHoliday = true;
      isFestival = true;
      eventDescription = "Christmas";
      loadImpactMultiplier = 1.15; // High residential load (lighting, heating)
    } else if (month === 10 && day >= 25 && day <= 31) {
      // Mocking Diwali period
      isFestival = true;
      eventDescription = "Diwali Festival Period";
      loadImpactMultiplier = 1.30; // Massive lighting load
    } else if (month === 7 && day === 4) {
      isHoliday = true;
      eventDescription = "Independence Day";
      loadImpactMultiplier = 0.90;
    }

    // Weekend Check
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      isHoliday = true;
      if (!eventDescription) eventDescription = "Weekend";
      loadImpactMultiplier = 0.85; // Standard weekend load drop
    }

    return {
      date: targetDate,
      isHoliday,
      isFestival,
      eventDescription,
      loadImpactMultiplier
    };
  }
}

export const calendarService = new CalendarService();
