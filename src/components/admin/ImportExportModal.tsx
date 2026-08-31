import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { adminApi } from '../../utils/adminApi';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  if (!isOpen) return null;

  const [csvContent, setCsvContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    skipped: number;
    totalProcessed: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvContent(text);
      }
    };
    reader.readAsText(file);
  };

  const parseCSVToJSON = (text: string) => {
    const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.replace(/["']/g, '').trim().toLowerCase());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i];
      // Basic CSV splitter handling quotes
      const values: string[] = [];
      let currentVal = '';
      let insideQuote = false;

      for (let c = 0; c < currentLine.length; c++) {
        const char = currentLine[c];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          values.push(currentVal.trim().replace(/^"|"$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^"|"$/g, ''));

      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        record[h] = values[idx] || '';
      });

      // Map to standardized participant fields
      const fullName =
        record['full name'] || record['fullname'] || record['name'] || record['full_name'] || '';
      const email = record['email'] || record['email address'] || '';
      const whatsapp =
        record['whatsapp'] || record['phone'] || record['whatsapp number'] || record['phone number'] || '';

      if (fullName && email) {
        records.push({
          fullName,
          email,
          whatsappNumber: whatsapp,
          device: record['device'] || 'Smartphone',
          canvaExperience: record['canva experience'] || record['canva_experience'] || 'Beginner',
          learningInterest: record['learning interest'] || record['learning_interest'] || 'Everything',
          utmSource: record['utm source'] || record['source'] || 'CSV Import',
          status: record['status'] || 'REGISTERED',
        });
      }
    }

    return records;
  };

  const handleImport = async () => {
    setErrorMsg(null);
    setResult(null);

    const records = parseCSVToJSON(csvContent);
    if (records.length === 0) {
      setErrorMsg(
        'Could not find valid records. Please ensure your CSV includes headers like "Full Name", "Email", and "WhatsApp".'
      );
      return;
    }

    setIsProcessing(true);
    try {
      const res = await adminApi.importCSV(records);
      setResult(res);
      onImportSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              Import Participant Registrations
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload a CSV file or paste raw CSV text below. The importer will automatically map student names, emails, WhatsApp numbers, devices, and attribution sources.
          </p>

          {/* File Upload Button */}
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-5 text-center transition-colors">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer space-y-1 block">
              <FileSpreadsheet className="w-8 h-8 text-blue-600 mx-auto" />
              <span className="block text-xs font-bold text-slate-800">
                Click to browse and upload CSV file
              </span>
              <span className="block text-[11px] text-slate-400">Supports standard UTF-8 CSV</span>
            </label>
          </div>

          {/* Paste CSV text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Or Paste CSV Data Directly
            </label>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Full Name,Email,WhatsApp,Device,Canva Experience&#10;Onifade Sulaiman,sulaiman@example.com,08012345678,Smartphone,Beginner"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
              <p className="font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Import Complete!
              </p>
              <p>
                <strong>{result.imported}</strong> new participants added to database.
              </p>
              {result.skipped > 0 && (
                <p className="text-slate-600">
                  {result.skipped} records skipped (duplicate email or invalid data).
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleImport}
            disabled={isProcessing || !csvContent.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? 'Importing Records...' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );
};
