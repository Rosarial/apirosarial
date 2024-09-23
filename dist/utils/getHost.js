"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHost = void 0;
const getHost = (req) => {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}`;
};
exports.getHost = getHost;
