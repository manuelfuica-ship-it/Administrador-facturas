import { NextRequest, NextResponse } from 'next/server';
import { DTE } from '@/types/dte';
import { renderDTE } from '@/renderer/pdfRenderer';

export async function POST(req: NextRequest) {
  try {
    const dte: DTE = await req.json();

    if (!dte || typeof dte !== 'object') {
      return NextResponse.json({ error: 'Invalid DTE data' }, { status: 400 });
    }

    const pdfBuffer = renderDTE(dte);

    if (pdfBuffer.length > 500 * 1024) {
      console.warn(`PDF size warning: ${(pdfBuffer.length / 1024).toFixed(2)}KB`);
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="factura-${dte.folio}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Error generating PDF: ' + error.message },
      { status: 500 },
    );
  }
}
