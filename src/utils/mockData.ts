import { DTE, DTEListItem } from '@/types/dte';

export const MOCK_DTE_LIST: DTEListItem[] = [
  {
    folio: 12001,
    rutEmisor: '12345678-9',
    razonSocialEmisor: 'Proveedor Comercial SPA',
    fechaEmision: '2026-07-15',
    montoTotal: 119000,
    tipoDTE: 33,
    estado: 'Activo',
  },
  {
    folio: 12002,
    rutEmisor: '98765432-1',
    razonSocialEmisor: 'Distribuidora General LTDA',
    fechaEmision: '2026-07-14',
    montoTotal: 248500,
    tipoDTE: 33,
    estado: 'Activo',
  },
  {
    folio: 12003,
    rutEmisor: '55555555-5',
    razonSocialEmisor: 'Servicios Profesionales SA',
    fechaEmision: '2026-07-13',
    montoTotal: 85000,
    tipoDTE: 34,
    estado: 'Activo',
  },
  {
    folio: 12004,
    rutEmisor: '12345678-9',
    razonSocialEmisor: 'Proveedor Comercial SPA',
    fechaEmision: '2026-07-12',
    montoTotal: 156000,
    tipoDTE: 33,
    estado: 'Activo',
  },
  {
    folio: 12005,
    rutEmisor: '77777777-7',
    razonSocialEmisor: 'Importadora del Pacífico',
    fechaEmision: '2026-07-11',
    montoTotal: 425000,
    tipoDTE: 33,
    estado: 'Activo',
  },
];

export const MOCK_DTE_DETAIL: DTE = {
  tipoDTE: 33,
  folio: 12001,
  fechaEmision: '2026-07-15',
  formaPago: 1,
  fechaVencimiento: undefined,
  mntBruto: undefined,
  indServicio: undefined,

  rutEmisor: '12345678-9',
  razonSocialEmisor: 'Proveedor Comercial SPA',
  giroEmisor: 'Comercio al por mayor de artículos de consumo',
  actecoEmisor: '4611',
  direccionEmisor: 'Av. Providencia 1234, Piso 10',
  comunaEmisor: 'Providencia',
  ciudadEmisor: 'Santiago',

  rutReceptor: '76543210-K',
  razonSocialReceptor: 'Mi Empresa LTDA',
  giroReceptor: 'Comercio al por menor',
  direccionReceptor: 'Calle Principal 567, Local 3',
  comunaReceptor: 'Las Condes',
  ciudadReceptor: 'Santiago',

  items: [
    {
      nroLinea: 1,
      nombreItem: 'Artículos de consumo - Categoría A',
      descripcion: 'Producto de primera calidad, importado',
      cantidad: 100,
      unidad: 'UN',
      precioUnitario: 500,
      descuentoPct: 5,
      descuentoMonto: 2500,
      montoItem: 47500,
      indExento: undefined,
    },
    {
      nroLinea: 2,
      nombreItem: 'Artículos de consumo - Categoría B',
      descripcion: 'Producto estándar, stock nacional',
      cantidad: 50,
      unidad: 'UN',
      precioUnitario: 750,
      descuentoPct: 0,
      descuentoMonto: 0,
      montoItem: 37500,
      indExento: undefined,
    },
    {
      nroLinea: 3,
      nombreItem: 'Gastos de despacho y manipuleo',
      descripcion: 'Transporte y logística',
      cantidad: 1,
      unidad: 'GLB',
      precioUnitario: 15000,
      descuentoPct: 0,
      descuentoMonto: 0,
      montoItem: 15000,
      indExento: undefined,
    },
  ],

  montoNeto: 100000,
  montoExento: 0,
  tasaIVA: 19,
  iva: 19000,
  montoTotal: 119000,
  montoPagos: undefined,
  saldoInsol: undefined,

  ted: '<TED><DD><RE>12345678-9</RE><TD>33</TD><F>12001</F><FE>2026-07-15</FE><RR>76543210-K</RR><RSR>Mi Empresa LTDA</RSR><MNT>119000</MNT><IT1>47500</IT1><IT2>37500</IT2><IT3>15000</IT3><TSTED>2026-07-15T14:30:00</TSTED></DD></TED>',
  timbreFecha: '2026-07-15T14:30:00',
  timbreResolucion: '80/2023',

  xmlOriginal: `<?xml version="1.0" encoding="ISO-8859-1"?>
<EnvioDTE version="1.0">
  <SetDTE ID="SetDTE_1">
    <Caratula version="1.0">
      <RutEmisor>12345678-9</RutEmisor>
      <RutEnvia>12345678-9</RutEnvia>
      <RutReceptor>76543210-K</RutReceptor>
      <FchResol>2023-01-01</FchResol>
      <NroResol>80</NroResol>
      <TmstFirma>2026-07-15T14:35:00</TmstFirma>
      <Periodo>202607</Periodo>
    </Caratula>
    <DTE version="1.0">
      <Documento ID="F12001">
        <Encabezado>
          <IdDoc>
            <TipoDTE>33</TipoDTE>
            <Folio>12001</Folio>
            <FchEmis>2026-07-15</FchEmis>
            <FmaPago>1</FmaPago>
            <MntBruto/>
          </IdDoc>
          <Emisor>
            <RUTEmisor>12345678-9</RUTEmisor>
            <RznSoc>Proveedor Comercial SPA</RznSoc>
            <GiroEmis>Comercio al por mayor</GiroEmis>
            <Acteco>4611</Acteco>
            <DirOrigen>Av. Providencia 1234, Piso 10</DirOrigen>
            <CmnaOrigen>Providencia</CmnaOrigen>
            <CiudadOrigen>Santiago</CiudadOrigen>
          </Emisor>
          <Receptor>
            <RUTRecep>76543210-K</RUTRecep>
            <RznSocRecep>Mi Empresa LTDA</RznSocRecep>
            <GiroRecep>Comercio al por menor</GiroRecep>
            <DirRecep>Calle Principal 567, Local 3</DirRecep>
            <CmnaRecep>Las Condes</CmnaRecep>
            <CiudadRecep>Santiago</CiudadRecep>
          </Receptor>
        </Encabezado>
        <Detalle>
          <Item>
            <NroLinDet>1</NroLinDet>
            <NmbItem>Artículos de consumo - Categoría A</NmbItem>
            <DscItem>Producto de primera calidad, importado</DscItem>
            <QtyItem>100</QtyItem>
            <UnmdItem>UN</UnmdItem>
            <PrcItem>500</PrcItem>
            <DescuentoPct>5</DescuentoPct>
            <DescuentoMnt>2500</DescuentoMnt>
            <MontoItem>47500</MontoItem>
          </Item>
          <Item>
            <NroLinDet>2</NroLinDet>
            <NmbItem>Artículos de consumo - Categoría B</NmbItem>
            <DscItem>Producto estándar, stock nacional</DscItem>
            <QtyItem>50</QtyItem>
            <UnmdItem>UN</UnmdItem>
            <PrcItem>750</PrcItem>
            <MontoItem>37500</MontoItem>
          </Item>
          <Item>
            <NroLinDet>3</NroLinDet>
            <NmbItem>Gastos de despacho y manipuleo</NmbItem>
            <DrcItem>Transporte y logística</DrcItem>
            <QtyItem>1</QtyItem>
            <UnmdItem>GLB</UnmdItem>
            <PrcItem>15000</PrcItem>
            <MontoItem>15000</MontoItem>
          </Item>
        </Detalle>
        <Totales>
          <MntNeto>100000</MntNeto>
          <MntExe/>
          <TasaIVA>19</TasaIVA>
          <IVA>19000</IVA>
          <MntTotal>119000</MntTotal>
        </Totales>
        <TED>${'<TED><DD>...</DD></TED>'}</TED>
      </Documento>
    </DTE>
  </SetDTE>
</EnvioDTE>`,
};

/**
 * Obtiene un DTE mock basado en el folio
 * Busca en MOCK_DTE_LIST y retorna un DTE completo con datos del folio especificado
 */
export function getMockDTEByFolio(folioNumber: number): DTE {
  const listItem = MOCK_DTE_LIST.find((item) => item.folio === folioNumber);

  if (!listItem) {
    return MOCK_DTE_DETAIL;
  }

  // Construir XML dinámico explícitamente
  let xmlContent = '<?xml version="1.0" encoding="ISO-8859-1"?>\n';
  xmlContent += '<EnvioDTE version="1.0">\n';
  xmlContent += '  <SetDTE ID="SetDTE_1">\n';
  xmlContent += '    <Caratula version="1.0">\n';
  xmlContent += `      <RutEmisor>${listItem.rutEmisor}</RutEmisor>\n`;
  xmlContent += `      <RutEnvia>${listItem.rutEmisor}</RutEnvia>\n`;
  xmlContent += `      <RutReceptor>${MOCK_DTE_DETAIL.rutReceptor}</RutReceptor>\n`;
  xmlContent += '      <FchResol>2023-01-01</FchResol>\n';
  xmlContent += '      <NroResol>80</NroResol>\n';
  xmlContent += `      <TmstFirma>${listItem.fechaEmision}T14:35:00</TmstFirma>\n`;
  xmlContent += '      <Periodo>202607</Periodo>\n';
  xmlContent += '    </Caratula>\n';
  xmlContent += '    <DTE version="1.0">\n';
  xmlContent += `      <Documento ID="F${folioNumber}">\n`;
  xmlContent += '        <Encabezado>\n';
  xmlContent += '          <IdDoc>\n';
  xmlContent += `            <TipoDTE>${listItem.tipoDTE}</TipoDTE>\n`;
  xmlContent += `            <Folio>${folioNumber}</Folio>\n`;
  xmlContent += `            <FchEmis>${listItem.fechaEmision}</FchEmis>\n`;
  xmlContent += '            <FmaPago>1</FmaPago>\n';
  xmlContent += '            <MntBruto/>\n';
  xmlContent += '          </IdDoc>\n';
  xmlContent += '          <Emisor>\n';
  xmlContent += `            <RUTEmisor>${listItem.rutEmisor}</RUTEmisor>\n`;
  xmlContent += `            <RznSoc>${listItem.razonSocialEmisor}</RznSoc>\n`;
  xmlContent += '            <GiroEmis>Comercio general</GiroEmis>\n';
  xmlContent += '            <Acteco>4611</Acteco>\n';
  xmlContent += `            <DirOrigen>${MOCK_DTE_DETAIL.direccionEmisor}</DirOrigen>\n`;
  xmlContent += `            <CmnaOrigen>${MOCK_DTE_DETAIL.comunaEmisor}</CmnaOrigen>\n`;
  xmlContent += `            <CiudadOrigen>${MOCK_DTE_DETAIL.ciudadEmisor}</CiudadOrigen>\n`;
  xmlContent += '          </Emisor>\n';
  xmlContent += '          <Receptor>\n';
  xmlContent += `            <RUTRecep>${MOCK_DTE_DETAIL.rutReceptor}</RUTRecep>\n`;
  xmlContent += `            <RznSocRecep>${MOCK_DTE_DETAIL.razonSocialReceptor}</RznSocRecep>\n`;
  xmlContent += `            <GiroRecep>${MOCK_DTE_DETAIL.giroReceptor}</GiroRecep>\n`;
  xmlContent += `            <DirRecep>${MOCK_DTE_DETAIL.direccionReceptor}</DirRecep>\n`;
  xmlContent += `            <CmnaRecep>${MOCK_DTE_DETAIL.comunaReceptor}</CmnaRecep>\n`;
  xmlContent += `            <CiudadRecep>${MOCK_DTE_DETAIL.ciudadReceptor}</CiudadRecep>\n`;
  xmlContent += '          </Receptor>\n';
  xmlContent += '        </Encabezado>\n';
  xmlContent += '        <Detalle>\n';
  xmlContent += '          <Item><NroLinDet>1</NroLinDet><NmbItem>Artículos de consumo - Categoría A</NmbItem><QtyItem>100</QtyItem><UnmdItem>UN</UnmdItem><PrcItem>500</PrcItem><MontoItem>47500</MontoItem></Item>\n';
  xmlContent += '          <Item><NroLinDet>2</NroLinDet><NmbItem>Artículos de consumo - Categoría B</NmbItem><QtyItem>50</QtyItem><UnmdItem>UN</UnmdItem><PrcItem>750</PrcItem><MontoItem>37500</MontoItem></Item>\n';
  xmlContent += '          <Item><NroLinDet>3</NroLinDet><NmbItem>Gastos de despacho</NmbItem><QtyItem>1</QtyItem><UnmdItem>GLB</UnmdItem><PrcItem>15000</PrcItem><MontoItem>15000</MontoItem></Item>\n';
  xmlContent += '        </Detalle>\n';
  xmlContent += '        <Totales>\n';
  xmlContent += '          <MntNeto>100000</MntNeto>\n';
  xmlContent += '          <MntExe/>\n';
  xmlContent += '          <TasaIVA>19</TasaIVA>\n';
  xmlContent += '          <IVA>19000</IVA>\n';
  xmlContent += `          <MntTotal>${listItem.montoTotal}</MntTotal>\n`;
  xmlContent += '        </Totales>\n';
  xmlContent += '      </Documento>\n';
  xmlContent += '    </DTE>\n';
  xmlContent += '  </SetDTE>\n';
  xmlContent += '</EnvioDTE>';

  // Crear DTE con los datos del folio encontrado
  const dte: DTE = {
    ...MOCK_DTE_DETAIL,
    folio: listItem.folio,
    fechaEmision: listItem.fechaEmision,
    razonSocialEmisor: listItem.razonSocialEmisor,
    rutEmisor: listItem.rutEmisor,
    tipoDTE: listItem.tipoDTE,
    montoTotal: listItem.montoTotal,
    // DEBUG: Agregar folio al nombre del receptor para verificar
    razonSocialReceptor: `[FOLIO_${folioNumber}] ${MOCK_DTE_DETAIL.razonSocialReceptor}`,
    xmlOriginal: xmlContent,
  };

  console.log(`[DEBUG] getMockDTEByFolio(${folioNumber}) returning DTE with folio=${dte.folio}`);

  return dte;
}
