import React, { useState } from 'react';
import { 
  X, GitFork, ArrowDown, ArrowRight, CheckCircle2, 
  AlertCircle, ShieldCheck, Scale, Sparkles, Building2, 
  ChevronRight, Landmark, HelpCircle, Layers
} from 'lucide-react';

interface TransferWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferWorkflowModal: React.FC<TransferWorkflowModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'matrix'>('diagram');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-4xl my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0a4d44] text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <GitFork className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  Decision Tree & Workflow
                </span>
                <span className="text-xs text-white/80">ผังการวินิจฉัยอำนาจอนุมัติ</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Workflow ขั้นตอนการพิจารณาโอนเปลี่ยนแปลงงบประมาณ (ระเบียบ กสม. ๒๕๖๖)
              </h3>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'diagram'
                  ? 'bg-[#0a4d44] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              แผนผังขั้นตอนการวินิจฉัย (Visual Workflow)
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-[#0a4d44] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              ตารางเปรียบเทียบอำนาจอนุมัติ 3 ระดับ (Matrix Table)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> เลขาธิการ
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> ประธาน กสม.
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> คณะกรรมการ กสม.
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 overscroll-contain text-xs">
          {activeTab === 'diagram' ? (
            <div className="space-y-6">
              
              {/* Step 1 Node */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#0a4d44] text-white flex items-center justify-center text-xs">1</div>
                  <span>จุดเริ่มต้น: สำนัก/กลุ่มงาน มีความประสงค์ขอโอนเปลี่ยนแปลงงบประมาณ</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1 pl-8 text-xs">
                  ตรวจสอบเงินเหลือจ่ายจากการดำเนินงานที่แล้วเสร็จ หรือความจำเป็นเร่งด่วนตามภารกิจ
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center -my-3">
                <ArrowDown className="w-5 h-5 text-slate-400" />
              </div>

              {/* Step 2 Node: Decision on Cross Program */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0a4d44] text-white flex items-center justify-center text-xs font-bold">2</div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      ด่านที่ ๑: โอนข้ามแผนงานงบประมาณ หรือไม่? (ข้อ ๑๔)
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#0a4d44] dark:text-emerald-400">
                    ระเบียบฯ ข้อ ๑๔
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                  {/* Branch YES */}
                  <div className="bg-red-50/80 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white inline-block">
                      ใช่ (ข้ามแผนงาน)
                    </span>
                    <p className="font-bold text-red-900 dark:text-red-200 text-xs">
                      ➡️ เสนอ คณะกรรมการ กสม. พิจารณาอนุมัติ
                    </p>
                    <p className="text-[11px] text-red-700 dark:text-red-300">
                      การโอนข้ามแผนงานจะกระทำมิได้ เว้นแต่ได้รับอนุมัติจากที่ประชุม กสม.
                    </p>
                  </div>

                  {/* Branch NO */}
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white inline-block">
                      ไม่ใช่ (แผนงานเดียวกัน)
                    </span>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                      ➡️ ผ่านเข้าสู่ด่านที่ ๒ ตรวจสอบผลกระทบต่อแผน
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      งบประมาณยังคงอยู่ภายใต้เป้าหมายของแผนงานเดิม
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center -my-3">
                <ArrowDown className="w-5 h-5 text-slate-400" />
              </div>

              {/* Step 3 Node: Impacts Plan */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0a4d44] text-white flex items-center justify-center text-xs font-bold">3</div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      ด่านที่ ๒: กระทบต่อแผนการปฏิบัติงานที่คณะกรรมการเห็นชอบไว้หรือไม่? (ข้อ ๑๕ วรรคท้าย)
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#0a4d44] dark:text-emerald-400">
                    ระเบียบฯ ข้อ ๑๕ วรรคท้าย
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                  {/* Branch YES (Impacts Plan) */}
                  <div className="bg-amber-50/80 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-300 dark:border-amber-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white inline-block">
                      กระทบต่อแผนงานหลัก
                    </span>
                    <p className="font-bold text-amber-900 dark:text-amber-200 text-xs">
                      ➡️ เสนอ คณะกรรมการ กสม. พิจารณาอนุมัติ
                    </p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      เข้าข่าย: ปรับเป้าหมายตัวชี้วัด / ยกเลิกกิจกรรม / จัดตั้งโครงการใหม่นอกแผน
                    </p>
                  </div>

                  {/* Branch NO (No Impact) */}
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white inline-block">
                      ไม่กระทบต่อแผนงานหลัก
                    </span>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                      ➡️ ผ่านเข้าสู่ด่านที่ ๓ ตรวจสอบประเภทรายจ่าย
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      วงเงินรวมไม่เพิ่ม และผลสัมฤทธิ์ของโครงการยังคงบรรลุตามเป้าหมาย
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center -my-3">
                <ArrowDown className="w-5 h-5 text-slate-400" />
              </div>

              {/* Step 4 Node: Item Category & Thresholds */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0a4d44] text-white flex items-center justify-center text-xs font-bold">4</div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      ด่านที่ ๓: ตรวจสอบประเภทรายการและเกณฑ์วงเงิน (ข้อ ๑๕ วรรคหนึ่ง - สี่)
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#0a4d44] dark:text-emerald-400">
                    ระเบียบฯ ข้อ ๑๕ วรรคหนึ่ง-สี่
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-8">
                  {/* General Operating */}
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0a4d44] text-white inline-block">
                      งบดำเนินงานทั่วไป (ข้อ ๑๕ วรรค ๑)
                    </span>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                      เลขาธิการ กสม. เป็นผู้อนุมัติ
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      ค่าตอบแทน ใช้สอย วัสดุ สัมมนา ค่าเช่าระบบ ฯลฯ ไม่เพิ่มวงเงินรวม
                    </p>
                  </div>

                  {/* Asset/Construction within threshold */}
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0a4d44] text-white inline-block">
                      ครุภัณฑ์ / ที่ดินสิ่งก่อสร้าง (ข้อ ๑๕ วรรค ๒, ๔)
                    </span>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                      เลขาธิการ กสม. เป็นผู้อนุมัติ
                    </p>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside space-y-0.5">
                      <li>ครุภัณฑ์ ≤ ๑,๐๐๐,๐๐๐ บาท/หน่วย</li>
                      <li>ที่ดินสิ่งก่อสร้าง ≤ ๑๐,๐๐๐,๐๐๐ บาท</li>
                      <li>หรือเพิ่มวงเงินไม่เกิน ๑๐% (วรรค ๔)</li>
                    </ul>
                  </div>

                  {/* Asset/Construction exceeding threshold */}
                  <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-200 dark:border-blue-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-700 text-white inline-block">
                      เกินเกณฑ์วงเงิน (ข้อ ๑๕ วรรค ๓)
                    </span>
                    <p className="font-bold text-blue-900 dark:text-blue-200 text-xs">
                      ประธาน กสม. เป็นผู้ให้ความเห็นชอบ
                    </p>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside space-y-0.5">
                      <li>ครุภัณฑ์เกิน ๑,๐๐๐,๐๐๐ บาท/หน่วย</li>
                      <li>หรือที่ดินสิ่งก่อสร้างเกิน ๑๐ ล้านบาท</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Matrix Tab */
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-left">
                  <thead className="bg-[#0a4d44] text-white">
                    <tr>
                      <th className="p-3 w-1/4">ระดับผู้มีอำนาจอนุมัติ</th>
                      <th className="p-3 w-1/2">กรณีและเงื่อนไขที่อนุมัติได้</th>
                      <th className="p-3 w-1/4">ฐานอำนาจตามระเบียบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 align-top">
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          เลขาธิการ กสม.
                        </span>
                      </td>
                      <td className="p-3.5 space-y-1 align-top">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          ๑. การเปลี่ยนแปลงรายการทั่วไปภายในแผนงานเดิม (ไม่เพิ่มวงเงินและไม่กระทบแผน)
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-white">
                          ๒. ค่าครุภัณฑ์ที่มีราคาต่อหน่วยไม่เกิน ๑,๐๐๐,๐๐๐ บาท
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-white">
                          ๓. ค่าที่ดินและสิ่งก่อสร้างที่มีราคาต่อรายการไม่เกิน ๑๐,๐๐๐,๐๐๐ บาท
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-white">
                          ๔. การเพิ่มวงเงินรายการค่าครุภัณฑ์หรือสิ่งก่อสร้างแต่ละหน่วยไม่เกิน ๑๐%
                        </p>
                      </td>
                      <td className="p-3.5 align-top text-slate-500 font-medium">
                        ข้อ ๑๓, ข้อ ๑๕ วรรคหนึ่ง, วรรคสอง, วรรคสี่
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 align-top">
                        <span className="inline-flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400 text-xs">
                          <Landmark className="w-4 h-4 text-blue-600" />
                          ประธาน กสม.
                        </span>
                      </td>
                      <td className="p-3.5 space-y-1 align-top">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          กรณีเปลี่ยนแปลงรายการที่มีวงเงินเกินกว่าอำนาจเลขาธิการ:
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          - รายการค่าครุภัณฑ์เกิน ๑,๐๐๐,๐๐๐ บาทต่อหน่วย
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          - รายการค่าที่ดินและสิ่งก่อสร้างเกิน ๑๐,๐๐๐,๐๐๐ บาทต่อรายการ
                        </p>
                      </td>
                      <td className="p-3.5 align-top text-slate-500 font-medium">
                        ข้อ ๑๕ วรรคสาม
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 align-top">
                        <span className="inline-flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400 text-xs">
                          <Scale className="w-4 h-4 text-rose-600" />
                          คณะกรรมการ กสม.
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">(ที่ประชุม กสม. ชุดใหญ่)</span>
                      </td>
                      <td className="p-3.5 space-y-1 align-top">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          ๑. การโอนหรือเปลี่ยนแปลงงบประมาณรายจ่าย "ข้ามแผนงาน"
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-white">
                          ๒. การเปลี่ยนแปลงรายการที่ "กระทบต่อแผนการปฏิบัติงานที่ให้ความเห็นชอบไว้" (ปรับตัวชี้วัด/ยกเลิกกิจกรรม/จัดตั้งโครงการใหม่)
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-white">
                          ๓. การก่อหนี้ผูกพันงบประมาณข้ามปี (ไม่เกิน ๕ ปี)
                        </p>
                      </td>
                      <td className="p-3.5 align-top text-slate-500 font-medium">
                        ข้อ ๑๔, ข้อ ๑๕ วรรคท้าย, ข้อ ๑๖
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-5 sm:px-6 py-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-400">
            ผังการวินิจฉัยและขั้นตอนการพิจารณา สำนักงาน กสม.
          </span>
          <button
            onClick={onClose}
            className="font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
