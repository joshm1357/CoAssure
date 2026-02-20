'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UploadedField {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

export default function UploadTemplatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'upload' | 'photo'>('manual');
  const [fields, setFields] = useState<UploadedField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [saved, setSaved] = useState(false);
  const [uploadedText, setUploadedText] = useState('');

  const FIELD_TYPES = [
    { value: 'text', label: 'Short text' },
    { value: 'textarea', label: 'Long text' },
    { value: 'yes_no', label: 'Yes / No' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Dropdown' },
    { value: 'signature', label: 'Signature' },
    { value: 'risk_matrix', label: 'Risk Matrix' },
  ];

  const addField = () => {
    if (!newFieldLabel.trim()) return;
    setFields(prev => [...prev, {
      id: `field-${Date.now()}`,
      label: newFieldLabel,
      type: newFieldType,
      required: false,
    }]);
    setNewFieldLabel('');
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const toggleRequired = (id: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, required: !f.required } : f));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read text/CSV files to extract field names
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedText(text);

      // Try to extract field names from common formats
      const lines = text.split('\n').filter(l => l.trim());
      const extractedFields: UploadedField[] = [];

      for (const line of lines) {
        const cleaned = line.replace(/^[-*•\d.)\s]+/, '').trim();
        if (cleaned && cleaned.length > 2 && cleaned.length < 100) {
          // Guess field type from content
          let type = 'text';
          const lower = cleaned.toLowerCase();
          if (lower.includes('signature')) type = 'signature';
          else if (lower.includes('date')) type = 'date';
          else if (lower.includes('yes') || lower.includes('no') || lower.includes('y/n')) type = 'yes_no';
          else if (lower.includes('description') || lower.includes('details') || lower.includes('notes') || lower.includes('comments')) type = 'textarea';
          else if (lower.includes('number') || lower.includes('quantity') || lower.includes('count')) type = 'number';
          else if (lower.includes('risk') && lower.includes('rating')) type = 'risk_matrix';

          extractedFields.push({
            id: `field-${Date.now()}-${extractedFields.length}`,
            label: cleaned,
            type,
            required: false,
          });
        }
      }

      if (extractedFields.length > 0) {
        setFields(extractedFields);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    if (!formName.trim() || fields.length === 0) return;

    // Build template schema
    const template = {
      id: `custom-${Date.now()}`,
      form_type: 'custom',
      name: formName,
      description: formDescription,
      version: 1,
      is_standard: false,
      schema: {
        sections: [{
          id: 'main',
          title: formName,
          description: formDescription,
          fields: fields.map(f => ({
            id: f.id,
            label: f.label,
            type: f.type,
            required: f.required,
            ai_prompt: `What is the ${f.label.toLowerCase()}?`,
          })),
        }],
      },
      ai_instructions: `Walk through this custom form conversationally. For each field, ask a natural question based on the field label. Don't read out field labels mechanically — ask questions. Auto-fill what you can from context. At the end, output the completed form data.`,
    };

    // Store in localStorage for now (in production: Supabase)
    const existing = JSON.parse(localStorage.getItem('coassure_custom_templates') || '[]');
    existing.push(template);
    localStorage.setItem('coassure_custom_templates', JSON.stringify(existing));

    setSaved(true);
    setTimeout(() => router.push('/org'), 1000);
  };

  if (saved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Template Saved</h2>
          <p className="text-sm text-zinc-500">Your team can now fill out &ldquo;{formName}&rdquo; by talking to CoAssure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/org" className="text-sky-600 text-sm font-medium">&larr; Organisation</Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Upload Form</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Form name */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Form Name</label>
            <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 dark:text-white"
              placeholder="e.g. Hot Work Permit, Excavation Checklist" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
            <input type="text" value={formDescription} onChange={e => setFormDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 dark:text-white"
              placeholder="Brief description of when this form is used" />
          </div>
        </div>

        {/* Upload method */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          {[
            { id: 'manual', label: 'Build' },
            { id: 'upload', label: 'Upload File' },
            { id: 'photo', label: 'Photo' },
          ].map(m => (
            <button key={m.id} onClick={() => setUploadMethod(m.id as typeof uploadMethod)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMethod === m.id ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
              {m.label}
            </button>
          ))}
        </div>

        {uploadMethod === 'upload' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              Upload a text file, CSV, or similar with your form fields. CoAssure will extract the field names automatically.
            </p>
            <input ref={fileInputRef} type="file" accept=".txt,.csv,.tsv" onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl py-8 text-center hover:border-sky-400 transition-colors">
              <svg className="w-8 h-8 text-zinc-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-zinc-500">Tap to select a file</p>
              <p className="text-xs text-zinc-400 mt-1">.txt, .csv supported</p>
            </button>
            {uploadedText && (
              <p className="text-xs text-emerald-600 mt-2">Extracted {fields.length} fields from file</p>
            )}
          </div>
        )}

        {uploadMethod === 'photo' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              Take a photo of a paper form. CoAssure will extract the fields using AI. (Coming soon)
            </p>
            <div className="w-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl py-8 text-center opacity-50">
              <svg className="w-8 h-8 text-zinc-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-zinc-500">Photo scan — coming soon</p>
            </div>
          </div>
        )}

        {/* Field builder */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Form Fields ({fields.length})
          </h3>

          {/* Add field */}
          <div className="flex gap-2">
            <input type="text" value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addField()}
              className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-800 dark:text-white"
              placeholder="Field name" />
            <select value={newFieldType} onChange={e => setNewFieldType(e.target.value)}
              className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-2 py-2 text-sm bg-white dark:bg-zinc-800 dark:text-white">
              {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button onClick={addField} className="bg-sky-600 text-white rounded-lg px-3 py-2 text-sm font-medium">Add</button>
          </div>

          {/* Field list */}
          {fields.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                  <span className="text-xs text-zinc-400 w-5">{i + 1}</span>
                  <span className="text-sm text-zinc-900 dark:text-white flex-1">{field.label}</span>
                  <span className="text-[10px] text-zinc-500 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">{field.type}</span>
                  <button onClick={() => toggleRequired(field.id)}
                    className={`text-[10px] px-2 py-0.5 rounded ${field.required ? 'bg-red-100 text-red-700' : 'bg-zinc-200 text-zinc-500'}`}>
                    {field.required ? 'Required' : 'Optional'}
                  </button>
                  <button onClick={() => removeField(field.id)} className="text-zinc-400 hover:text-red-500 text-sm">&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={!formName.trim() || fields.length === 0}
          className="w-full bg-sky-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-sky-700 disabled:opacity-50">
          Save Template
        </button>
        <p className="text-xs text-zinc-400 text-center">
          Workers will be able to fill out this form by talking to CoAssure. The AI will walk through each field conversationally.
        </p>
      </div>
    </div>
  );
}
