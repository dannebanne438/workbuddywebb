-- Allow all workplace users to update checklist items (for interactive checking)
CREATE POLICY "Users can update checklist items"
ON public.checklists
FOR UPDATE
TO public
USING (
  workplace_id = public.get_user_workplace_id(auth.uid())
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  workplace_id = public.get_user_workplace_id(auth.uid())
  OR public.is_super_admin(auth.uid())
);