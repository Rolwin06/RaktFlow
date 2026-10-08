export type AuditCategory =
  | 'request'
  | 'inventory'
  | 'transfer'
  | 'emergency'
  | 'donor'
  | 'system'
  | 'confirmation';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
  id: string;
  category: AuditCategory;
  severity: AuditSeverity;
  action: string;
  description: string;
  entityId?: string;
  entityType?: string;
  bankId?: string;
  bankName?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}
