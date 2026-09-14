import {
  CheckCircle,
  Database,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react'
import React, { useState } from 'react'
import { mockReportsList } from '../data/extendedMockData'

export const ReportsPage: React.FC = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)

  const handleDownload = (id: string, fileName: string) => {
    setDownloadingId(id)
    setTimeout(() => {
      setDownloadingId(null)
      setDownloadSuccess(fileName)
      setTimeout(() => setDownloadSuccess(null), 3000)
    }, 1000)
  }

  return (
    <div className="space-y-5">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
          Laporan Analisis & Ekspor Data MBG
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Dokumen ringkasan eksekutif, temuan data empiris media sosial, serta interpretasi rekomendasi mitigasi kebijakan.
        </p>
      </div>

      {/* Download Alert Toast */}
      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Berhasil mengunduh dokumen: <strong>{downloadSuccess}</strong></span>
        </div>
      )}

      {/* Metodologi & Data Coverage Box (Akuntabilitas Data) */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Database className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Metodologi Pengambilan Data & Cakupan Sampel (Data Coverage)
          </h3>
        </div>

        <p className="text-xs text-slate-600">
          Laporan ini disusun menggunakan metodologi pemantauan berbasis sampel objektif untuk memastikan transparansi dan akuntabilitas:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10.5px] text-slate-400 block">Periode Pemantauan</span>
            <span className="font-bold text-slate-900 text-xs">8 – 14 September 2024</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10.5px] text-slate-400 block">Platform Sosial Media</span>
            <span className="font-bold text-slate-900 text-xs">4 (YT, TikTok, IG, FB)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10.5px] text-slate-400 block">Konten Dianalisis</span>
            <span className="font-bold text-slate-900 text-xs">20 Konten (Top 5 Views)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10.5px] text-slate-400 block">Komentar Terindeks</span>
            <span className="font-bold text-slate-900 text-xs">12.482 Sampel Komentar</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded border border-blue-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Catatan Integritas:</strong> Sistem memisahkan dengan tegas antara <strong>Temuan Data Empiris</strong> dan <strong>Interpretasi Analis</strong> agar tidak timbul kesan keputusan kebijakan dibuat otomatis oleh algoritma.
          </span>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {mockReportsList.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
          >
            {/* Header: Title + Period */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    Laporan {report.type}
                  </span>
                  <span className="text-xs text-slate-400">
                    Dibuat: {report.dateGenerated}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {report.title}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleDownload(report.id, `${report.title}.pdf`)}
                  disabled={downloadingId === report.id}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{downloadingId === report.id ? 'Mengunduh...' : 'Unduh PDF Ringkasan'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(`${report.id}-csv`, `${report.title}_data.csv`)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Ekspor raw data komentar sampel ke CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-3.5 bg-slate-50 rounded-lg text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Ringkasan Eksekutif:</strong>
              {report.summary}
            </div>

            {/* Structured Findings: Data Empiris vs Interpretasi & Rekomendasi */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">
                Poin Temuan & Kajian Analis:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {report.keyFindings.map((finding, idx) => {
                  const isData = finding.startsWith('Temuan Data')
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs leading-relaxed ${
                        isData
                          ? 'bg-blue-50/40 border-blue-200 text-blue-950'
                          : 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {isData ? (
                          <>
                            <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="text-blue-700">Fakta Data Empiris</span>
                          </>
                        ) : (
                          <>
                            <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-emerald-700">Interpretasi & Rekomendasi</span>
                          </>
                        )}
                      </div>
                      <p>{finding.replace(/^(Temuan Data:\s*|Interpretasi Analis:\s*|Rekomendasi Kebijakan:\s*)/, '')}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Ukuran Dokumen: {report.fileSize}</span>
              <span>Integritas Terverifikasi • MBG Intelligence Suite</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
