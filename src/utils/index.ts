export const successResponse = (res: any, data: any, message: string = 'Success') => {
  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    message,
    data
  });
};

export const errorResponse = (res: any, message: string, statusCode?: number) => {
  console.log('error', res)
  return res.status(statusCode ?? 500).json({
    status: 'error',
    statusCode: statusCode ?? 500,
    message
  });
};

export const validationErrorResponse = (res: any, errors: any, message: string = 'Validation errors') => {
  return res.status(400).json({
    status: 'fail',
    statusCode: 400,
    message,
    errors
  });
};
