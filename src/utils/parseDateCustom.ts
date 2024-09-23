import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const parseDateCustom = (date?: string) => {
  const timeZone = 'America/Sao_Paulo'; // Ajuste conforme necessário

  // Ajustar a data para UTC
  let startDate: Date;
  let endDate: Date;

  if (date) {
    const parsedDate = parseISO(date as string);
    startDate = startOfDay(toZonedTime(parsedDate, timeZone));
    endDate = endOfDay(toZonedTime(parsedDate, timeZone));
  } else {
    const currentDate = new Date();
    startDate = startOfDay(toZonedTime(currentDate, timeZone));
    endDate = endOfDay(toZonedTime(currentDate, timeZone));
  }
  return {
    startDate,
    endDate,
  };
};
