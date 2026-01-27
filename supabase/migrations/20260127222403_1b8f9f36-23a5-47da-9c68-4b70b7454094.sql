-- =============================================
-- WORKBUDDY DATABASE SCHEMA
-- =============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin', 'workplace_admin', 'employee');
CREATE TYPE public.admin_request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.invite_code_status AS ENUM ('active', 'paused');

-- 2. WORKPLACES TABLE
CREATE TABLE public.workplaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  workplace_type TEXT,
  workplace_code TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PROFILES TABLE (linked to workplace)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  workplace_id UUID REFERENCES public.workplaces(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. USER ROLES TABLE (separate as required)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  workplace_id UUID REFERENCES public.workplaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, workplace_id)
);

-- 5. ADMIN REQUESTS TABLE (approval flow)
CREATE TABLE public.admin_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  status admin_request_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  UNIQUE(user_id, workplace_id)
);

-- 6. INVITE CODES TABLE
CREATE TABLE public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status invite_code_status NOT NULL DEFAULT 'active',
  uses_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. ROUTINES TABLE (SOPs)
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. IMPORTANT TIMES TABLE
CREATE TABLE public.important_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  time_value TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. CONTACTS TABLE
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  is_emergency BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. CHECKLISTS TABLE
CREATE TABLE public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  items JSONB DEFAULT '[]',
  is_template BOOLEAN DEFAULT false,
  for_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. SCHEDULES TABLE
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  shift_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  role TEXT,
  notes TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. ANNOUNCEMENTS TABLE
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. DEMO PROMPTS TABLE
CREATE TABLE public.demo_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. CONTACT LEADS TABLE (from public website form)
CREATE TABLE public.contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  workplace_type TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. CHAT MESSAGES TABLE (for AI assistant history)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SECURITY DEFINER FUNCTIONS (for RLS)
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user has role in specific workplace
CREATE OR REPLACE FUNCTION public.has_workplace_role(_user_id UUID, _role app_role, _workplace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role = _role 
    AND (workplace_id = _workplace_id OR workplace_id IS NULL)
  )
$$;

-- Get user's workplace ID
CREATE OR REPLACE FUNCTION public.get_user_workplace_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workplace_id FROM public.profiles WHERE id = _user_id
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Check if user is workplace admin for a workplace
CREATE OR REPLACE FUNCTION public.is_workplace_admin(_user_id UUID, _workplace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role = 'workplace_admin' 
    AND workplace_id = _workplace_id
  )
$$;

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.workplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- WORKPLACES: Public can verify codes, users see their own
CREATE POLICY "Anyone can verify workplace codes"
  ON public.workplaces FOR SELECT
  USING (true);

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Workplace admin can view workplace profiles"
  ON public.profiles FOR SELECT
  USING (
    workplace_id = public.get_user_workplace_id(auth.uid())
    OR public.is_workplace_admin(auth.uid(), workplace_id)
  );

-- USER ROLES
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Super admin can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- ADMIN REQUESTS
CREATE POLICY "Users can view own requests"
  ON public.admin_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create requests"
  ON public.admin_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin can view all requests"
  ON public.admin_requests FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can update requests"
  ON public.admin_requests FOR UPDATE
  USING (public.is_super_admin(auth.uid()));

-- INVITE CODES
CREATE POLICY "Anyone can verify invite codes"
  ON public.invite_codes FOR SELECT
  USING (true);

CREATE POLICY "Workplace admin can manage invite codes"
  ON public.invite_codes FOR ALL
  USING (public.is_workplace_admin(auth.uid(), workplace_id) OR public.is_super_admin(auth.uid()));

-- ROUTINES (workplace isolated)
CREATE POLICY "Users can view workplace routines"
  ON public.routines FOR SELECT
  USING (workplace_id = public.get_user_workplace_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage routines"
  ON public.routines FOR ALL
  USING (public.is_workplace_admin(auth.uid(), workplace_id) OR public.is_super_admin(auth.uid()));

-- IMPORTANT TIMES
CREATE POLICY "Users can view workplace times"
  ON public.important_times FOR SELECT
  USING (workplace_id = public.get_user_workplace_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage times"
  ON public.important_times FOR ALL
  USING (public.is_workplace_admin(auth.uid(), workplace_id) OR public.is_super_admin(auth.uid()));

-- CONTACTS
CREATE POLICY "Users can view workplace contacts"
  ON public.contacts FOR SELECT
  USING (workplace_id = public.get_user_workplace_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage contacts"
  ON public.contacts FOR ALL
  USING (public.is_workplace_admin(auth.uid(), workplace_id) OR public.is_super_admin(auth.uid()));

-- CHECKLISTS
CREATE POLICY "Users can view workplace checklists"
  ON public.checklists FOR SELECT
  USING (workplace_id = public.get_user_workplace_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage checklists"
  ON public.checklists FOR ALL
  USING (public.is_workplace_admin(auth.uid(), workplace_id) OR public.is_super_admin(auth.uid()));

-- Allow users to create checklists (AI-generated)
CREATE POLICY "Users can create checklists"
  ON public.checklists FOR INSERT
  WITH CHECK (workplace_id = public.get_user_workplace_id(auth.uid()));

-- SCHEDULES
CREATE POLICY "Users can view workplace schedules"
  ON public.schedules FOR SELECT
  USING (workplace_id = public.get_user_workplace_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage schedules"
  ON public.schedules FOR ALL
  USING (public.is_workplace_admin(auth.uid(), workplace_id) OR public.is_super_admin(auth.uid()));

-- ANNOUNCEMENTS
CREATE POLICY "Users can view workplace announcements"
  ON public.announcements FOR SELECT
  USING (workplace_id = public.get_user_workplace_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (public.is_workplace_admin(auth.uid(), workplace_id) OR public.is_super_admin(auth.uid()));

-- DEMO PROMPTS
CREATE POLICY "Users can view workplace prompts"
  ON public.demo_prompts FOR SELECT
  USING (workplace_id = public.get_user_workplace_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage prompts"
  ON public.demo_prompts FOR ALL
  USING (public.is_workplace_admin(auth.uid(), workplace_id) OR public.is_super_admin(auth.uid()));

-- CONTACT LEADS (super admin only)
CREATE POLICY "Super admin can view leads"
  ON public.contact_leads FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Anyone can submit leads"
  ON public.contact_leads FOR INSERT
  WITH CHECK (true);

-- CHAT MESSAGES
CREATE POLICY "Users can view own messages"
  ON public.chat_messages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (user_id = auth.uid() AND workplace_id = public.get_user_workplace_id(auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workplaces_updated_at
  BEFORE UPDATE ON public.workplaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invite_codes_updated_at
  BEFORE UPDATE ON public.invite_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();