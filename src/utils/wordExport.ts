import { OfficialMemoData } from '../types/budget';
import { formatCurrency, formatMemoBookNumber, getMemoDisplayDate } from './thaiNumber';

/**
 * Generates an HTML-based Word document (.doc) that MS Word natively parses,
 * complete with TH Sarabun font, official margins, headers, tables, and signature blocks.
 */
export function generateWordDocument(memo: OfficialMemoData): void {
  const num = (v: string | number | undefined | null) => (v !== undefined && v !== null ? v.toString() : '');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${memo.subject}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 210mm 297mm;
          margin: 25mm 20mm 20mm 25mm;
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', 'Cordia New', sans-serif;
          font-size: 16pt;
          line-height: 1.25;
          color: #000000;
        }
        h1.memo-title {
          font-size: 29pt;
          font-weight: bold;
          text-align: center;
          margin: 0;
          padding: 0;
        }
        table.meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10pt;
          margin-bottom: 12pt;
          border-bottom: 1.5pt solid #000;
        }
        table.meta-table td {
          padding: 2pt 0;
          font-size: 16pt;
          vertical-align: top;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 12pt 0;
          font-size: 13pt;
        }
        table.data-table th, table.data-table td {
          border: 1pt solid #000;
          padding: 4pt;
          text-align: left;
        }
        table.data-table th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: center;
        }
        p {
          margin: 0 0 6pt 0;
          text-align: justify;
          text-justify: inter-cluster;
        }
        p.indent {
          text-indent: 2.5cm;
        }
        .bold {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <!-- Header -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10pt;">
          <tr>
            <td style="width: 25%; vertical-align: top;">
              <!-- Note: Garuda Emblem text reference -->
              <span style="font-size: 11pt; color: #555;">[ ตราครุฑ 2.5 ซม. ]</span>
            </td>
            <td style="width: 75%; vertical-align: middle; text-align: center; padding-right: 25%;">
              <h1 class="memo-title">บันทึกข้อความ</h1>
            </td>
          </tr>
        </table>

        <!-- Metadata -->
        <table class="meta-table">
          <tr>
            <td colspan="2"><span class="bold">ส่วนราชการ</span> ${memo.divisionFullName} ${memo.subDivisionName} โทร. ${num(memo.telNumber)}</td>
          </tr>
          <tr>
            <td style="width: 50%;"><span class="bold">ที่</span> ${formatMemoBookNumber(memo.bookNumber)}</td>
            <td style="width: 50%;"><span class="bold">วันที่</span> ${num(getMemoDisplayDate(memo))}</td>
          </tr>
          <tr>
            <td colspan="2"><span class="bold">เรื่อง</span> ${num(memo.subject)}</td>
          </tr>
        </table>

        <p><span class="bold">เรียน</span> ${memo.toRecipient}</p>

        <!-- 1. Original Story -->
        <p class="indent">
          <span class="bold">1. เรื่องเดิม</span><br/>
          ${memo.section1_OriginalStory}
        </p>

        <!-- 2. Facts -->
        <p class="indent" style="margin-top: 6pt;">
          <span class="bold">2. ข้อเท็จจริง</span><br/>
          ${memo.section2_Facts.agencyRequest} ${memo.section2_Facts.investigation} ${memo.section2_Facts.savingsSource}
        </p>

        <!-- 3. Legal Reference -->
        <p class="indent" style="margin-top: 6pt;">
          <span class="bold">3. ระเบียบที่เกี่ยวข้อง</span><br/>
          ${memo.section3_LegalReference}
        </p>

        <!-- 4. Proposal -->
        <p class="indent" style="margin-top: 6pt;">
          <span class="bold">4. ข้อพิจารณาและข้อเสนอ</span><br/>
          ${memo.section4_Proposal}
        </p>

        <!-- Table -->
        <p style="margin-top: 10pt; font-weight: bold;">
          รายละเอียดการโอนเปลี่ยนแปลงงบประมาณรายจ่ายประจำปี ${memo.asOfDateText}
        </p>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 4%;">ที่</th>
              <th style="width: 28%;">แผนงาน / โครงการ / กิจกรรม</th>
              <th style="width: 14%;">งบประมาณเดิม (บาท)</th>
              <th style="width: 13%;">โอนลด (-) (บาท)</th>
              <th style="width: 13%;">โอนเพิ่ม (+) (บาท)</th>
              <th style="width: 14%;">งบประมาณใหม่ (บาท)</th>
              <th style="width: 14%;">ผลเบิกจ่าย/คงเหลือ</th>
            </tr>
          </thead>
          <tbody>
            ${memo.tableRows.map((row, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td>
                  <strong>${row.itemDescription}</strong><br/>
                  <span style="font-size: 11pt; color: #555;">${row.programName} (${row.activityCode})</span>
                </td>
                <td style="text-align: right;">${formatCurrency(row.budgetOriginal)}</td>
                <td style="text-align: right; color: #b91c1c;">
                  ${row.itemType === 'source' ? formatCurrency(row.transferAmount) : '-'}
                </td>
                <td style="text-align: right; color: #047857;">
                  ${row.itemType === 'destination' ? formatCurrency(row.transferAmount) : '-'}
                </td>
                <td style="text-align: right; font-weight: bold;">${formatCurrency(row.budgetNew)}</td>
                <td style="text-align: right;">${formatCurrency(row.remainingBalance)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Signatures -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 30pt;">
          <tr>
            <td style="width: 50%;"></td>
            <td style="width: 50%; text-align: center;">
              <p>(ลงชื่อ)........................................................</p>
              <p>(${memo.proposerName})</p>
              <p>${memo.proposerPosition}</p>
            </td>
          </tr>
        </table>

      </div>
    </body>
    </html>
  `;

  // Create Blob and trigger download as .doc
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `บันทึกข้อความ_โอนเปลี่ยนแปลงงบประมาณ_${memo.bookNumber.replace(/[\/\s]/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
