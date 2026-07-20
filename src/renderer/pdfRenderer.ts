import PDFDocument from 'pdfkit';
import { DTE } from '@/types/dte';
import { PDF417Generator, formatTED } from './pdf417Generator';

const DTE_NAMES: Record<number, string> = {
  33: 'FACTURA ELECTRÓNICA',
  34: 'FACTURA NO AFECTA O EXENTA ELECTRÓNICA',
  52: 'GUÍA DE DESPACHO ELECTRÓNICA',
  56: 'NOTA DE DÉBITO ELECTRÓNICA',
  61: 'NOTA DE CRÉDITO ELECTRÓNICA',
  39: 'BOLETA ELECTRÓNICA',
  46: 'FACTURA DE COMPRA ELECTRÓNICA',
};

const PAYMENT_TYPES: Record<number, string> = {
  1: 'Contado',
  2: 'Crédito',
  3: 'Sin costo',
};

export class DTEPDFRenderer {
  doc: PDFDocument;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  currentY: number;

  constructor() {
    this.doc = new PDFDocument({
      size: 'letter',
      margin: 40,
      bufferPages: true,
    });

    this.pageWidth = this.doc.page.width;
    this.pageHeight = this.doc.page.height;
    this.margin = 40;
    this.currentY = this.margin;
  }

  render(dte: DTE): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        this.renderHeader(dte);
        this.renderDocumentType(dte);
        this.renderReceptorData(dte);
        this.renderDetailTable(dte);
        this.renderTotals(dte);
        this.renderReceiptAcknowledgment(dte);
        this.renderBarcode(dte);

        const buffers: Buffer[] = [];
        this.doc.on('data', (chunk) => buffers.push(chunk));
        this.doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
        this.doc.on('error', (err) => {
          reject(err);
        });

        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private renderHeader(dte: DTE): void {
    const rightX = this.pageWidth - this.margin - 200;

    this.doc.fontSize(10).font('Helvetica-Bold').text(dte.razonSocialEmisor, rightX, this.currentY, {
      width: 180,
      align: 'right',
    });

    this.currentY += 18;
    this.doc.fontSize(8).font('Helvetica').text(`Giro: ${dte.giroEmisor}`, rightX, this.currentY, {
      width: 180,
      align: 'right',
    });

    this.currentY += 12;
    this.doc.fontSize(8).text(`${dte.direccionEmisor}, ${dte.comunaEmisor}`, rightX, this.currentY, {
      width: 180,
      align: 'right',
    });

    this.currentY += 12;
    this.doc.fontSize(8).text(`RUT: ${dte.rutEmisor}`, rightX, this.currentY, {
      width: 180,
      align: 'right',
    });

    this.currentY += 12;
    this.doc.fontSize(8).text(`Fecha: ${dte.fechaEmision}`, rightX, this.currentY, {
      width: 180,
      align: 'right',
    });

    this.currentY += 20;
  }

  private renderDocumentType(dte: DTE): void {
    const boxY = this.currentY;
    const boxHeight = 30;
    const rightX = this.pageWidth - this.margin - 200;
    const boxWidth = 180;

    this.doc.rect(rightX, boxY, boxWidth, boxHeight).stroke();

    this.doc.fontSize(11).font('Helvetica-Bold').text(DTE_NAMES[dte.tipoDTE] || 'DTE', rightX + 5, boxY + 3, {
      width: boxWidth - 10,
      align: 'center',
    });

    this.doc.fontSize(9).font('Helvetica').text(`Folio N°: ${dte.folio}`, rightX + 5, boxY + 15, {
      width: boxWidth - 10,
      align: 'center',
    });

    this.currentY = boxY + boxHeight + 10;
  }

  private renderReceptorData(dte: DTE): void {
    this.doc.fontSize(9).font('Helvetica-Bold').text('RECEPTOR:', this.margin, this.currentY);
    this.currentY += 12;

    this.doc.fontSize(8).font('Helvetica').text(`RUT: ${dte.rutReceptor}`, this.margin + 10, this.currentY);
    this.currentY += 10;

    this.doc.text(`Razón Social: ${dte.razonSocialReceptor}`, this.margin + 10, this.currentY);
    this.currentY += 10;

    if (dte.giroReceptor) {
      this.doc.text(`Giro: ${dte.giroReceptor}`, this.margin + 10, this.currentY);
      this.currentY += 10;
    }

    if (dte.direccionReceptor) {
      this.doc.text(`Dirección: ${dte.direccionReceptor}`, this.margin + 10, this.currentY);
      this.currentY += 10;
    }

    if (dte.comunaReceptor) {
      this.doc.text(
        `Comuna: ${dte.comunaReceptor}${dte.ciudadReceptor ? ', ' + dte.ciudadReceptor : ''}`,
        this.margin + 10,
        this.currentY,
      );
      this.currentY += 10;
    }

    this.doc.text(`Forma de Pago: ${PAYMENT_TYPES[dte.formaPago]}`, this.margin + 10, this.currentY);
    this.currentY += 10;

    if (dte.fechaVencimiento && dte.formaPago === 2) {
      this.doc.text(`Fecha Vencimiento: ${dte.fechaVencimiento}`, this.margin + 10, this.currentY);
      this.currentY += 10;
    }

    this.currentY += 8;
  }

  private renderDetailTable(dte: DTE): void {
    const tableY = this.currentY;
    const rowHeight = 12;
    const headerHeight = 14;
    const colWidths = [30, 12, 180, 30, 30, 40];
    const totalColWidth = colWidths.reduce((a, b) => a + b, 0);
    const startX = this.margin;

    this.doc.fontSize(7).font('Helvetica-Bold');

    const headers = ['Cantidad', 'Unid', 'Descripción', 'P. Unit', 'Desc', 'Total'];
    let currentX = startX;

    this.doc.rect(startX, tableY, totalColWidth, headerHeight).stroke();

    for (let i = 0; i < headers.length; i++) {
      this.doc.text(headers[i], currentX + 2, tableY + 2, {
        width: colWidths[i] - 4,
        align: i === 2 ? 'left' : 'right',
        height: headerHeight - 4,
      });
      currentX += colWidths[i];
    }

    let detailY = tableY + headerHeight;
    this.doc.fontSize(7).font('Helvetica');

    for (const item of dte.items) {
      const itemHeight = rowHeight;

      this.doc.rect(startX, detailY, totalColWidth, itemHeight).stroke();

      currentX = startX;
      const values = [
        item.cantidad?.toString() || '1',
        item.unidad || '',
        item.nombreItem,
        item.precioUnitario?.toLocaleString('es-CL') || '',
        item.descuentoMonto ? `-${item.descuentoMonto.toLocaleString('es-CL')}` : '',
        item.montoItem.toLocaleString('es-CL'),
      ];

      for (let i = 0; i < values.length; i++) {
        this.doc.text(values[i], currentX + 2, detailY + 2, {
          width: colWidths[i] - 4,
          align: i === 2 ? 'left' : 'right',
          height: itemHeight - 4,
        });
        currentX += colWidths[i];
      }

      detailY += itemHeight;
    }

    this.currentY = detailY + 8;
  }

  private renderTotals(dte: DTE): void {
    const rightX = this.pageWidth - this.margin - 120;
    const labelWidth = 60;
    const valueWidth = 60;

    this.doc.fontSize(8).font('Helvetica');

    if (dte.montoExento) {
      this.doc.text('Total Exento:', rightX - labelWidth, this.currentY, { width: labelWidth, align: 'right' });
      this.doc.text(dte.montoExento.toLocaleString('es-CL'), rightX, this.currentY, {
        width: valueWidth,
        align: 'right',
      });
      this.currentY += 10;
    }

    if (dte.montoNeto) {
      this.doc.text('Subtotal Neto:', rightX - labelWidth, this.currentY, { width: labelWidth, align: 'right' });
      this.doc.text(dte.montoNeto.toLocaleString('es-CL'), rightX, this.currentY, {
        width: valueWidth,
        align: 'right',
      });
      this.currentY += 10;
    }

    if (dte.iva && dte.tasaIVA) {
      this.doc.font('Helvetica-Bold');
      this.doc.text(`IVA (${dte.tasaIVA}%):`, rightX - labelWidth, this.currentY, { width: labelWidth, align: 'right' });
      this.doc.text(dte.iva.toLocaleString('es-CL'), rightX, this.currentY, {
        width: valueWidth,
        align: 'right',
      });
      this.doc.font('Helvetica');
      this.currentY += 10;
    }

    this.doc.font('Helvetica-Bold').fontSize(10);
    this.doc.text('TOTAL:', rightX - labelWidth, this.currentY, { width: labelWidth, align: 'right' });
    this.doc.text(dte.montoTotal.toLocaleString('es-CL'), rightX, this.currentY, {
      width: valueWidth,
      align: 'right',
    });

    this.currentY += 12;
    this.doc.font('Helvetica').fontSize(8);
  }

  private renderReceiptAcknowledgment(dte: DTE): void {
    if (![33, 34].includes(dte.tipoDTE)) {
      return;
    }

    this.currentY += 10;

    const boxWidth = 200;
    const boxHeight = 50;

    this.doc.rect(this.margin, this.currentY, boxWidth, boxHeight).stroke();

    this.doc.fontSize(8).font('Helvetica-Bold').text('ACUSE DE RECIBO', this.margin + 5, this.currentY + 3, {
      width: boxWidth - 10,
      align: 'center',
    });

    this.doc.fontSize(7).font('Helvetica');

    this.doc.text('Nombre: _________________________', this.margin + 5, this.currentY + 15);
    this.doc.text('RUT: _______________  Fecha: __________', this.margin + 5, this.currentY + 25);
    this.doc.text('Recinto: _________________________', this.margin + 5, this.currentY + 35);

    this.currentY += boxHeight + 10;
  }

  private renderBarcode(dte: DTE): void {
    const barcodeY = this.pageHeight - this.margin - 30;
    const barcodeX = this.margin;
    const barcodeWidth = 40;
    const barcodeHeight = 20;

    try {
      const tedData = formatTED(dte.ted);
      PDF417Generator.embedBarcode(this.doc, tedData, barcodeX, barcodeY, barcodeWidth, barcodeHeight);
    } catch (error) {
      console.error('Error rendering barcode:', error);
      this.doc.fontSize(6).text('[TIMBRE]', barcodeX, barcodeY);
    }
  }
}

export async function renderDTE(dte: DTE): Promise<Buffer> {
  const renderer = new DTEPDFRenderer();
  return renderer.render(dte);
}
