import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "workplace_admin" | "employee";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  workplace_id: string | null;
}

interface UserRole {
  role: AppRole;
  workplace_id: string | null;
}

interface Workplace {
  id: string;
  name: string;
  company_name: string;
  industry: string | null;
  workplace_type: string | null;
  workplace_code: string;
  settings: Record<string, unknown> | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: UserRole[];
  workplace: Workplace | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, workplaceId: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
  isWorkplaceAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [workplace, setWorkplace] = useState<Workplace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);

        // Fetch workplace if assigned
        if (profileData.workplace_id) {
          const { data: workplaceData } = await supabase
            .from("workplaces")
            .select("*")
            .eq("id", profileData.workplace_id)
            .maybeSingle();

          if (workplaceData) {
            setWorkplace(workplaceData as Workplace);
          }
        }
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role, workplace_id")
        .eq("user_id", userId);

      if (rolesData) {
        setRoles(rolesData as UserRole[]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid potential race conditions
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setProfile(null);
          setRoles([]);
          setWorkplace(null);
        }
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Use rate-limited edge function for login
      const { data: fnData, error: fnError } = await supabase.functions.invoke("auth-login", {
        body: { email, password },
      });

      if (fnError) {
        // If edge function is unavailable, fall back to direct auth
        console.warn("Rate-limited login unavailable, falling back:", fnError.message);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
      }

      if (fnData?.error) {
        return { error: new Error(fnData.error) };
      }

      if (fnData?.session) {
        // Set the session from the edge function response
        await supabase.auth.setSession({
          access_token: fnData.session.access_token,
          refresh_token: fnData.session.refresh_token,
        });
      }

      return { error: null };
    } catch (err) {
      // Fallback to direct auth on network errors
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, workplaceId: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName }
      }
    });

    if (error) return { error };

    // Create profile and role for the new user
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        full_name: fullName,
        workplace_id: workplaceId
      });

      await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: "employee",
        workplace_id: workplaceId
      });
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setWorkplace(null);
  };

  const isSuperAdmin = roles.some((r) => r.role === "super_admin");
  const isWorkplaceAdmin = roles.some((r) => r.role === "workplace_admin") || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        workplace,
        loading,
        signIn,
        signUp,
        signOut,
        isSuperAdmin,
        isWorkplaceAdmin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
