function errorHandler(err, _req, res, _next) {
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.issues?.map((issue) => ({ path: issue.path.join('.'), message: issue.message })) || []
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) {
    console.error(err);
  }
  return res.status(status).json({ message });
}

module.exports = { errorHandler };