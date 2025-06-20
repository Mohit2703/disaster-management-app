export const mockAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 1;
  
  req.user = { id: userId };
  next();
};