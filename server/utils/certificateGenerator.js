const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generates a high-resolution, vector-designed A4 Landscape PDF certificate of completion
 * @param {Object} certificateData - Metadata for the certificate
 * @param {stream.Writable} outputStream - Response or writable stream
 */
async function generateCertificatePdf(certificateData, outputStream) {
  const {
    certificateId,
    studentName,
    courseTitle,
    completionDate,
    signatoryName = 'Dr. Aris Thorne',
    signatoryRole = 'Dean of Academic Affairs & EduSphere Director',
    verificationBaseUrl = 'http://localhost:5173'
  } = certificateData;

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 25, bottom: 25, left: 25, right: 25 }
  });

  doc.pipe(outputStream);

  const width = 841.89;
  const height = 595.28;

  // 1. Background fill (soft warm parchment tone)
  doc.rect(0, 0, width, height).fill('#fafafa');

  // 2. Elegant Dark Navy Outer Border
  doc.rect(18, 18, width - 36, height - 36)
     .lineWidth(4)
     .stroke('#091326');

  // 3. Gold Inner Border
  doc.rect(26, 26, width - 52, height - 52)
     .lineWidth(1.5)
     .stroke('#d97706');

  // 4. Subtle corner geometric accents
  const cornerSize = 14;
  // Top-left
  doc.rect(26, 26, cornerSize, cornerSize).fill('#1e1b4b');
  // Top-right
  doc.rect(width - 26 - cornerSize, 26, cornerSize, cornerSize).fill('#1e1b4b');
  // Bottom-left
  doc.rect(26, height - 26 - cornerSize, cornerSize, cornerSize).fill('#1e1b4b');
  // Bottom-right
  doc.rect(width - 26 - cornerSize, height - 26 - cornerSize, cornerSize, cornerSize).fill('#1e1b4b');

  // 5. Header / Brand Crest
  // Circular logo / crest at top center
  const crestX = width / 2;
  const crestY = 56;
  doc.circle(crestX, crestY, 16).fill('#1e1b4b');
  doc.circle(crestX, crestY, 13).lineWidth(1).stroke('#f59e0b');
  doc.fillColor('#fbbf24').fontSize(14).font('Helvetica-Bold').text('E', crestX - 5, crestY - 8);

  // Institution title
  doc.fillColor('#1e1b4b')
     .fontSize(13)
     .font('Helvetica-Bold')
     .text('EDUSPHERE', 0, 80, { align: 'center', characterSpacing: 3 });

  doc.fillColor('#64748b')
     .fontSize(8.5)
     .font('Helvetica')
     .text('ACCREDITED ONLINE LEARNING PLATFORM', 0, 96, { align: 'center', characterSpacing: 2 });

  // 6. CERTIFICATE OF COMPLETION
  doc.fillColor('#0f172a')
     .fontSize(27)
     .font('Helvetica-Bold')
     .text('CERTIFICATE OF COMPLETION', 0, 118, { align: 'center', characterSpacing: 2.5 });

  // Elegant divider lines with central diamond
  doc.moveTo(width / 2 - 140, 154).lineTo(width / 2 - 10, 154).lineWidth(1).stroke('#d97706');
  doc.moveTo(width / 2 + 10, 154).lineTo(width / 2 + 140, 154).lineWidth(1).stroke('#d97706');
  doc.rect(width / 2 - 4, 150, 8, 8).fill('#d97706');

  // 7. Award wording
  doc.fillColor('#475569')
     .fontSize(11)
     .font('Helvetica')
     .text('This certificate is awarded to', 0, 172, { align: 'center' });

  // 8. Authenticated Student Name
  doc.fillColor('#091326')
     .fontSize(27)
     .font('Helvetica-Bold')
     .text(studentName, 0, 196, { align: 'center' });

  // Underline beneath name
  const nameWidth = Math.min(width - 200, Math.max(260, studentName.length * 15));
  doc.moveTo((width - nameWidth) / 2, 230)
     .lineTo((width + nameWidth) / 2, 230)
     .lineWidth(1)
     .stroke('#cbd5e1');

  // 9. Completion reason
  doc.fillColor('#475569')
     .fontSize(11)
     .font('Helvetica')
     .text('for successfully completing', 0, 245, { align: 'center' });

  // 10. Course Title
  doc.fillColor('#312e81')
     .fontSize(19)
     .font('Helvetica-Bold')
     .text(courseTitle, 60, 268, { align: 'center', width: width - 120 });

  // 11. Official Standard Statement
  doc.fillColor('#64748b')
     .fontSize(10.5)
     .font('Helvetica')
     .text(
       'The student has completed all required course lessons and demonstrated commitment to learning and professional development.',
       100,
       315,
       { align: 'center', width: width - 200, lineGap: 3 }
     );

  // 12. Verification URL and QR Code
  const verifyUrl = `${verificationBaseUrl}/verify-certificate/${certificateId}`;
  let qrBuffer = null;
  try {
    qrBuffer = await QRCode.toBuffer(verifyUrl, {
      width: 82,
      margin: 1,
      color: { dark: '#091326', light: '#ffffff' }
    });
  } catch (qrErr) {
    console.error('Failed to generate QR code buffer:', qrErr);
  }

  // 13. Footer Section (Date, Verification QR, Signatory)
  const footerY = 415;

  // Left Column: Completion Date & Certificate ID
  const dateFormatted = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  doc.fillColor('#64748b')
     .fontSize(8.5)
     .font('Helvetica-Bold')
     .text('COMPLETION DATE', 80, footerY);

  doc.fillColor('#0f172a')
     .fontSize(10.5)
     .font('Helvetica')
     .text(dateFormatted, 80, footerY + 14);

  doc.fillColor('#64748b')
     .fontSize(8.5)
     .font('Helvetica-Bold')
     .text('CERTIFICATE ID', 80, footerY + 40);

  doc.fillColor('#4338ca')
     .fontSize(10.5)
     .font('Helvetica-Bold')
     .text(certificateId, 80, footerY + 54);

  // Center Column: QR Code & Verification Note
  if (qrBuffer) {
    doc.image(qrBuffer, width / 2 - 41, footerY - 5, { width: 82, height: 82 });
  }
  doc.fillColor('#64748b')
     .fontSize(8)
     .font('Helvetica')
     .text('Scan to Verify Authenticity', width / 2 - 60, footerY + 84, { width: 120, align: 'center' });

  // Right Column: Authorized Signatory
  const sigX = width - 270;
  // Stylized simulated cursive signature line
  doc.moveTo(sigX, footerY + 28).lineTo(sigX + 190, footerY + 28).lineWidth(1.2).stroke('#94a3b8');

  doc.fillColor('#091326')
     .fontSize(11.5)
     .font('Helvetica-Bold')
     .text(signatoryName, sigX, footerY + 34, { width: 190, align: 'center' });

  doc.fillColor('#64748b')
     .fontSize(8.5)
     .font('Helvetica')
     .text(signatoryRole, sigX, footerY + 50, { width: 190, align: 'center' });

  doc.fillColor('#d97706')
     .fontSize(8)
     .font('Helvetica-Bold')
     .text('AUTHORIZED SIGNATORY', sigX, footerY + 66, { width: 190, align: 'center', characterSpacing: 1 });

  doc.end();
}

module.exports = {
  generateCertificatePdf
};
