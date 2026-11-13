import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock3, ExternalLink, Mail, ShieldCheck } from "lucide-react";
import tawzeefLogo from "@/assets/tawzeef-x-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/marketing/SEO";

const PORTAL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/candidate-portal`;
const STAGES = [
  "تقديم الطلب",
  "فحص السيرة",
  "اختبار تحريري",
  "مقابلة تقنية",
  "مقابلة نهائية",
  "العرض الوظيفي",
];

interface CandidateResult {
  id: string;
  name: string;
  role: string | null;
  stage: string;
  status: string;
  skills: string[] | null;
  trackingCode: string | null;
  appliedAt: string;
  jobTitle: string | null;
  aiScore: number | null;
}

async function portalRequest(payload: Record<string, string>) {
  const response = await fetch(PORTAL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "تعذر الاتصال ببوابة المرشحين. حاول مرة أخرى.");
  }
  return data;
}

export default function CandidatePortal() {
  const [params, setParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState<CandidateResult[] | null>(null);
  const accessToken = params.get("access");

  useEffect(() => {
    // Tracking codes are identifiers, not credentials. Never display private
    // candidate data based on a code or an email alone.
    const code = params.get("code") || params.get("tracking");
    if (code) setTrackingCode(code);
  }, [params]);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    portalRequest({ action: "read", token: accessToken })
      .then((data) => {
        if (!cancelled) setCandidates(Array.isArray(data.candidates) ? data.candidates : []);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "تعذر التحقق من الرابط.");
      })
      .finally(() => {
        // Clear the bearer link from the address bar after the initial request.
        // This limits accidental sharing, history persistence, and referrer exposure.
        if (!cancelled) {
          setParams((previous) => {
            const next = new URLSearchParams(previous);
            next.delete("access");
            next.delete("code");
            next.delete("tracking");
            return next;
          }, { replace: true });
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [accessToken, setParams]);

  const requestEmail = async () => {
    setError("");
    setMessage("");
    setCandidates(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }
    setLoading(true);
    try {
      const data = await portalRequest({
        action: "request",
        email: email.trim().toLowerCase(),
        trackingCode: trackingCode.trim(),
      });
      setMessage(data.message || "إذا كانت لديك طلبات مسجلة، سيصلك رابط تحقق عبر البريد الإلكتروني.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر إرسال رابط التحقق.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SEO
        title="بوابة متابعة الطلبات | Tawzeef-X"
        description="تابع حالة طلب التوظيف بأمان بعد تأكيد ملكية بريدك الإلكتروني."
        noindex
      />
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <img src={tawzeefLogo} alt="Tawzeef-X" className="h-9 w-9 object-contain" />
            <span>توظيف X</span>
          </Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            دخول الشركات
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 space-y-7">
        <div className="text-center space-y-3">
          <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">متابعة طلب التوظيف بأمان</h1>
          <p className="text-sm text-muted-foreground leading-7">
            خصوصيتك مهمة. أرسل رابط تحقق إلى بريدك المسجل لعرض حالة طلباتك الوظيفية.
          </p>
        </div>

        <section className="bg-card border rounded-2xl p-5 sm:p-7 space-y-5">
          <div className="space-y-2">
            <label htmlFor="portal-email" className="text-sm font-semibold">
              البريد الإلكتروني المسجل في طلب التوظيف
            </label>
            <Input
              id="portal-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              dir="ltr"
              maxLength={254}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="portal-tracking" className="text-sm font-semibold">
              رمز التتبع (اختياري)
            </label>
            <Input
              id="portal-tracking"
              value={trackingCode}
              onChange={(event) => setTrackingCode(event.target.value)}
              placeholder="TX-12345"
              dir="ltr"
              maxLength={128}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              لو مش معاك رمز التتبع، سيُعرض لك كل طلب مرتبط ببريدك بعد التحقق.
            </p>
          </div>
          <Button className="w-full gap-2" onClick={requestEmail} disabled={loading}>
            <Mail className="h-4 w-4" />
            {loading ? "جارٍ التحقق..." : "إرسال رابط متابعة آمن"}
          </Button>
          {message && (
            <p role="status" className="rounded-xl border p-4 text-sm leading-7 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            الرابط صالح لمدة 15 دقيقة، ولا يكفي رمز التتبع وحده للاطلاع على بيانات المرشح.
          </p>
        </section>

        {candidates && (
          <section className="space-y-4" aria-live="polite">
            <h2 className="font-bold text-lg">طلبات التوظيف الخاصة بك</h2>
            {candidates.length === 0 && (
              <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
                لا توجد طلبات مطابقة للرابط الذي تم التحقق منه.
              </p>
            )}
            {candidates.map((candidate) => {
              const stageIndex = STAGES.findIndex((stage) =>
                stage === candidate.stage || candidate.stage?.includes(stage),
              );
              return (
                <article key={candidate.id} className="border rounded-2xl bg-card p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-bold">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {candidate.jobTitle || candidate.role || "طلب توظيف"}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                      {candidate.status}
                    </span>
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />
                    المرحلة الحالية: <strong>{candidate.stage}</strong>
                  </div>
                  <ol className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STAGES.map((stage, index) => (
                      <li
                        key={stage}
                        className={
                          "rounded-lg p-2 text-center text-xs border " +
                          (index === stageIndex
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : index < stageIndex
                              ? "border-primary/20 text-foreground"
                              : "border-border text-muted-foreground")
                        }
                      >
                        {stage}
                      </li>
                    ))}
                  </ol>
                  {candidate.trackingCode && (
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {candidate.trackingCode}
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        )}

        <footer className="text-center text-xs text-muted-foreground flex justify-center items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          لا تشارك رابط التحقق الخاص بك مع الآخرين.
        </footer>
      </main>
    </div>
  );
}
