import { XMLParser } from 'fast-xml-parser';
import { DTE, DTEItem } from '@/types/dte';

const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
  trimValues: true,
});

function cleanValue(value: any): any {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.trim();
  return value;
}

function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object') {
      current = current[key];
    } else {
      return null;
    }
  }
  return cleanValue(current);
}

function normalizePath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (!current) return null;

    if (Array.isArray(current)) {
      current = current.find((item) => item && item[part]) || current[0];
      if (!current) return null;
      current = current[part];
    } else if (current[part]) {
      current = current[part];
    } else {
      return null;
    }
  }

  return cleanValue(current);
}

export function parseXmlDte(xmlContent: string): DTE | null {
  try {
    const parsed = parser.parse(xmlContent);

    const envio = parsed.Envelope || parsed.EnvioDTE || parsed.root;
    if (!envio) {
      console.error('No valid DTE envelope found');
      return null;
    }

    let dte = envio.DTE || envio.Documento || null;
    if (Array.isArray(dte)) {
      dte = dte[0];
    }

    if (!dte) {
      console.error('No DTE document found');
      return null;
    }

    const documento = dte.Documento || dte;
    if (Array.isArray(documento)) {
      dte = documento[0];
    }

    const encabezado = dte?.Encabezado || dte?.encabezado || {};
    const detalle = dte?.Detalle || dte?.detalle || [];
    const totales = dte?.Totales || dte?.totales || {};

    const tipoDTE = parseInt(getNestedValue(encabezado, 'IdDoc.TipoDTE') || 33);
    const folio = parseInt(getNestedValue(encabezado, 'IdDoc.Folio') || 0);
    const fechaEmision = getNestedValue(encabezado, 'IdDoc.FchEmis') || '';
    const formaPago = parseInt(getNestedValue(encabezado, 'IdDoc.FmaPago') || 1) as 1 | 2 | 3;

    const rutEmisor = getNestedValue(encabezado, 'Emisor.RUTEmisor') || '';
    const razonSocialEmisor = getNestedValue(encabezado, 'Emisor.RznSoc') || '';
    const giroEmisor = getNestedValue(encabezado, 'Emisor.GiroEmis') || '';
    const direccionEmisor = getNestedValue(encabezado, 'Emisor.DirOrigen') || '';
    const comunaEmisor = getNestedValue(encabezado, 'Emisor.CmnaOrigen') || '';

    const rutReceptor = getNestedValue(encabezado, 'Receptor.RUTRecep') || '';
    const razonSocialReceptor = getNestedValue(encabezado, 'Receptor.RznSocRecep') || '';
    const giroReceptor = getNestedValue(encabezado, 'Receptor.GiroRecep') || '';
    const direccionReceptor = getNestedValue(encabezado, 'Receptor.DirRecep') || '';
    const comunaReceptor = getNestedValue(encabezado, 'Receptor.CmnaRecep') || '';

    let items: DTEItem[] = [];
    if (detalle) {
      const detalleArray = Array.isArray(detalle) ? detalle : [detalle];
      items = detalleArray.map((item: any, index: number) => ({
        nroLinea: parseInt(item.NroLinDet || item.nroLinDet || index + 1),
        nombreItem: item.NmbItem || item.nombreItem || '',
        descripcion: item.DscItem || item.descripcion || undefined,
        cantidad: item.QtyItem ? parseInt(item.QtyItem) : undefined,
        unidad: item.UnmdItem || item.unidad || undefined,
        precioUnitario: item.PrcItem ? parseInt(item.PrcItem) : undefined,
        descuentoPct: item.DescuentoPct ? parseFloat(item.DescuentoPct) : undefined,
        descuentoMonto: item.DescuentoMnt ? parseInt(item.DescuentoMnt) : undefined,
        montoItem: parseInt(item.MontoItem || item.montoItem || 0),
        indExento: item.IndExe ? (parseInt(item.IndExe) as 1 | 2 | 3) : undefined,
      }));
    }

    const montoNeto = totales.MntNeto ? parseInt(totales.MntNeto) : undefined;
    const montoExento = totales.MntExe ? parseInt(totales.MntExe) : undefined;
    const tasaIVA = totales.TasaIVA ? parseFloat(totales.TasaIVA) : undefined;
    const iva = totales.IVA ? parseInt(totales.IVA) : undefined;
    const montoTotal = parseInt(totales.MntTotal || 0);

    const ted = getNestedValue(dte, 'TED') || '';

    const dteObject: DTE = {
      tipoDTE,
      folio,
      fechaEmision,
      formaPago,
      fechaVencimiento: getNestedValue(encabezado, 'IdDoc.FchVenc') || undefined,
      mntBruto: getNestedValue(encabezado, 'IdDoc.MntBruto') ? 1 : undefined,
      indServicio: getNestedValue(encabezado, 'IdDoc.IndServicio')
        ? (parseInt(getNestedValue(encabezado, 'IdDoc.IndServicio')) as 1 | 2 | 3)
        : undefined,

      rutEmisor,
      razonSocialEmisor,
      giroEmisor,
      actecoEmisor: getNestedValue(encabezado, 'Emisor.Acteco') || undefined,
      direccionEmisor,
      comunaEmisor,
      ciudadEmisor: getNestedValue(encabezado, 'Emisor.CiudadOrigen') || undefined,

      rutReceptor,
      razonSocialReceptor,
      giroReceptor: giroReceptor || undefined,
      direccionReceptor: direccionReceptor || undefined,
      comunaReceptor: comunaReceptor || undefined,
      ciudadReceptor: getNestedValue(encabezado, 'Receptor.CiudadRecep') || undefined,

      items,
      montoNeto,
      montoExento,
      tasaIVA,
      iva,
      montoTotal,
      montoPagos: totales.MontoPagos ? parseInt(totales.MontoPagos) : undefined,
      saldoInsol: totales.SaldoInsol ? parseInt(totales.SaldoInsol) : undefined,

      ted,
      xmlOriginal: xmlContent,
    };

    return dteObject;
  } catch (error: any) {
    console.error('Error parsing DTE XML:', error);
    return null;
  }
}

export function validateDte(dte: DTE): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!dte.tipoDTE) errors.push('TipoDTE is required');
  if (!dte.folio) errors.push('Folio is required');
  if (!dte.fechaEmision) errors.push('FchEmis is required');
  if (dte.formaPago === undefined) errors.push('FmaPago is required for invoices');

  if (!dte.rutEmisor) errors.push('RUTEmisor is required');
  if (!dte.razonSocialEmisor) errors.push('RznSoc (Emisor) is required');
  if (!dte.giroEmisor) errors.push('GiroEmis is required');
  if (!dte.direccionEmisor) errors.push('DirOrigen is required');
  if (!dte.comunaEmisor) errors.push('CmnaOrigen is required');

  if (!dte.rutReceptor) errors.push('RUTRecep is required');
  if (!dte.razonSocialReceptor) errors.push('RznSocRecep is required');

  if (!dte.items || dte.items.length === 0) errors.push('Detalle items are required');

  if (!dte.montoTotal) errors.push('MntTotal is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}
