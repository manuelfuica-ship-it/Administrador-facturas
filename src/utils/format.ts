export function formatCurrency(amount: number, locale: string = 'es-CL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRUT(rut: string): string {
  const clean = rut.replace(/\D/g, '');
  if (clean.length < 2) return rut;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

export function validateRUT(rut: string): boolean {
  const cleanRut = rut.replace(/\D/g, '');
  if (cleanRut.length < 7 || cleanRut.length > 8) return false;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier++;
    if (multiplier > 7) multiplier = 2;
  }

  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();

  return dv.toUpperCase() === calculatedDV;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getDTETypeName(tipoDTE: number): string {
  const names: Record<number, string> = {
    33: 'Factura Electrónica',
    34: 'Factura No Afecta o Exenta',
    52: 'Guía de Despacho',
    56: 'Nota de Débito',
    61: 'Nota de Crédito',
    39: 'Boleta Electrónica',
    46: 'Factura de Compra',
  };
  return names[tipoDTE] || `DTE ${tipoDTE}`;
}

export function getPaymentTypeName(formaPago: number): string {
  const types: Record<number, string> = {
    1: 'Contado',
    2: 'Crédito',
    3: 'Sin costo',
  };
  return types[formaPago] || 'Desconocido';
}

export function calculateIVA(monto: number, tasa: number = 19): number {
  return Math.round((monto * tasa) / 100);
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
