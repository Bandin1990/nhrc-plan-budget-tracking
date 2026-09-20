import React, { useState } from 'react';
import { 
  BookOpen, Search, HelpCircle, ChevronRight, FileUp, FolderKanban, 
  Clock, Scale, ShieldCheck, Lock, Unlock, Download, Mail, Sparkles, 
  CheckCircle2, ArrowRight, Lightbulb, Info, FileText, Layers, Target,
  Printer, FileCheck, Building2, UserCheck, AlertTriangle
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface UserManualViewProps {
  onNavigate?: (tab: NavTab) => void;
}

export const UserManualView: React.FC<UserManualViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const MANUAL_SECTIONS = [
    {
      id: 'overview',
      title: '1. ภาพรวมระบบและสิทธิ์การใช้งาน',
      icon: ShieldCheck,
      color: 'bg-emerald-500 text-white',
      badge: 'SSO & Roles',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            <strong>ระบบติดตามผลการดำเนินงานและการใช้จ่ายงบประมาณ (สำนักงาน กสม.)</strong> พัฒนาขึ้นเพื่อเป็นเครื่องมือกลางในการติดตาม วิเคราะห์ และรายงานผลการดำเนินงานโครงการตามแผนปฏิบัติการประจำปี ตลอดจนการบริหารงบประมาณและการขอโอนเปลี่ยนแปลงงบประมาณตามระเบียบ กสม. พ.ศ. 2566
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">ADMIN</span>
              <h4 className="font-bold text-slate-900 dark:text-white mt-1">ผู้ดูแลระบบ / เจ้าหน้าที่ สนย.</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                สิทธิ์สูงสุดในการนำเข้าแผนปฏิบัติการ, ล็อกแผนตั้งต้นประจำปี (Baseline Lock), อนุมัติปลดล็อกแก้ไขโครงการ และจัดส่งอีเมลแจ้งเตือนผู้รับผิดชอบโครงการทุกสำนัก
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">PROJECT_OWNER</span>
              <h4 className="font-bold text-slate-900 dark:text-white mt-1">ผู้รับผิดชอบโครงการประจำสำนัก</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                สิทธิ์เพิ่ม/แก้ไขโครงการในสำนักของตนเอง, บันทึกแบบรายงานผล สนย.3 และยื่นคำขอโอน/เปลี่ยนแปลงงบประมาณ
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">EXECUTIVE</span>
              <h4 className="font-bold text-slate-900 dark:text-white mt-1">ผู้บริหาร สำนักงาน กสม.</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                เข้าถึงแดชบอร์ดสรุปภาพรวมผู้บริหาร, สรุปผลการใช้จ่ายงบประมาณ และจัดทำรายงานประจำปี (Word/Excel)
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">INSPECTOR / USER</span>
              <h4 className="font-bold text-slate-900 dark:text-white mt-1">ผู้ตรวจ / เจ้าหน้าที่ทั่วไป</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                เข้าดูข้อมูลทะเบียนโครงการ, ตรวจสอบรายงานผล สนย.3 และสืบค้นบันทึกขอโอนงบประมาณ (Read-Only)
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'import',
      title: '2. การนำเข้าแผนปฏิบัติการประจำปี (Word/AI Import)',
      icon: FileUp,
      color: 'bg-amber-500 text-white',
      badge: 'Word / AI Parser',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            ระบบรองรับการนำเข้าแผนปฏิบัติการประจำปีโดยอัตโนมัติจากไฟล์เอกสารคำของบประมาณ (`.docx`) โดยระบบ AI จะทำการวิเคราะห์และสกัดข้อมูลเข้าสู่ระบบเพื่อความสะดวกรวดเร็ว
          </p>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ขั้นตอนการนำเข้าไฟล์ Word คำของบประมาณ:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-amber-950 dark:text-amber-200/90 pl-1">
              <li>คลิกเมนู <strong>"นำเข้าแผนปฏิบัติการ (Word/AI)"</strong> จากแถบเมนูด้านซ้าย</li>
              <li>ลากวางไฟล์เอกสาร Word (`.docx`) ลงในช่องรับไฟล์ หรือกดคลิกเพื่อเลือกไฟล์จากเครื่อง</li>
              <li>รอระบบอ่านและสกัดข้อมูลรหัสกิจกรรม, ชื่อโครงการ, งบจัดสรร, กลุ่มเป้าหมาย และแผนรายเดือน</li>
              <li>ตรวจสอบและปรับปรุงความถูกต้องของข้อมูลบนหน้าจอพรีวิว</li>
              <li>กดปุ่ม <strong>"นำเข้าและสถาปนาเป็นโครงการตั้งต้น"</strong> เพื่อบันทึกโครงการเข้าสู่ระบบ</li>
            </ol>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('word_import')}
              className="px-4 py-2 bg-[#0a4d44] hover:bg-[#083b34] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <FileUp className="w-4 h-4 text-amber-300" />
              <span>เปิดหน้านำเข้าแผนปฏิบัติการ (Word/AI) ทันที</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    },
    {
      id: 'catalog',
      title: '3. ทะเบียนโครงการและการล็อกแผนตั้งต้น (Project Catalog)',
      icon: FolderKanban,
      color: 'bg-blue-500 text-white',
      badge: 'Baseline Lock',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            หน้าทะเบียนโครงการเป็นศูนย์รวมข้อมูลโครงการทั้งหมดของ สำนักงาน กสม. ประจำปีงบประมาณ มีตัวกรองค้นหาแบบมัลติฟิลเตอร์ และรองรับการล็อกข้อมูลตั้งต้นตามระเบียบราชการ
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <Search className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">การค้นหาและกรองข้อมูล</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  สามารถกรองโครงการตามรหัสกิจกรรม, ชื่อโครงการ, สำนักที่รับผิดชอบ (14 สำนัก), แผนงานงบประมาณ (6 แผนงาน), ยุทธศาสตร์ กสม. (4 ด้าน) และสถานะโครงการ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">การล็อกแผนตั้งต้น (Baseline Lock)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  เมื่อเริ่มต้นปีงบประมาณ Admin สามารถกดล็อกแผนตั้งต้น เพื่อป้องกันไม่ให้มีการแก้ไขข้อมูลตั้งต้นโดยไม่ได้รับอนุมัติ หากจำเป็นต้องแก้ไข สำนักสามารถยื่นขออนุมัติปลดล็อกแก้ไขได้
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <Download className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">การส่งออกไฟล์ Excel</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  สามารถกดปุ่ม <strong>"ส่งออก Excel"</strong> เพื่อดาวน์โหลดตารางโครงการพร้อมรหัสกิจกรรม, สำนัก, งบจัดสรร, เบิกจ่ายจริง, ความก้าวหน้า และผู้รับผิดชอบ
                </p>
              </div>
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('project_catalog')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <FolderKanban className="w-4 h-4" />
              <span>เปิดหน้าทะเบียนโครงการทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    },
    {
      id: 'proposal_form',
      title: '4. แบบเสนอโครงการและรายละเอียดแผนปฏิบัติงาน (5 ส่วน)',
      icon: FileText,
      color: 'bg-emerald-600 text-white',
      badge: 'เอกสาร 5 ส่วน',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            ระบบสร้างและจัดพิมพ์ <strong>แบบเสนอโครงการและรายละเอียดแผนปฏิบัติงานและการใช้จ่ายงบประมาณ</strong> ครบถ้วน 5 ส่วนตามรูปแบบมาตรฐานของ สำนักงาน กสม.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <strong className="text-emerald-900 dark:text-emerald-300">ส่วนที่ 1 ข้อมูลโครงการ</strong>: ชื่อโครงการ, วิธีดำเนินงาน, ประเภทงบประมาณ, แหล่งงบประมาณ
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <strong className="text-emerald-900 dark:text-emerald-300">ส่วนที่ 2 ยุทธศาสตร์</strong>: ยุทธศาสตร์ชาติ 6 ด้าน, แผนแม่บท 23 ประเด็น, แผนปฏิรูป 13 ด้าน, หมุดหมาย 13, ยุทธศาสตร์ กสม. 4 ด้าน
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <strong className="text-emerald-900 dark:text-emerald-300">ส่วนที่ 3 รายละเอียดโครงการ</strong>: หลักการเหตุผล, วัตถุประสงค์, ผลผลิต/ผลลัพธ์, กลุ่มเป้าหมาย/พื้นที่, ตัวชี้วัด
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <strong className="text-emerald-900 dark:text-emerald-300">ส่วนที่ 4 แผนปฏิบัติงาน & งบประมาณ</strong>: ตารางประมาณการค่าใช้จ่าย และตารางแผนรายเดือน
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-600 shrink-0" />
              <span>รองรับการสลับตัวเลขไทย (๑ ๒ ๓) / เลขอารบิก (1 2 3) และการส่งออกเป็น MS Word (.doc)</span>
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: '5. การรายงานผลรอบ 2 เดือน (แบบ สนย.3)',
      icon: Clock,
      color: 'bg-teal-600 text-white',
      badge: 'แบบ สนย.3',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            ขั้นตอนการบันทึกรายงานผลการปฏิบัติงานและการใช้จ่ายงบประมาณ (แบบ สนย.3) ตามรอบระยะเวลาทุก 2 เดือน (รอบ 2, 4, 6, 8, 10, 12 เดือน)
          </p>

          <ol className="list-decimal list-inside space-y-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <li>เข้าเมนู <strong>"รายงานผลรอบ 2 เดือน (สนย.3)"</strong></li>
            <li>กดปุ่ม <strong>"+ บันทึกรายงานผล สนย.3"</strong> ในโครงการที่ต้องการรายงาน</li>
            <li>ระบุงวดรอบการรายงาน และกรอกผลการดำเนินงานรายกิจกรรม พร้อมยอดเบิกจ่ายจริง</li>
            <li>บันทึกปัญหา/อุปสรรค แนวทางแก้ไข และข้อเสนอแนะ</li>
            <li>กด <strong>"บันทึกรายงานผล"</strong> เพื่อส่งรายงานเข้าสู่ระบบ</li>
          </ol>

          {onNavigate && (
            <button
              onClick={() => onNavigate('progress_reports')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <Clock className="w-4 h-4" />
              <span>เปิดหน้ารายงานผลรอบ 2 เดือน (สนย.3)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    },
    {
      id: 'transfers',
      title: '6. การขอโอน/เปลี่ยนแปลงงบประมาณ (Budget Transfer Wizard)',
      icon: Scale,
      color: 'bg-rose-500 text-white',
      badge: 'ระเบียบ กสม. 2566',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            ระบบช่วยวินิจฉัยอำนาจการอนุมัติการโอนเปลี่ยนแปลงงบประมาณตาม <strong>ระเบียบคณะกรรมการสิทธิมนุษยชนแห่งชาติ ว่าด้วยการบริหารงบประมาณ พ.ศ. 2566</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <strong className="text-rose-600 dark:text-rose-400 block mb-1">อำนาจ ผอ.สำนัก</strong>
              โอนภายในโครงการระหว่างรายการในหมวดเดียวกัน
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <strong className="text-rose-600 dark:text-rose-400 block mb-1">อำนาจเลขาธิการ กสม.</strong>
              โอนข้ามโครงการภายในสำนัก หรือโอนระหว่างหมวดรายจ่าย
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <strong className="text-rose-600 dark:text-rose-400 block mb-1">อำนาจ คณะกรรมการ กสม.</strong>
              โอนข้ามแผนงาน หรือโอนงบลงทุนไปตั้งโครงการใหม่
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            ระบบจะสร้าง <strong>บันทึกข้อความตราครุฑ (Garuda Official Memo)</strong> ให้อัตโนมัติ พร้อมปุ่มพิมพ์และส่งออก MS Word
          </p>

          {onNavigate && (
            <button
              onClick={() => onNavigate('budget_transfers')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <Scale className="w-4 h-4" />
              <span>เปิดหน้าขอโอน/เปลี่ยนแปลงงบประมาณ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    },
    {
      id: 'faq',
      title: '7. คำถามที่พบบ่อย (FAQ & Troubleshooting)',
      icon: HelpCircle,
      color: 'bg-indigo-500 text-white',
      badge: 'FAQ',
      content: (
        <div className="space-y-3">
          {[
            {
              q: 'หากต้องการแก้ไขข้อมูลโครงการที่ตั้งต้นไว้แล้ว แต่กดแก้ไขไม่ได้ ต้องทำอย่างไร?',
              a: 'หากโครงการถูกล็อกแผนตั้งต้นไว้ (Baseline Locked) ให้ติดต่อ Admin (สนย.) เพื่ออนุมัติปลดล็อกสิทธิ์แก้ไข เมื่อ Admin อนุมัติแล้ว จะปรากฏสัญลักษณ์ "ปลดล็อกแก้ไขได้" จึงจะสามารถแก้ไขข้อมูลได้'
            },
            {
              q: 'เมื่อพิมพ์เอกสารแล้ว เส้นตารางหรือสีหัวข้อไม่แสดงผล แก้ไขอย่างไร?',
              a: 'ในหน้าต่างสั่งพิมพ์ของเบราว์เซอร์ ให้ตั้งค่า Destination เป็น Save as PDF หรือเลือกเครื่องพิมพ์, Margins เป็น Default (หรือ Custom 0.5 นิ้ว) และติ๊กเลือก "Background graphics" (กราฟิกพื้นหลัง) เพื่อให้สีหัวตารางแสดงสมบูรณ์'
            },
            {
              q: 'สามารถดาวน์โหลดเอกสารไปเปิดแก้ไขต่อบน Microsoft Word ได้หรือไม่?',
              a: 'ได้ครับ เอกสารทุกประเภทในระบบ (แบบเสนอโครงการ 5 ส่วน, แบบรายงาน สนย.3, และบันทึกข้อความตราครุฑ) มีปุ่ม "ส่งออกเป็น MS Word (.doc)" ซึ่งสามารถกดดาวน์โหลดและเปิดแก้ไขต่อบน MS Word ได้ทันที'
            },
            {
              q: 'การส่งคืนเงินงบประมาณเหลือจ่ายเข้าส่วนกลางทำอย่างไร?',
              a: 'สามารถยื่นขอโอนงบประมาณประเภท "คืนเงินงบประมาณเหลือจ่ายเข้าส่วนกลาง" ในเมนูขอโอนงบประมาณ ระบบจะคำนวณเงินเหลือจ่ายและอัปเดตสถิติในแดชบอร์ดให้โดยอัตโนมัติ'
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full text-left p-4 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{item.q}</span>
                </span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-90' : ''}`} />
              </button>
              {openFaqIndex === idx && (
                <div className="p-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }
  ];

  const filteredSections = activeSection === 'all' 
    ? MANUAL_SECTIONS.filter(s => 
        !searchQuery.trim() || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.badge.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MANUAL_SECTIONS.filter(s => s.id === activeSection);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a4d44] via-[#0d594e] to-[#126b5f] text-white rounded-2xl sm:rounded-3xl p-6 shadow-lg border border-emerald-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/15 text-emerald-100 border border-white/20 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              <span>คู่มือการใช้งานระบบ (User Manual & Help Center)</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              คู่มือการใช้งานระบบติดตามแผนและงบประมาณ สำนักงาน กสม.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              รวบรวมขั้นตอนการปฏิบัติงาน การนำเข้าเอกสาร การรายงานผล สนย.3 และคำถามที่พบบ่อย
            </p>
          </div>

          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-emerald-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาเรื่องที่ต้องการทราบในคู่มือ..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#073b34]/90 border border-emerald-500/40 rounded-xl text-white placeholder-emerald-200/70 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Main Content & Section Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Navigation Menu */}
        <div className="lg:col-span-1 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            สารบัญหัวข้อคู่มือ
          </div>
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeSection === 'all'
                ? 'bg-[#0a4d44] text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>แสดงคู่มือทั้งหมด</span>
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded-full font-extrabold">
              {MANUAL_SECTIONS.length}
            </span>
          </button>

          {MANUAL_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#0a4d44] text-white font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/80'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                  <span className="truncate">{sec.title.split('. ')[1] || sec.title}</span>
                </span>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-3 space-y-6">
          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div 
                key={sec.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${sec.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {sec.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">คู่มือการปฏิบัติงานตามระบบ กสม.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    {sec.badge}
                  </span>
                </div>

                <div>
                  {sec.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserManualView;
