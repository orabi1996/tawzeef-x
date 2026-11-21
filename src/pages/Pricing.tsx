import tawzeefLogo from "@/assets/tawzeef-x-logo.png";
import { useSubscriptionPlans } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap, ArrowLeft  } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import CheckoutModal from "@/components/CheckoutModal";
import { SEO } from "@/components/marketing/SEO";
import { useState } from "react";

const planIcons: Record<string, any> = {
  free: Zap,
  basic: Sparkles,
  pro: Crown,
};

const planColors: Record<string, string> = {
  free: "from-muted to-muted/50",
  basic: "from-primary/10 to-primary/5",
  pro: "from-primary to-primary/80",
};

export default function Pricing() {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const { user } = useAuth();
  const { role } = useUserRole();
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    name_ar: string;
    price: number;
    limit: number;
  } | null>(null);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEO
        title="باقات وأسعار TawzeefX | خطط التوظيف الذكي للشركات وأصحاب الأعمال"
        description="تعرف على باقات وخطط أسعار TawzeefX للتوظيف واستقطاب الكفاءات ونشر الوظائف. باقات مرنة تناسب الشركات ومسؤولي التوظيف بمختلف الأحجام."
        canonical="https://www.tawzeefx.com/pricing"
      />
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={tawzeefLogo} alt="Tawzeef-X" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
              Tawzeef-X <span className="text-primary">منصة التوظيف</span>
            </span>
          </Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span style={{ fontFamily: "'Cairo', sans-serif" }}>تسجيل الدخول</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-semibold">
            💰 خطط الأسعار والاشتراكات
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
            اختر الباقة المناسبة لشركتك
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto" style={{ fontFamily: "'Cairo', sans-serif" }}>
            ابدأ مجاناً وقدم طلب ترقية الباقة حسب احتياجاتك ليقوم فريق الإدارة بتفعيلها فوراً.
          </p>
        </motion.div>

        {/* Plans */}
        {isLoading ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans?.map((plan, i) => {
              const Icon = planIcons[plan.name] || Zap;
              const isPro = plan.name === "pro";
              const isBasic = plan.name === "basic";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                    isPro
                      ? "border-primary bg-primary/[0.03] shadow-xl shadow-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-bold">
                        الأكثر شعبية ⭐
                      </Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      isPro ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {plan.name_ar}
                    </h3>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {plan.price === 0 ? "مجاني" : plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
                          {plan.currency} / شهرياً
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {plan.job_posts_limit === -1 ? "منشورات غير محدودة" : `${plan.job_posts_limit} منشور توظيف`}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature: string, fi: number) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPro ? "text-primary" : "text-green-500"}`} />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {user && (role === "recruiter" || role === "admin" || role === "super_admin") ? (
                    <Button
                      onClick={() => setSelectedPlan({
                        id: plan.id,
                        name: plan.name,
                        name_ar: plan.name_ar,
                        price: plan.price,
                        limit: plan.job_posts_limit
                      })}
                      className={`w-full h-12 rounded-xl text-sm font-bold ${
                        isPro
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : isBasic
                          ? "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                          : ""
                      }`}
                      variant={isPro || isBasic ? "default" : "outline"}
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      {plan.price === 0 ? "الباقة الحالية" : "طلب ترقية الباقة 🚀"}
                    </Button>
                  ) : (
                    <Link to={`/auth?mode=signup&plan=${plan.name}`}>
                      <Button
                        className={`w-full h-12 rounded-xl text-sm font-bold ${
                          isPro
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                            : isBasic
                            ? "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                            : ""
                        }`}
                        variant={isPro || isBasic ? "default" : "outline"}
                        style={{ fontFamily: "'Cairo', sans-serif" }}
                      >
                        {plan.price === 0 ? "ابدأ مجاناً" : "اشترك الآن"}
                      </Button>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
            تحتاج باقة مخصصة بحدود خاصة؟{" "}
            <a href="mailto:tawzeefx@outlook.com" className="text-primary font-semibold hover:underline">
              تواصل مع فريق إدارة Tawzeef-X
            </a>
          </p>
        </motion.div>
      </div>

      {selectedPlan && (
        <CheckoutModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planNameAr={selectedPlan.name_ar}
          price={selectedPlan.price}
          limit={selectedPlan.limit}
        />
      )}
    </div>
  );
}
