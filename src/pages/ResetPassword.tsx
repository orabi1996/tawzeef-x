import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/marketing/SEO";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [hasAuthSession, setHasAuthSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in query parameters
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || "";
    const e = params.get("email") || "";
    setToken(t);
    setEmail(e);
    supabase.auth.getSession().then(({ data }) => setHasAuthSession(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasAuthSession(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "خطأ", description: "كلمات المرور غير متطابقة", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    if ((!token || !email) && !hasAuthSession) {
      toast({ title: "خطأ", description: "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (token && email) {
        const { data, error } = await supabase.functions.invoke("execute-password-reset", {
          body: { email, token, password },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
      } else {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("انتهت صلاحية رابط الدعوة، اطلب دعوة جديدة.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        await supabase.auth.signOut();
      }

      setSuccess(true);
      setTimeout(() => navigate("/auth?mode=login"), 2500);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const focused = (field: string) => focusedField === field;

  const inputCls = (field: string) =>
    `h-[50px] pr-12 pl-12 rounded-2xl text-[15px] font-medium transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${
      focused(field)
        ? "bg-white border-[hsl(222,65%,50%)] shadow-[0_0_0_4px_hsl(222_65%_50%/0.06)]"
        : "bg-[hsl(220,25%,97.5%)] border-[hsl(220,18%,90%)] hover:border-[hsl(220,18%,82%)]"
    } text-[hsl(222,25%,18%)] placeholder:text-[hsl(222,10%,68%)]`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(220,30%,98%)] via-[hsl(230,25%,96%)] to-[hsl(210,35%,94%)]" dir="rtl">
      <SEO title="تعيين كلمة مرور جديدة | TawzeefX" description="تعيين كلمة مرور جديدة لحسابك" noindex={true} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] mx-auto px-6"
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <h1
                className="text-[28px] font-black text-[hsl(222,25%,14%)] mb-2 leading-tight"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                تعيين كلمة مرور جديدة 🔑
              </h1>
              <p
                className="text-[hsl(222,12%,52%)] text-[15px] font-medium mb-8"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                أدخل كلمة المرور الجديدة لحسابك
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[13px] font-bold text-[hsl(222,15%,40%)] mb-2 block" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <Lock className={`absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-300 ${focused("password") ? "text-[hsl(222,65%,50%)]" : "text-[hsl(222,12%,68%)]"}`} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className={inputCls("password")}
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                      dir="ltr"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(222,12%,62%)] hover:text-[hsl(222,20%,35%)] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[hsl(222,15%,40%)] mb-2 block" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className={`absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-300 ${focused("confirm") ? "text-[hsl(222,65%,50%)]" : "text-[hsl(222,12%,68%)]"}`} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField("confirm")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className={inputCls("confirm")}
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                      dir="ltr"
                      minLength={6}
                      required
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[12px] text-[hsl(0,68%,50%)] mt-1.5 font-medium"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      كلمات المرور غير متطابقة
                    </motion.p>
                  )}
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading || password !== confirmPassword}
                    className="w-full h-[52px] rounded-2xl text-[16px] font-bold border-0 transition-all duration-300 bg-[hsl(222,65%,46%)] hover:bg-[hsl(222,65%,40%)] hover:shadow-[0_8px_25px_-5px_hsl(222_65%_46%/0.35)] text-white"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2.5">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري الحفظ...
                      </span>
                    ) : (
                      "حفظ كلمة المرور الجديدة"
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-[hsl(152,56%,40%/0.1)] flex items-center justify-center mx-auto mb-5"
              >
                <CheckCircle2 className="w-8 h-8 text-[hsl(152,56%,40%)]" />
              </motion.div>
              <h2 className="text-[22px] font-black text-[hsl(222,25%,14%)] mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                تم التحديث بنجاح ✅
              </h2>
              <p className="text-[hsl(222,12%,52%)] text-[15px] font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>
                جاري تحويلك إلى لوحة التحكم...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
