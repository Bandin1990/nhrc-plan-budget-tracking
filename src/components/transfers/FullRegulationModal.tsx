import React, { useState } from 'react';
import { X, BookOpen, Scale, Landmark, ChevronRight, Search, FileText, CheckCircle2 } from 'lucide-react';

interface FullRegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullRegulationModal: React.FC<FullRegulationModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'all' | '12' | '13' | '14' | '15' | '16'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const articles = [
    {
      id: '12',
      title: 'ข้อ ๑๒: การบริหารงบประมาณและการใช้จ่าย',
      category: 'หลักการทั่วไป',
      authority: 'สำนักงาน กสม. / เลขาธิการ',
      authorityColor: 'emerald',
      content: `การบริหารงบประมาณและการใช้จ่ายเงิน ให้เป็นไปตามระเบียบนี้ และระเบียบหรือประกาศที่คณะกรรมการกำหนด

การจ่ายเงินหรือการก่อหนี้ผูกพันงบประมาณรายจ่ายประจำปี จะกระทำได้ต่อเมื่อได้รับความเห็นชอบแผนการปฏิบัติงานและแผนการใช้จ่ายงบประมาณจากคณะกรรมการแล้ว เว้นแต่คณะกรรมการจะกำหนดไว้เป็นอย่างอื่น`,
      summary: 'การจ่ายเงินหรือก่อหนี้ผูกพันต้องสอดคล้องกับแผนการปฏิบัติงานและแผนการใช้จ่ายงบประมาณที่ กสม. เห็นชอบ'
    },
    {
      id: '13',
      title: 'ข้อ ๑๓: อำนาจหน้าที่ของเลขาธิการ กสม.',
      category: 'อำนาจการบริหารงาน',
      authority: 'เลขาธิการ กสม.',
      authorityColor: 'emerald',
      content: `ให้เลขาธิการมีหน้าที่และอำนาจจัดสรรและรับผิดชอบในการจ่ายเงินหรือก่อหนี้ผูกพัน ให้เป็นไปตามแผนปฏิบัติการประจำปีและแผนการใช้จ่ายงบประมาณที่คณะกรรมการให้ความเห็นชอบ

การมอบอำนาจให้ผู้ดำรงตำแหน่งใดปฏิบัติหน้าที่แทนเลขาธิการ ให้ทำเป็นหนังสือ`,
      summary: 'เลขาธิการมีอำนาจรับผิดชอบจัดสรร จ่ายเงิน และก่อหนี้ผูกพันให้เป็นไปตามแผนปฏิบัติการประจำปี'
    },
    {
      id: '14',
      title: 'ข้อ ๑๔: การโอน/เปลี่ยนแปลงงบประมาณข้ามแผนงาน',
      category: 'ข้ามแผนงาน',
      authority: 'คณะกรรมการ กสม. (บอร์ดใหญ่)',
      authorityColor: 'rose',
      content: `การโอนหรือการเปลี่ยนแปลงงบประมาณรายจ่ายประจำปีข้ามแผนงานจะกระทำมิได้ เว้นแต่จะได้รับอนุมัติจากคณะกรรมการ

เมื่อได้รับอนุมัติจากคณะกรรมการแล้ว ให้สำนักงานแจ้งสำนักงบประมาณทราบต่อไป`,
      summary: 'ห้ามโอนข้ามแผนงานโดยเด็ดขาด เว้นแต่จะได้รับอนุมัติจากที่ประชุมคณะกรรมการ กสม.'
    },
    {
      id: '15',
      title: 'ข้อ ๑๕: การเปลี่ยนแปลงรายการและอำนาจอนุมัติ',
      category: 'อำนาจอนุมัติการเปลี่ยนแปลง',
      authority: 'เลขาธิการ / ประธาน กสม. / คณะกรรมการ กสม.',
      authorityColor: 'blue',
      content: `(วรรคหนึ่ง) การเปลี่ยนแปลงรายการหรือจำนวนเงินต่างไปจากแผนปฏิบัติการประจำปี โดยไม่เพิ่มวงเงินรวมของงบประมาณรายจ่ายประจำปีและไม่กระทบต่อแผนการปฏิบัติงานที่คณะกรรมการให้ความเห็นชอบ ให้เลขาธิการเป็นผู้อนุมัติ

(วรรคสอง) การเปลี่ยนแปลงรายการค่าครุภัณฑ์ หรือค่าที่ดินและสิ่งก่อสร้าง ให้เลขาธิการมีอำนาจอนุมัติเปลี่ยนแปลงได้ ดังนี้:
(๑) ค่าครุภัณฑ์ที่มีราคาต่อหน่วยไม่เกินหนึ่งล้านบาท
(๒) ค่าที่ดินและสิ่งก่อสร้างที่มีราคาต่อรายการไม่เกินสิบล้านบาท

(วรรคสาม) ในกรณีที่มีความจำเป็นต้องเปลี่ยนแปลงรายการค่าครุภัณฑ์ หรือค่าที่ดินและสิ่งก่อสร้างที่มีราคาเกินกว่าวงเงินตามวรรคสอง ให้กระทำได้ต่อเมื่อได้รับความเห็นชอบจากประธานกรรมการสิทธิมนุษยชนแห่งชาติ

(วรรคสี่) การเพิ่มวงเงินรายการค่าครุภัณฑ์ หรือค่าที่ดินและสิ่งก่อสร้าง แต่ละหน่วยไม่เกินร้อยละสิบของวงเงินที่ได้รับความเห็นชอบแล้ว และไม่เกินวงเงินงบประมาณรายจ่ายของโครงการนั้น ให้เลขาธิการเป็นผู้อนุมัติ

(วรรคห้า/วรรคท้าย) การเปลี่ยนแปลงรายการที่กระทบต่อแผนการปฏิบัติงานที่คณะกรรมการให้ความเห็นชอบไว้ ให้เสนอต่อคณะกรรมการเพื่อพิจารณาอนุมัติ`,
      summary: 'จำแนกอำนาจ: ทั่วไป/ไม่กระทบแผน = เลขาธิการ | ครุภัณฑ์เกิน 1 ลบ. หรือสิ่งก่อสร้างเกิน 10 ลบ. = ประธาน กสม. | กระทบแผนงานหลัก/ข้ามแผนงาน = คณะกรรมการ กสม.'
    },
    {
      id: '16',
      title: 'ข้อ ๑๖: การก่อหนี้ผูกพันข้ามปีงบประมาณ',
      category: 'ก่อหนี้ผูกพันข้ามปี',
      authority: 'คณะกรรมการ กสม.',
      authorityColor: 'amber',
      content: `การก่อหนี้ผูกพันงบประมาณรายจ่ายข้ามปีงบประมาณ ให้กระทำได้เฉพาะรายการที่มีความจำเป็นและได้รับอนุมัติจากคณะกรรมการ

รายการก่อหนี้ผูกพันข้ามปีงบประมาณตามวรรคหนึ่ง ต้องมีระยะเวลาการผูกพันไม่เกินห้าปี เว้นแต่คณะกรรมการจะมีมติเป็นอย่างอื่น`,
      summary: 'การผูกพันงบประมาณข้ามปีต้องเสนอขออนุมัติจากคณะกรรมการ กสม. และมีระยะเวลาผูกพันไม่เกิน 5 ปี'
    }
  ];

  const filtered = articles.filter(a => {
    const matchesSection = activeSection === 'all' || a.id === activeSection;
    const matchesSearch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-3xl my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
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
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  คัมภีร์ระเบียบงบประมาณ
                </span>
                <span className="text-xs text-white/80">หมวด ๒ ข้อ ๑๒ - ๑๖</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                ระเบียบคณะกรรมการสิทธิมนุษยชนแห่งชาติ ว่าด้วยการงบประมาณ พ.ศ. ๒๕๖๖
              </h3>
            </div>
          </div>
        </div>

        {/* Toolbar: Search and Filter Tabs */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Section Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSection === 'all'
                  ? 'bg-[#0a4d44] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              ทั้งหมด
            </button>
            {articles.map((art) => (
              <button
                key={art.id}
                onClick={() => setActiveSection(art.id as any)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeSection === art.id
                    ? 'bg-[#0a4d44] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                ข้อ {art.id}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาข้อความในระเบียบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-1 focus:ring-[#0a4d44]"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain text-xs">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>ไม่พบข้อความที่ตรงกับการค้นหา</p>
            </div>
          ) : (
            filtered.map((art) => (
              <div
                key={art.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#0a4d44] dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                      {art.id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {art.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">อำนาจอนุมัติ:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      art.authorityColor === 'rose'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        : art.authorityColor === 'amber'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : art.authorityColor === 'blue'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}>
                      {art.authority}
                    </span>
                  </div>
                </div>

                {/* Main Legal Content */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                  <pre className="font-sans text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                    {art.content}
                  </pre>
                </div>

                {/* Summary / Practice Note */}
                <div className="flex items-start gap-2 bg-emerald-50/50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-emerald-100 dark:border-slate-800 text-[11px] text-emerald-900 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">แนวทางปฏิบัติ: </span>
                    <span>{art.summary}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-5 sm:px-6 py-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-400">
            สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ
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
