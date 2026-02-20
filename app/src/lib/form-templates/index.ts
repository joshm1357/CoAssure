// Standard form templates — available to all users
// Org admins can create custom templates; these are the defaults

import take5 from './take5.json';
import jsa from './jsa.json';
import swms from './swms.json';
import siteDiary from './site-diary.json';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'number' | 'yes_no' | 'checkbox' | 'checkbox_text' | 'select' | 'signature' | 'risk_matrix';
  required?: boolean;
  auto_fill?: string;
  ai_prompt?: string;
  default?: string;
  options?: string[] | Record<string, unknown>;
  show_if?: string;
  stop_if_no?: boolean;
  auto_increment?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  repeatable?: boolean;
  min_rows?: number;
  max_rows?: number;
  fields: FormField[];
}

export interface FormSchema {
  sections: FormSection[];
}

export interface FormTemplate {
  id: string;
  form_type: string;
  name: string;
  description: string;
  version: number;
  is_standard: boolean;
  schema: FormSchema;
  ai_instructions: string;
}

// All standard templates
export const STANDARD_TEMPLATES: FormTemplate[] = [
  take5 as unknown as FormTemplate,
  jsa as unknown as FormTemplate,
  swms as unknown as FormTemplate,
  siteDiary as unknown as FormTemplate,
];

export function getStandardTemplate(formType: string): FormTemplate | null {
  return STANDARD_TEMPLATES.find(t => t.form_type === formType) || null;
}

export function getStandardTemplateById(id: string): FormTemplate | null {
  return STANDARD_TEMPLATES.find(t => t.id === id) || null;
}

export function getAllTemplates(): FormTemplate[] {
  // In production, this would also load org-specific templates from Supabase
  return [...STANDARD_TEMPLATES];
}

// Build AI prompt context from a form template
export function buildFormPromptContext(template: FormTemplate): string {
  const sections = template.schema.sections.map(section => {
    const fields = section.fields
      .filter(f => f.ai_prompt)
      .map(f => `  - ${f.label}: "${f.ai_prompt}"`)
      .join('\n');

    const fieldList = section.fields
      .map(f => `  - ${f.label} (${f.type}${f.required ? ', required' : ''})`)
      .join('\n');

    return `${section.title}:\n${fieldList}${fields ? `\n  AI prompts:\n${fields}` : ''}`;
  }).join('\n\n');

  return `FORM: ${template.name}
${template.description}

${template.ai_instructions}

FORM STRUCTURE:
${sections}

IMPORTANT: Walk through the form conversationally using the AI prompts as guide questions. Don't read out field labels — ask natural questions. Auto-fill what you can from context (date, location, weather, worker details). At the end, output the completed form data in a structured format that maps to the fields above.`;
}

// Extract auto-fillable values from a form template
export function getAutoFillFields(template: FormTemplate): { fieldId: string; autoFill: string }[] {
  const result: { fieldId: string; autoFill: string }[] = [];
  for (const section of template.schema.sections) {
    for (const field of section.fields) {
      if (field.auto_fill) {
        result.push({ fieldId: `${section.id}.${field.id}`, autoFill: field.auto_fill });
      }
    }
  }
  return result;
}
