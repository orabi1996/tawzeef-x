import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Agency {
  id: string;
  name: string;
  name_en: string | null;
  license_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  country: string | null;
  city: string | null;
  logo_url: string | null;
  owner_user_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface AgencyAssignment {
  id: string;
  agency_id: string;
  company_id: string;
  candidate_id: string | null;
  scope: "company" | "candidate";
  status: string;
  notes: string | null;
  created_at: string;
}

export function useAllAgencies() {
  return useQuery({
    queryKey: ["all-agencies"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencies" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Agency[];
    },
  });
}

export function useMyAgencies() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-agencies", user?.id],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("agency_members" as any)
          .select("member_role, agency:agency_id(*)")
          .eq("user_id", user.id);

        if (!error && data && data.length > 0) {
          return (data as any[]).map((r) => ({ ...r.agency, member_role: r.member_role })) as (Agency & { member_role: string })[];
        }
      }

      return [];
    },
    enabled: !!user,
  });
}

export function useCreateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Agency>) => {
      const { data, error } = await supabase
        .from("agencies" as any)
        .insert(input as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Agency;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-agencies"] });
      toast({ title: "تم إنشاء المكتب ✅" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Agency> & { id: string }) => {
      const { error } = await supabase.from("agencies" as any).update(input as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-agencies"] });
      toast({ title: "تم التحديث ✅" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agencies" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-agencies"] });
      toast({ title: "تم الحذف ✅" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });
}

export function useAgencyAssignments(agencyId?: string, companyId?: string) {
  return useQuery({
    queryKey: ["agency-assignments", agencyId, companyId],
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      let q = supabase
        .from("agency_assignments" as any)
        .select("*, company:company_id(name), agency:agency_id(name), candidate:candidate_id(name,email,stage,status)")
        .order("created_at", { ascending: false });
      if (agencyId) q = q.eq("agency_id", agencyId);
      if (companyId) q = q.eq("company_id", companyId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agency_assignments" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agency-assignments"] });
      toast({ title: "تم الإلغاء" });
    },
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<AgencyAssignment>) => {
      const { error } = await supabase.from("agency_assignments" as any).insert(input as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agency-assignments"] });
      toast({ title: "تم الربط ✅" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });
}

// Candidates assigned to an agency (via agency_id direct or assignment)
export function useAgencyCandidates(agencyId: string | undefined) {
  return useQuery({
    queryKey: ["agency-candidates", agencyId],
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const direct = await (supabase as any).from("candidates").select("*").eq("agency_id", agencyId!);
      const assignments = await supabase
        .from("agency_assignments" as any)
        .select("candidate_id, company_id")
        .eq("agency_id", agencyId!)
        .eq("status", "active")
        .not("candidate_id", "is", null);

      const idsFromAssignments = (assignments.data as any[] || []).map((a) => a.candidate_id).filter(Boolean);
      let extra: any[] = [];
      if (idsFromAssignments.length > 0) {
        const { data } = await supabase.from("candidates").select("*").in("id", idsFromAssignments);
        extra = data || [];
      }
      const all = [...(direct.data || []), ...extra];
      const unique = Array.from(new Map(all.map((c) => [c.id, c])).values());
      return unique;
    },
    enabled: !!agencyId,
  });
}
