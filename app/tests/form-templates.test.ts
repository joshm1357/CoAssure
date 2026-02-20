import { describe, it, expect } from 'vitest';
import {
  STANDARD_TEMPLATES,
  getStandardTemplate,
  getStandardTemplateById,
  getAllTemplates,
  buildFormPromptContext,
  getAutoFillFields,
} from '@/lib/form-templates/index';

describe('Standard Form Templates', () => {
  it('has all 4 standard templates', () => {
    expect(STANDARD_TEMPLATES).toHaveLength(4);
    expect(STANDARD_TEMPLATES.map(t => t.form_type)).toContain('take5');
    expect(STANDARD_TEMPLATES.map(t => t.form_type)).toContain('jsa');
    expect(STANDARD_TEMPLATES.map(t => t.form_type)).toContain('swms');
    expect(STANDARD_TEMPLATES.map(t => t.form_type)).toContain('site_diary');
  });

  it('all templates are marked as standard', () => {
    for (const template of STANDARD_TEMPLATES) {
      expect(template.is_standard).toBe(true);
    }
  });

  it('all templates have ai_instructions', () => {
    for (const template of STANDARD_TEMPLATES) {
      expect(template.ai_instructions).toBeTruthy();
      expect(template.ai_instructions.length).toBeGreaterThan(50);
    }
  });

  it('all templates have at least one section', () => {
    for (const template of STANDARD_TEMPLATES) {
      expect(template.schema.sections.length).toBeGreaterThan(0);
    }
  });
});

describe('Take 5 Template', () => {
  const take5 = getStandardTemplate('take5');

  it('exists and is found by form_type', () => {
    expect(take5).not.toBeNull();
    expect(take5!.name).toContain('Take 5');
  });

  it('has the 7 SLACM sections', () => {
    expect(take5!.schema.sections.length).toBe(7);
    expect(take5!.schema.sections.map(s => s.id)).toContain('stop_think');
    expect(take5!.schema.sections.map(s => s.id)).toContain('look_hazards');
    expect(take5!.schema.sections.map(s => s.id)).toContain('assess_risk');
    expect(take5!.schema.sections.map(s => s.id)).toContain('control');
    expect(take5!.schema.sections.map(s => s.id)).toContain('monitor');
    expect(take5!.schema.sections.map(s => s.id)).toContain('signoff');
  });

  it('has hazard checkboxes for common construction hazards', () => {
    const hazards = take5!.schema.sections.find(s => s.id === 'look_hazards');
    expect(hazards).toBeTruthy();
    const labels = hazards!.fields.map(f => f.label.toLowerCase());
    expect(labels.some(l => l.includes('height'))).toBe(true);
    expect(labels.some(l => l.includes('electrical'))).toBe(true);
    expect(labels.some(l => l.includes('manual handling'))).toBe(true);
    expect(labels.some(l => l.includes('confined'))).toBe(true);
  });

  it('has risk matrix field', () => {
    const assess = take5!.schema.sections.find(s => s.id === 'assess_risk');
    const riskField = assess!.fields.find(f => f.type === 'risk_matrix');
    expect(riskField).toBeTruthy();
  });

  it('has signature field', () => {
    const signoff = take5!.schema.sections.find(s => s.id === 'signoff');
    const sigField = signoff!.fields.find(f => f.type === 'signature');
    expect(sigField).toBeTruthy();
  });
});

describe('JSA Template', () => {
  const jsa = getStandardTemplate('jsa');

  it('has repeatable risk assessment section', () => {
    const riskAssessment = jsa!.schema.sections.find(s => s.id === 'risk_assessment');
    expect(riskAssessment).toBeTruthy();
    expect(riskAssessment!.repeatable).toBe(true);
  });

  it('has PPE section', () => {
    const ppe = jsa!.schema.sections.find(s => s.id === 'ppe');
    expect(ppe).toBeTruthy();
    expect(ppe!.fields.length).toBeGreaterThan(5);
  });

  it('has worker signoff section', () => {
    const signoff = jsa!.schema.sections.find(s => s.id === 'worker_signoff');
    expect(signoff).toBeTruthy();
    expect(signoff!.repeatable).toBe(true);
  });
});

describe('SWMS Template', () => {
  const swms = getStandardTemplate('swms');

  it('has all 18 HRCW categories', () => {
    const hrcw = swms!.schema.sections.find(s => s.id === 'hrcw');
    expect(hrcw).toBeTruthy();
    expect(hrcw!.fields).toHaveLength(18);
  });

  it('includes asbestos removal in HRCW', () => {
    const hrcw = swms!.schema.sections.find(s => s.id === 'hrcw');
    const asbestos = hrcw!.fields.find(f => f.id === 'hrcw_asbestos');
    expect(asbestos).toBeTruthy();
    expect(asbestos!.label.toLowerCase()).toContain('asbestos');
  });

  it('has consultation record section', () => {
    const consult = swms!.schema.sections.find(s => s.id === 'consultation');
    expect(consult).toBeTruthy();
    expect(consult!.repeatable).toBe(true);
  });

  it('has review log section', () => {
    const review = swms!.schema.sections.find(s => s.id === 'review_log');
    expect(review).toBeTruthy();
  });
});

describe('Template Utility Functions', () => {
  it('getStandardTemplateById returns correct template', () => {
    const template = getStandardTemplateById('standard-take5');
    expect(template).not.toBeNull();
    expect(template!.form_type).toBe('take5');
  });

  it('returns null for non-existent template', () => {
    expect(getStandardTemplate('nonexistent')).toBeNull();
    expect(getStandardTemplateById('nonexistent')).toBeNull();
  });

  it('getAllTemplates includes all standard templates', () => {
    const all = getAllTemplates();
    expect(all.length).toBeGreaterThanOrEqual(4);
  });

  it('buildFormPromptContext creates useful prompt', () => {
    const take5 = getStandardTemplate('take5')!;
    const context = buildFormPromptContext(take5);
    expect(context).toContain('Take 5');
    expect(context).toContain('FORM STRUCTURE');
    expect(context).toContain('conversationally');
  });

  it('getAutoFillFields extracts auto-fill mappings', () => {
    const take5 = getStandardTemplate('take5')!;
    const autoFills = getAutoFillFields(take5);
    expect(autoFills.length).toBeGreaterThan(0);
    expect(autoFills.some(f => f.autoFill === 'today')).toBe(true);
    expect(autoFills.some(f => f.autoFill === 'worker.name')).toBe(true);
  });
});

describe('Billing', () => {
  it('plans are correctly defined', async () => {
    const { PLANS, canUseFeature, isWithinSessionLimit } = await import('@/lib/billing');
    expect(Object.keys(PLANS)).toHaveLength(3);
    expect(PLANS.free.price).toBe(0);
    expect(PLANS.pro.price).toBe(19);
  });

  it('free plan has export enabled', async () => {
    const { canUseFeature } = await import('@/lib/billing');
    expect(canUseFeature('free', 'export')).toBe(true);
    expect(canUseFeature('free', 'reporting')).toBe(true);
  });

  it('free plan has session limit', async () => {
    const { isWithinSessionLimit } = await import('@/lib/billing');
    expect(isWithinSessionLimit('free', 5)).toBe(true);
    expect(isWithinSessionLimit('free', 10)).toBe(false);
  });

  it('pro plan has unlimited sessions', async () => {
    const { isWithinSessionLimit } = await import('@/lib/billing');
    expect(isWithinSessionLimit('pro', 1000)).toBe(true);
  });

  it('free plan cannot use custom forms', async () => {
    const { canUseFeature } = await import('@/lib/billing');
    expect(canUseFeature('free', 'custom_forms')).toBe(false);
  });

  it('pro plan can use custom forms', async () => {
    const { canUseFeature } = await import('@/lib/billing');
    expect(canUseFeature('pro', 'custom_forms')).toBe(true);
  });
});

describe('Demo Data', () => {
  it('loads demo data into localStorage', async () => {
    const { loadDemoData, isDemoMode, DEMO_WORKER, DEMO_SESSIONS, DEMO_REPORTS } = await import('@/lib/demo-data');

    loadDemoData();

    expect(isDemoMode()).toBe(true);
    expect(localStorage.getItem('coassure_worker_id')).toBe(DEMO_WORKER.id);

    const sessions = JSON.parse(localStorage.getItem('coassure_sessions') || '[]');
    expect(sessions.length).toBe(DEMO_SESSIONS.length);

    const reports = JSON.parse(localStorage.getItem('coassure_reports') || '[]');
    expect(reports.length).toBe(DEMO_REPORTS.length);
  });

  it('demo sessions have realistic summaries', async () => {
    const { DEMO_SESSIONS } = await import('@/lib/demo-data');

    for (const session of DEMO_SESSIONS) {
      expect(session.summary).toBeTruthy();
      expect(session.summary!.length).toBeGreaterThan(100);
      expect(session.status).toBe('completed');
    }
  });

  it('demo reports have descriptions and types', async () => {
    const { DEMO_REPORTS } = await import('@/lib/demo-data');

    for (const report of DEMO_REPORTS) {
      expect(report.description).toBeTruthy();
      expect(['near-miss', 'hazard', 'good-catch', 'observation']).toContain(report.report_type);
    }
  });

  it('demo training includes expiring and expired certs', async () => {
    const { DEMO_TRAINING } = await import('@/lib/demo-data');

    const statuses = DEMO_TRAINING.map(t => t.status);
    expect(statuses).toContain('current');
    expect(statuses).toContain('expiring');
    expect(statuses).toContain('expired');
  });
});
