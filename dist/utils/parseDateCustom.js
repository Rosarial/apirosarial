"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateCustom = void 0;
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
const parseDateCustom = (date) => {
    const timeZone = 'America/Sao_Paulo'; // Ajuste conforme necessário
    // Ajustar a data para UTC
    let startDate;
    let endDate;
    if (date) {
        const parsedDate = (0, date_fns_1.parseISO)(date);
        startDate = (0, date_fns_1.startOfDay)((0, date_fns_tz_1.toZonedTime)(parsedDate, timeZone));
        endDate = (0, date_fns_1.endOfDay)((0, date_fns_tz_1.toZonedTime)(parsedDate, timeZone));
    }
    else {
        const currentDate = new Date();
        startDate = (0, date_fns_1.startOfDay)((0, date_fns_tz_1.toZonedTime)(currentDate, timeZone));
        endDate = (0, date_fns_1.endOfDay)((0, date_fns_tz_1.toZonedTime)(currentDate, timeZone));
    }
    return {
        startDate,
        endDate,
    };
};
exports.parseDateCustom = parseDateCustom;
