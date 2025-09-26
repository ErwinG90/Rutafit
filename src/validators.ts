// palabra@palabra.com | palabra@palabra.cl
const EMAIL_REGEX = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z][A-Za-z0-9-]*\.(com|cl)$/i;
// mínimo 6, al menos 1 minúscula y 1 MAYÚSCULA
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export const validateEmail = (s: string) => EMAIL_REGEX.test(s.trim());
export const validatePassword = (s: string) => PASS_REGEX.test(s);