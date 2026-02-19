
INSERT INTO public.workplaces (name, company_name, industry, workplace_type, workplace_code, settings)
VALUES (
  'WorkBuddy Presentation',
  'WorkBuddy AB',
  'Tech',
  'Presentation',
  'WBPRESENTATION',
  '{"presentation_mode": true, "enabled_features": ["dashboard", "team-chat", "schedule", "checklists", "routines", "announcements", "incidents", "certificates", "employees", "camera", "documents", "photos"]}'::jsonb
);
