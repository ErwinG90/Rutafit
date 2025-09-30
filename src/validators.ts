// palabra@palabra.com | palabra@palabra.cl
const EMAIL_REGEX = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z][A-Za-z0-9-]*\.(com|cl)$/i;
// mínimo 6, al menos 1 minúscula y 1 MAYÚSCULA
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export const validateEmail = (s: string) => EMAIL_REGEX.test(s.trim());
export const validatePassword = (s: string) => PASS_REGEX.test(s);

export function calcularEdadSuave(
    d?: number,
    m?: number,
    a?: number
): { exactaOK: boolean; edad?: number; futura?: boolean; menor16Posible?: boolean } {
    const hoy = new Date();
    const Y = hoy.getFullYear();
    const M = hoy.getMonth() + 1;
    const D = hoy.getDate();

    if (!a) return { exactaOK: false };
    if (a > Y) return { exactaOK: false, futura: true };

    if (!m || !d) {
        if (a > Y - 16) return { exactaOK: false, menor16Posible: true };
        if (a === Y - 16) return { exactaOK: false, menor16Posible: true };
        return { exactaOK: false };
    }

    const nacimiento = new Date(a, m - 1, d);
    if (nacimiento > hoy) return { exactaOK: false, futura: true };

    let edad = Y - a;
    if (m > M || (m === M && d > D)) edad--;
    return { exactaOK: true, edad };
}