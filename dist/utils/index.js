"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationErrorResponse = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message = 'Success') => {
    return res.status(200).json({
        status: 'success',
        statusCode: 200,
        message,
        data,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message, statusCode) => {
    console.log(res.name
        ? '\x1b[31m' + res.name + '\n' + res.message + '\n' + res.stack
        : '');
    return res.status(statusCode ?? 500).json({
        status: 'Error',
        statusCode: statusCode ?? 500,
        message,
    });
};
exports.errorResponse = errorResponse;
const validationErrorResponse = (res, errors, message = 'Validation errors') => {
    return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message,
        errors,
    });
};
exports.validationErrorResponse = validationErrorResponse;
