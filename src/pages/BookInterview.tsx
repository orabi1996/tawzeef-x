import tawzeefLogo from "@/assets/tawzeef-x-logo.png";
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, Video, MapPin, CheckCircle, User, ChevronLeft  } from "lucide-react";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";


const BOOKING_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/book-interview`;

interface TimeSlot {
  date: string;
  time: string;
  display: string;
  dayName: string;
}

function generateSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
  const times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];

  for (let d = 1; d <= 10; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dayOfWeek = date.getDay();
    // Skip Friday(5) and Saturday(6)
    if (dayOfWeek === 5 || dayOfWeek === 6) continue;

    const dateStr = date.toISOString().split("T")[0];
    const dayName = dayNames[dayOfWeek] || "";
    const displayDate = date.toLocaleDateString("ar-SA", { day: "numeric", month: "long" });

    times.forEach(time => {
      slots.push({ date: dateStr, time, display: displayDate, dayName });
    });
  }
  return slots;
}

export default function BookInterview() {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const slots = useMemo(() => generateSlots(), []);

  // Group slots by date
  const groupedSlots = useMemo(() => {
    const map: Record<string, TimeSlot[]> = {};
    slots.forEach(s => {
      const key = s.date;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return Object.entries(map);
  }, [slots]);

  useEffect(() => {
    if (!candidateId) { setLoading(false); return; }
    // Use edge function to look up candidate publicly
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/candidate-portal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ trackingCode: candidateId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.candidates?.length > 0) {
          const c = data.candidates[0];
          setCandidate(c);
          setForm(prev => ({ ...prev, name: c.name || "" }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [candidateId]);

  const handleBook = async () => {
    if (!selectedSlot) {
      toast({ title: "يرجى اختيار موعد", variant: "destructive" });
      return;
    }
    if (!form.name) {
      toast({ title: "يرجى إدخال الاسم", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch(BOOKING_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          trackingCode: candidateId,
          date: selectedSlot.date,
          time: selectedSlot.time,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "فشل الحجز");
      }

      setBooked(true);
      toast({ title: "تم حجز المقابلة بنجاح ✅" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (booked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">تم حجز موعد المقابلة!</h2>
            <p className="text-sm text-muted-foreground">
              {selectedSlot && `${selectedSlot.dayName} ${selectedSlot.display} الساعة ${selectedSlot.time}`}
            </p>
            {selectedSlot && (
              <div className="flex justify-center">
                <AddToCalendarButton
                  title={`مقابلة عمل - ${form.name}`}
                  description="مقابلة عمل عبر منصة Tawzeef-X"
                  date={selectedSlot.date}
                  time={selectedSlot.time}
                  size="default"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">سيتم التواصل معك لتأكيد التفاصيل</p>
            <Link to="/portal"><Button variant="outline" className="mt-4">تتبع طلبك</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={tawzeefLogo} alt="Tawzeef-X" className="w-8 h-8 object-contain" />
          </Link>
          <Link to="/portal" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            تتبع طلبك
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">حجز موعد المقابلة</h1>
          <p className="text-muted-foreground text-sm">اختر الموعد المناسب لك من المواعيد المتاحة</p>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle className="text-base">معلوماتك</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Label>الاسم *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكامل" />
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div>
                  <Label>الجوال</Label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="05xxxxxxxx" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Time Slots */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle className="text-base">اختر الموعد</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {groupedSlots.map(([date, daySlots], gi) => (
                <div key={date}>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    {daySlots[0].dayName} — {daySlots[0].display}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((slot, i) => (
                      <button
                        key={`${slot.date}-${slot.time}`}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card border-border/50 text-foreground hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        <Clock className="w-3 h-3 inline ml-1" />
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Book Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Button
            onClick={handleBook}
            disabled={submitting || !selectedSlot}
            className="w-full py-6 text-base bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {submitting ? "جاري الحجز..." : "تأكيد حجز المقابلة"}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
