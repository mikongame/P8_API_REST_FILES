// Wrapper para eliminar los bloques try-catch repetitivos en controladores
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
