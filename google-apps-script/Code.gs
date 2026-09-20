/**
 * Google Apps Script for NHRC Project & Budget Monitoring System
 * ระบบติดตามผลการดำเนินงานและการใช้จ่ายงบประมาณ สำนักงาน กสม.
 *
 * วิธีติดตั้ง:
 * 1. สร้าง Google Sheet ใหม่ใน Google Drive ของสำนักงาน กสม.
 * 2. ไปที่ Extensions (ส่วนขยาย) > Apps Script
 * 3. นำโค้ดนี้ทั้งหมดไปวางแทนที่ใน Code.gs
 * 4. กด Deploy > New Deployment > เลือกประเภท Web App
 *    - Execute as: Me (ตัวคุณเอง)
 *    - Who has access: Anyone (ทุกคน)
 * 5. คัดลอก Web App URL ที่ได้มาใส่ในเมนู "ตั้งค่า Google Sheets" ของระบบ
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var projectsSheet = getOrCreateSheet(ss, 'Projects');
  var reportsSheet = getOrCreateSheet(ss, 'ProgressReports');
  var transfersSheet = getOrCreateSheet(ss, 'BudgetTransfers');

  var result = {
    status: 'success',
    projectsCount: projectsSheet.getLastRow() - 1,
    reportsCount: reportsSheet.getLastRow() - 1,
    transfersCount: transfersSheet.getLastRow() - 1,
    timestamp: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var payload = data.payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'syncAll') {
      saveProjects(ss, payload.projects || []);
      saveReports(ss, payload.reports || []);
      saveTransfers(ss, payload.transfers || []);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data synced successfully to Google Sheets'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unknown action'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function saveProjects(ss, projects) {
  var sheet = getOrCreateSheet(ss, 'Projects');
  sheet.clearContents();
  
  // Headers
  sheet.appendRow([
    'รหัสโครงการ', 'ชื่อโครงการ', 'สำนัก/หน่วยงาน', 'กลุ่มงาน', 'ปีงบประมาณ',
    'งบประมาณที่จัดสรร (บาท)', 'งบประมาณเบิกจ่ายจริง (บาท)', 'ร้อยละความก้าวหน้า',
    'สถานะ', 'ผู้รับผิดชอบ', 'เบอร์โทรศัพท์', 'อีเมล', 'แก้ไขล่าสุด'
  ]);

  projects.forEach(function(p) {
    sheet.appendRow([
      p.code || '',
      p.name || '',
      p.division || '',
      p.subDivision || '',
      p.fiscalYear || 2569,
      p.budgetAllocated || 0,
      p.budgetSpent || 0,
      (p.progressPercent || 0) + '%',
      p.status || '',
      p.responsiblePerson ? p.responsiblePerson.name : '',
      p.responsiblePerson ? p.responsiblePerson.phone : '',
      p.responsiblePerson ? p.responsiblePerson.email : '',
      p.updatedAt || new Date().toISOString()
    ]);
  });
  
  formatSheetHeader(sheet);
}

function saveReports(ss, reports) {
  var sheet = getOrCreateSheet(ss, 'ProgressReports');
  sheet.clearContents();
  
  sheet.appendRow([
    'รหัสรายงาน', 'รหัสโครงการ', 'ชื่อโครงการ', 'สำนัก', 'รอบการรายงาน',
    'วันที่รายงาน', 'งบจัดสรร', 'งบเบิกจ่าย', 'ผู้รายงาน', 'สถานะ'
  ]);

  reports.forEach(function(r) {
    sheet.appendRow([
      r.id,
      r.projectCode,
      r.projectName,
      r.division,
      r.round,
      r.reportDate,
      r.section1 ? r.section1.allocatedBudget : 0,
      r.section2_1 ? r.section2_1.reduce(function(sum, a) { return sum + (a.actualSpent || 0); }, 0) : 0,
      r.section6 ? r.section6.name : '',
      r.status
    ]);
  });

  formatSheetHeader(sheet);
}

function saveTransfers(ss, transfers) {
  var sheet = getOrCreateSheet(ss, 'BudgetTransfers');
  sheet.clearContents();

  sheet.appendRow([
    'เลขที่หนังสือ', 'วันที่', 'สำนัก', 'เรื่อง', 'ผู้มีอำนาจอนุมัติ',
    'จำนวนรายการโอน', 'สถานะ', 'บันทึกล่าสุด'
  ]);

  transfers.forEach(function(t) {
    sheet.appendRow([
      t.bookNumber,
      t.memoDate,
      t.division,
      t.subject,
      t.approverTitle,
      t.tableRows ? t.tableRows.length : 0,
      t.status,
      t.createdAt
    ]);
  });

  formatSheetHeader(sheet);
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function formatSheetHeader(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#0a4d44');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);
}
