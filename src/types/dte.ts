export interface DTEItem {
  nroLinea: number;
  nombreItem: string;
  descripcion?: string;
  cantidad?: number;
  unidad?: string;
  precioUnitario?: number;
  descuentoPct?: number;
  descuentoMonto?: number;
  montoItem: number;
  indExento?: 1 | 2 | 3;
}

export interface DTE {
  tipoDTE: number;
  folio: number;
  fechaEmision: string;
  formaPago: 1 | 2 | 3;
  fechaVencimiento?: string;
  mntBruto?: 1;
  indServicio?: 1 | 2 | 3;

  rutEmisor: string;
  razonSocialEmisor: string;
  giroEmisor: string;
  actecoEmisor?: string;
  direccionEmisor: string;
  comunaEmisor: string;
  ciudadEmisor?: string;

  rutReceptor: string;
  razonSocialReceptor: string;
  giroReceptor?: string;
  direccionReceptor?: string;
  comunaReceptor?: string;
  ciudadReceptor?: string;

  items: DTEItem[];

  montoNeto?: number;
  montoExento?: number;
  tasaIVA?: number;
  iva?: number;
  montoTotal: number;
  montoPagos?: number;
  saldoInsol?: number;

  ted: string;
  timbreFecha?: string;
  timbreResolucion?: string;

  xmlOriginal?: string;
}

export interface DTEListItem {
  folio: number;
  rutEmisor: string;
  razonSocialEmisor: string;
  fechaEmision: string;
  montoTotal: number;
  tipoDTE: number;
  estado: string;
}

export interface AuthSession {
  token: string;
  expiresAt: number;
  rut: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
