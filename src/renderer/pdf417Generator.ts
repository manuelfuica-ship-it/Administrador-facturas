export interface PDF417Options {
  width?: number;
  height?: number;
}

export class PDF417Generator {
  static embedBarcode(doc: any, tedData: string, x: number, y: number, width: number = 50, height: number = 20): void {
    try {
      const cleanData = formatTED(tedData);

      doc.rect(x, y, width, height).stroke();

      doc.fontSize(5)
        .font('Courier')
        .text(cleanData.substring(0, 100), x + 2, y + 2, {
          width: width - 4,
          height: height - 4,
          align: 'center',
          overflow: 'hidden',
        });
    } catch (error) {
      console.error('Error embedding barcode:', error);

      doc.rect(x, y, width, height).stroke();
      doc.fontSize(6).text('[TED]', x + 2, y + height / 2 - 3, {
        width: width - 4,
        align: 'center',
      });
    }
  }
}

export function formatTED(tedXml: string): string {
  if (!tedXml) return 'NOTIMBRE';

  try {
    return tedXml.replace(/[\n\r\t]/g, '').replace(/\s+/g, ' ').substring(0, 150);
  } catch {
    return tedXml.substring(0, 150);
  }
}
