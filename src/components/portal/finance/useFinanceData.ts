import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useFinanceData(month?: string) {
  const { activeWorkplace } = useWorkplace();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const workplaceId = activeWorkplace?.id;

  // Current month YYYY-MM
  const currentMonth = month || new Date().toISOString().slice(0, 7);
  const startDate = `${currentMonth}-01`;
  const endDate = new Date(Number(currentMonth.slice(0, 4)), Number(currentMonth.slice(5, 7)), 0)
    .toISOString().slice(0, 10);

  const incomeQuery = useQuery({
    queryKey: ["finance-income", workplaceId, currentMonth],
    queryFn: async () => {
      if (!workplaceId) return [];
      const { data, error } = await supabase
        .from("finance_income")
        .select("*")
        .eq("workplace_id", workplaceId)
        .gte("invoice_date", startDate)
        .lte("invoice_date", endDate)
        .order("invoice_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!workplaceId,
  });

  const expensesQuery = useQuery({
    queryKey: ["finance-expenses", workplaceId, currentMonth],
    queryFn: async () => {
      if (!workplaceId) return [];
      const { data, error } = await supabase
        .from("finance_expenses")
        .select("*")
        .eq("workplace_id", workplaceId)
        .gte("expense_date", startDate)
        .lte("expense_date", endDate)
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!workplaceId,
  });

  const receiptsQuery = useQuery({
    queryKey: ["finance-receipts", workplaceId, currentMonth],
    queryFn: async () => {
      if (!workplaceId) return [];
      const { data, error } = await supabase
        .from("finance_receipts")
        .select("*")
        .eq("workplace_id", workplaceId)
        .gte("created_at", `${startDate}T00:00:00`)
        .lte("created_at", `${endDate}T23:59:59`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!workplaceId,
  });

  const settingsQuery = useQuery({
    queryKey: ["finance-settings", workplaceId],
    queryFn: async () => {
      if (!workplaceId) return null;
      const { data, error } = await supabase
        .from("finance_settings")
        .select("*")
        .eq("workplace_id", workplaceId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!workplaceId,
  });

  const vatDepositsQuery = useQuery({
    queryKey: ["finance-vat-deposits", workplaceId, currentMonth],
    queryFn: async () => {
      if (!workplaceId) return [];
      const { data, error } = await supabase
        .from("finance_vat_deposits")
        .select("*")
        .eq("workplace_id", workplaceId)
        .gte("deposit_date", startDate)
        .lte("deposit_date", endDate)
        .order("deposit_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!workplaceId,
  });

  // Computed values
  const income = incomeQuery.data || [];
  const expenses = expensesQuery.data || [];
  const receipts = receiptsQuery.data || [];
  const vatDeposits = vatDepositsQuery.data || [];

  const totalIncomeExclVat = income.reduce((s, i) => s + Number(i.amount_excl_vat || 0), 0);
  const totalIncomeVat = income.reduce((s, i) => s + Number(i.vat_amount || 0), 0);
  const totalIncomeInclVat = income.reduce((s, i) => s + Number(i.amount_incl_vat || 0), 0);

  const businessExpenses = expenses.filter(e => !e.is_personal_withdrawal);
  const personalWithdrawals = expenses.filter(e => e.is_personal_withdrawal);
  const totalExpensesExclVat = businessExpenses.reduce((s, e) => s + Number(e.amount_excl_vat || 0), 0);
  const totalExpensesVat = businessExpenses.reduce((s, e) => s + Number(e.vat_amount || 0), 0);

  const vatToPay = totalIncomeVat - totalExpensesVat;
  const result = totalIncomeExclVat - totalExpensesExclVat;
  const recommendedVatDeposit = totalIncomeExclVat * 0.25;
  const totalVatDeposited = vatDeposits.reduce((s, d) => s + Number(d.amount || 0), 0);
  const vatDifference = recommendedVatDeposit - totalVatDeposited;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["finance-income", workplaceId] });
    queryClient.invalidateQueries({ queryKey: ["finance-expenses", workplaceId] });
    queryClient.invalidateQueries({ queryKey: ["finance-receipts", workplaceId] });
    queryClient.invalidateQueries({ queryKey: ["finance-vat-deposits", workplaceId] });
    queryClient.invalidateQueries({ queryKey: ["finance-settings", workplaceId] });
  };

  // Mutations
  const addIncome = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("finance_income").insert({
        ...data,
        workplace_id: workplaceId,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Inkomst tillagd" });
    },
    onError: (e: any) => toast({ title: "Fel", description: e.message, variant: "destructive" }),
  });

  const addExpense = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("finance_expenses").insert({
        ...data,
        workplace_id: workplaceId,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Utgift tillagd" });
    },
    onError: (e: any) => toast({ title: "Fel", description: e.message, variant: "destructive" }),
  });

  const addReceipt = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("finance_receipts").insert({
        ...data,
        workplace_id: workplaceId,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Kvitto sparat" });
    },
    onError: (e: any) => toast({ title: "Fel", description: e.message, variant: "destructive" }),
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("finance_income").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast({ title: "Inkomst raderad" }); },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("finance_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast({ title: "Utgift raderad" }); },
  });

  return {
    income, expenses, receipts, vatDeposits, settings: settingsQuery.data,
    totalIncomeExclVat, totalIncomeVat, totalIncomeInclVat,
    totalExpensesExclVat, totalExpensesVat,
    businessExpenses, personalWithdrawals,
    vatToPay, result, recommendedVatDeposit, totalVatDeposited, vatDifference,
    addIncome, addExpense, addReceipt, deleteIncome, deleteExpense,
    invalidateAll, isLoading: incomeQuery.isLoading || expensesQuery.isLoading,
    currentMonth, workplaceId,
  };
}
