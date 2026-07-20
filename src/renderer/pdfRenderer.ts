import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DTE } from '@/types/dte';

const DTE_NAMES: Record<number, string> = {
  33: 'FACTURA ELECTRÓNICA',
  34: 'FACTURA NO AFECTA O EXENTA ELECTRÓNICA',
  52: 'GUÍA DE DESPACHO ELECTRÓNICA',
  56: 'NOTA DE DÉBITO ELECTRÓNICA',
  61: 'NOTA DE CRÉDITO ELECTRÓNICA',
  39: 'BOLETA ELECTRÓNICA',
  46: 'FACTURA DE COMPRA ELECTRÓNICA',
};

export class DTEPDFRenderer {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  currentY: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 10;
    this.currentY = this.margin;
  }

  render(dte: DTE): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        this.renderHeader(dte);
        this.renderEmitterInfo(dte);
        this.renderDetailTable(dte);
        this.renderTotals(dte);
        this.renderFooter(dte);

        const pdfBuffer = Buffer.from(this.doc.output('arraybuffer'));
        resolve(pdfBuffer);
      } catch (error) {
        reject(error);
      }
    });
  }

  private renderHeader(dte: DTE): void {
    const w = this.pageWidth - this.margin * 2;

    // Emisor izquierda
    this.doc.setFontSize(12);
    this.doc.setFont('Helvetica', 'bold');
    this.doc.text(dte.razonSocialEmisor, this.margin, this.currentY);
    this.currentY += 5;

    this.doc.setFontSize(8);
    this.doc.setFont('Helvetica', 'normal');
    this.doc.text(`GIRO: ${dte.giroEmisor}`, this.margin, this.currentY);
    this.currentY += 3;
    this.doc.text(`Dirección: ${dte.direccionEmisor}`, this.margin, this.currentY);
    this.currentY += 3;
    this.doc.text(`${dte.comunaEmisor}`, this.margin, this.currentY);

    // Documento derecha con recuadro rojo profesional
    const boxX = this.pageWidth - this.margin - 80;
    const boxY = this.currentY - 11;
    const boxW = 80;
    const boxH = 26;

    this.doc.setDrawColor(255, 0, 0);
    this.doc.setLineWidth(1.5);
    this.doc.rect(boxX, boxY, boxW, boxH);

    // RUT adentro arriba
    this.doc.setTextColor(255, 0, 0);
    this.doc.setFontSize(8);
    this.doc.setFont('Helvetica', 'bold');
    this.doc.text(`R.U.T.: ${dte.rutEmisor}`, boxX + boxW / 2, boxY + 4, { align: 'center' });

    // Tipo de documento centrado
    this.doc.setFontSize(11);
    this.doc.setFont('Helvetica', 'bold');
    this.doc.text(DTE_NAMES[dte.tipoDTE] || 'DTE', boxX + boxW / 2, boxY + 11, { align: 'center' });

    // Folio
    this.doc.setFontSize(10);
    this.doc.text(`N° ${dte.folio}`, boxX + boxW / 2, boxY + 17, { align: 'center' });

    // Texto abajo - Ciudad del emisor
    this.doc.setFontSize(7);
    const ciudadText = `S.I.I. - ${(dte.ciudadEmisor || 'SANTIAGO').toUpperCase()}`;
    this.doc.text(ciudadText, boxX + boxW / 2, boxY + 22, { align: 'center' });

    this.doc.setTextColor(0, 0, 0);
    this.currentY += 20;
  }

  private renderEmitterInfo(dte: DTE): void {
    const w = this.pageWidth - this.margin * 2;

    // Tabla de información
    const infoData = [
      [
        { content: 'R.U.T', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: dte.rutReceptor, styles: { fontSize: 7 } },
        { content: 'FECHA EMISIÓN', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: dte.fechaEmision, styles: { fontSize: 7 } },
      ],
      [
        { content: 'NOMBRE', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: dte.razonSocialReceptor, styles: { fontSize: 7 } },
        { content: 'EMAIL', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: '', styles: { fontSize: 7 } },
      ],
      [
        { content: 'GIRO', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: dte.giroReceptor || '-', styles: { fontSize: 7 } },
        { content: 'HUESPED', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: '', styles: { fontSize: 7 } },
      ],
      [
        { content: 'DIRECCIÓN', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: dte.direccionReceptor || '', styles: { fontSize: 7 } },
        { content: 'N° RESERVA', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: '', styles: { fontSize: 7 } },
      ],
      [
        { content: 'COMUNA', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: dte.comunaReceptor || '', styles: { fontSize: 7 } },
        { content: 'CAJERO', styles: { fontStyle: 'bold', fontSize: 7 } },
        { content: '', styles: { fontSize: 7 } },
      ],
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      body: infoData as any,
      columnStyles: {
        0: { cellWidth: w * 0.15 },
        1: { cellWidth: w * 0.35 },
        2: { cellWidth: w * 0.15 },
        3: { cellWidth: w * 0.35 },
      },
      margin: { left: this.margin, right: this.margin },
      cellPadding: 1.5,
    } as any);

    this.currentY = (this.doc as any).lastAutoTable.finalY + 3;
  }

  private renderDetailTable(dte: DTE): void {
    const w = this.pageWidth - this.margin * 2;

    // Tabla de detalles
    const rows = dte.items.map((item) => [
      { content: item.nombreItem, styles: { fontSize: 8 } },
      { content: item.montoItem.toLocaleString('es-CL'), styles: { fontSize: 8, halign: 'right' } },
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['DESCRIPCIÓN', 'TOTAL']],
      body: rows as any,
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'right', cellWidth: 40 },
      },
      margin: { left: this.margin, right: this.margin },
      lineWidth: 0.2,
    } as any);

    this.currentY = (this.doc as any).lastAutoTable.finalY + 4;
  }

  private renderTotals(dte: DTE): void {
    const w = this.pageWidth - this.margin * 2;
    const tableWidth = 70; // Ancho de la tabla de totales
    const tableX = this.pageWidth - this.margin - tableWidth; // Alineada a la derecha

    // Construir las filas de la tabla de totales
    const totalsData: any[] = [];

    // Monto Exento
    if (dte.montoExento && dte.montoExento > 0) {
      totalsData.push([
        { content: 'MONTO EXENTO', styles: { fontSize: 7, fontStyle: 'bold' } },
        { content: `$${dte.montoExento.toLocaleString('es-CL')}`, styles: { fontSize: 7, halign: 'right' } },
      ]);
    }

    // Monto Neto (Afecto)
    if (dte.montoNeto) {
      totalsData.push([
        { content: 'MONTO NETO', styles: { fontSize: 7, fontStyle: 'bold' } },
        { content: `$${dte.montoNeto.toLocaleString('es-CL')}`, styles: { fontSize: 7, halign: 'right' } },
      ]);
    }

    // IVA
    if (dte.iva && dte.tasaIVA) {
      totalsData.push([
        { content: `${dte.tasaIVA}% I.V.A`, styles: { fontSize: 7, fontStyle: 'bold' } },
        { content: `$${dte.iva.toLocaleString('es-CL')}`, styles: { fontSize: 7, halign: 'right' } },
      ]);
    }

    // Monto Total
    totalsData.push([
      { content: 'MONTO TOTAL', styles: { fontSize: 8, fontStyle: 'bold', fillColor: [200, 200, 200] } },
      { content: `$${dte.montoTotal.toLocaleString('es-CL')}`, styles: { fontSize: 8, fontStyle: 'bold', halign: 'right', fillColor: [200, 200, 200] } },
    ]);

    // Renderizar tabla de totales alineada a la derecha
    autoTable(this.doc, {
      startY: this.currentY,
      body: totalsData as any,
      columnStyles: {
        0: { cellWidth: tableWidth * 0.55 },
        1: { cellWidth: tableWidth * 0.45 },
      },
      margin: { left: tableX, right: this.margin },
      lineWidth: 0.2,
      cellPadding: 2,
      didDrawPage: (data: any) => {
        this.currentY = (this.doc as any).lastAutoTable.finalY + 2;
      }
    } as any);

    this.currentY = (this.doc as any).lastAutoTable.finalY + 4;
  }

  private renderFooter(dte: DTE): void {
    const barcodeY = this.pageHeight - this.margin - 20;

    // Barcode placeholder
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, barcodeY, 40, 15);

    this.doc.setFontSize(6);
    this.doc.setFont('Helvetica', 'bold');
    this.doc.text('TIMBRE', this.margin + 20, barcodeY + 7.5, { align: 'center' });
    this.doc.text('ELECTRÓNICO', this.margin + 20, barcodeY + 11, { align: 'center' });

    // Información de SII
    this.doc.setFontSize(7);
    this.doc.setFont('Helvetica', 'normal');
    this.doc.text('Timbre Electrónico SII', this.margin, barcodeY - 2);
  }
}

export async function renderDTE(dte: DTE): Promise<Buffer> {
  const renderer = new DTEPDFRenderer();
  return renderer.render(dte);
}
