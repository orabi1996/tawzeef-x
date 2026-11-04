import DashboardLayout from "@/components/DashboardLayout";
import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import {
  Briefcase, Users, Calendar, BarChart3, Bot, Settings, Share2, FileText, Kanban, Target,
  PlayCircle, BookOpen, HelpCircle, ArrowRight,
  Zap, CheckCircle2, GitBranch, Keyboard, Layers, Search,
  LibraryBig, CheckSquare, Award, FileCheck2, Compass, FolderArchive,
  Sparkles, ArrowUpRight
} from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import PracticalExamples from "@/components/tutorial/PracticalExamples";
import KeyboardShortcuts from "@/components/tutorial/KeyboardShortcuts";
import FeatureVideos from "@/components/tutorial/FeatureVideos";
import AIGuide from "@/components/tutorial/AIGuide";

/* ───────── Complete System Modules Definition ───────── */
export interface SystemGuideModule {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  stepsAr: string[];
  stepsEn: string[];
  path: string;
  icon: any;
  category: "core" | "ai" | "performance" | "admin";
  badgeAr: string;
  badgeEn: string;
  color: string;
  bg: string;
  border: string;
}

const SYSTEM_MODULES: SystemGuideModule[] = [
  {
    id: "jobs",
    titleAr: "إدارة الوظائف ونشر الشواغر",
    titleEn: "Jobs & Publishing",
    descAr: "إنشاء وإدارة الوظائف التعليمية والإدارية والتقنية، وتحديد شروط المؤهلات ورخص هيئة تقويم التعليم (ETEC)، ونشرها بروابط عامة ورمز QR ومشاركتها على LinkedIn.",
    descEn: "Create and publish educational, administrative, and technical jobs with ETEC license criteria, public direct links, QR codes, and LinkedIn sharing.",
    stepsAr: [
      "انتقل إلى شاشة الوظائف واضغط على 'إضافة وظيفة جديدة'.",
      "أدخل المسمى الوظيفي، القسم، نطاق الراتب، والمؤهلات المطلوبة (أو استعن بالـ AI لتوليد الوصف تلقائياً).",
      "حدد اشتراطات الرخصة المهنية (ETEC) في حال كانت الوظيفة تعليمية أو مدرسية.",
      "اضغط حفظ، ثم استخدم زر 'المشاركة' لتوليد رابط التقديم المباشر أو رمز QR المطبوع."
    ],
    stepsEn: [
      "Navigate to Jobs screen and click 'Add New Job'.",
      "Enter title, department, salary range, and requirements (or use AI generation).",
      "Specify ETEC teacher license criteria if educational.",
      "Save and use 'Share' to get the direct application URL or QR code."
    ],
    path: "/jobs",
    icon: Briefcase,
    category: "core",
    badgeAr: "أساسي",
    badgeEn: "Core",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  {
    id: "candidates",
    titleAr: "إدارة المرشحين والفرز الذكي",
    titleEn: "Candidates & AI Screening",
    descAr: "مركز التحكم الشامل بالمرشحين، استعراض السير الذاتية وتحليلها بالـ AI، مطابقة المؤهلات والخبرات، وإضافة تقييمات وفلاتر بحث متقدمة.",
    descEn: "Central hub for all applicants, reviewing resumes with AI matching, competency scoring, and advanced filtering.",
    stepsAr: [
      "استعرض جميع المتقدمين مصنفين حسب الوظيفة أو الحالة أو التقييم.",
      "اضغط على أي مرشح لفتح ملفه واستعراض السيرة الذاتية ورقم الرخصة ومقاطع الدرس التجريبي.",
      "استخدم التقييم التلقائي بالذكاء الاصطناعي (AI Match Score) لمعرفة نسبة ملاءمته للوظيفة.",
      "أضف ملاحظات الفريق، أو انقل المرشح مباشرة للمرحلة التالية."
    ],
    stepsEn: [
      "Browse applicants filtered by job, stage, or score.",
      "Click any candidate to inspect profile, resume, ETEC license, and demo lesson.",
      "Leverage AI Match Score to gauge job fit instantly.",
      "Add team notes or transition candidate to the next stage."
    ],
    path: "/candidates",
    icon: Users,
    category: "core",
    badgeAr: "أساسي",
    badgeEn: "Core",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  {
    id: "pipeline",
    titleAr: "مسار التوظيف والكانبان التفاعلي",
    titleEn: "Recruitment Pipeline & Kanban",
    descAr: "لوحة كانبان تفاعلية متقدمة تتيح سحب وإفلات المرشحين عبر مراحل التوظيف (تقديم → مراجعة → مقابلة → درس تجريبي → عرض وظيفي → تم التعيين) مع تنبيهات حماية وقواعد أهلية.",
    descEn: "Interactive Kanban board for drag-and-drop applicant tracking across hiring stages with eligibility safeguards.",
    stepsAr: [
      "افتح شاشة 'مسار التوظيف' لاختيار الوظيفة المطلوبة ومتابعة أعمدة المراحل.",
      "اسحب بطاقة المرشح وأفلتها في العمود المناسب لنقله للمرحلة التالية.",
      "يتأكد النظام تلقائياً من استيفاء المتطلبات والشروط قبل السماح بالانتقال للمرحلة المتقدمة.",
      "يمكنك تخصيص المراحل وإضافة مراحل فرعية مخصصة للمنشأة."
    ],
    stepsEn: [
      "Open 'Pipeline' screen, pick the target job, and observe stage columns.",
      "Drag and drop candidate cards to advance them along the hiring stages.",
      "Built-in safeguards verify required assessments before stage transition.",
      "Customize pipeline stages tailored to your organization."
    ],
    path: "/pipeline",
    icon: Kanban,
    category: "core",
    badgeAr: "أساسي",
    badgeEn: "Core",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20"
  },
  {
    id: "interviews",
    titleAr: "جدولة المقابلات وغرف الفيديو المدمجة",
    titleEn: "Interviews & Virtual Rooms",
    descAr: "إدارة تقويم المقابلات، إرسال الدعوات الآلية عبر البريد والرسائل، وغرف مقابلات فيديو افتراضية مدمجة مع تسجيل وميزة تفريغ نصي تلقائي وتقييم الدرس التجريبي.",
    descEn: "Calendar scheduling, automated calendar invites, and built-in virtual video rooms with automated transcription and scoring.",
    stepsAr: [
      "اضغط 'جدولة مقابلة' من ملف المرشح أو من شاشة المقابلات.",
      "حدد موعد وتاريخ المقابلة، نوعها (حضوري أو غرفة فيديو افتراضية)، وأعضاء لجنة المقابلة.",
      "يستلم المرشح إشعاراً فورياً برابط الدخول المباشر للغرفة الافتراضية.",
      "أثناء المقابلة، يمكن تشغيل التسجيل وتدوين التقييمات اللحظية وحفظها بملف المرشح."
    ],
    stepsEn: [
      "Click 'Schedule Interview' from candidate profile or Interviews screen.",
      "Pick date, time, interview mode (In-person or Virtual Room), and interviewers.",
      "Candidate receives automated invitation with instant room link.",
      "Conduct interview with real-time scoring and transcript capture."
    ],
    path: "/interviews",
    icon: Calendar,
    category: "core",
    badgeAr: "أساسي",
    badgeEn: "Core",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20"
  },
  {
    id: "offers",
    titleAr: "العروض الوظيفية الرقمية والتوقيع الإلكتروني",
    titleEn: "Digital Offers & E-Signature",
    descAr: "إنشاء عروض عمل رسمية وموثقة بالريال السعودي، تشمل الراتب الأساسي والبدلات، مع مسار اعتماد داخلي وبوابة آمنة للمرشح للاطلاع والتوقيع الإلكتروني وتوليد PDF فوري.",
    descEn: "Issue official job offers in SAR with allowances, approval workflows, candidate portal with electronic signature, and PDF generation.",
    stepsAr: [
      "من شاشة العروض أو من ملف المرشح، اختر 'إنشاء عرض وظيفي'.",
      "حدد المسمى، الراتب الأساسي، بدل السكن، بدل النقل، التأمين، وتاريخ المباشرة المتوقع.",
      "أرسل العرض للمرشح عبر رسالة ورابط مؤمّن برقم تتبع مشفر.",
      "يقوم المرشح بمراجعة البنود واعتماد التوقيع إلكترونياً، ليتحول العرض فوراً إلى 'مقبول'."
    ],
    stepsEn: [
      "Select 'Create Offer' from Offers screen or candidate scorecard.",
      "Set job title, basic salary, housing, transport, insurance, and start date.",
      "Send encrypted offer link with tracking code to the candidate.",
      "Candidate reviews and signs electronically, generating an official PDF."
    ],
    path: "/offers",
    icon: FileText,
    category: "core",
    badgeAr: "أساسي",
    badgeEn: "Core",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20"
  },
  {
    id: "library",
    titleAr: "مكتبة النظام وقوالب العمل وتصميم Material 3",
    titleEn: "System Library & Templates",
    descAr: "المستودع المركزي لقوالب الوظائف المعتمدة (معلم لغة عربية، رياضيات، إنجليزي، علوم، مطور برمجيات، HR)، مسودات العقود والعروض، ونماذج المراسلات، مع مستعرض أيقونات Google Material Symbols.",
    descEn: "Central repository of pre-built job templates, employment contracts, message templates, and interactive Google Material Symbols showcase.",
    stepsAr: [
      "افتح 'مكتبة النظام' من القائمة الجانبية أو الرابط السريع.",
      "استعرض جناح 'قوالب الوظائف الجاهزة' واستخدم أي قالب لإنشاء شاغر جديد بنقرة واحدة.",
      "تصفح جناح 'نماذج العروض والمستندات' للاستفادة من العقود المتوافقة مع منصة قوى.",
      "استخدم جناح 'Google Material 3' للبحث عن أيقونات النظام ونسخ أسمائها وتطبيقها."
    ],
    stepsEn: [
      "Open 'System Library' from sidebar or top header bar.",
      "Browse ready-made job templates and instantiate jobs with a single click.",
      "Explore official contract and offer drafts compliant with labor regulations.",
      "Use Google Material 3 showcase to search and copy official symbols."
    ],
    path: "/library",
    icon: LibraryBig,
    category: "ai",
    badgeAr: "مكتبة شاملة",
    badgeEn: "Library",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20"
  },
  {
    id: "ai",
    titleAr: "مساعد الذكاء الاصطناعي والأتمتة",
    titleEn: "AI Assistant & Copilot",
    descAr: "شات بوت ذكي متخصص في التوظيف، يحلل السير الذاتية، يولد اختبارات وأسئلة مقابلات، يقارن بين المرشحين، ويجيب على الاستفسارات الفنية والقانونية المتعلقة بنظام العمل.",
    descEn: "Specialized recruitment copilot for resume analysis, interview question generation, candidate comparison, and HR advisory.",
    stepsAr: [
      "انتقل إلى 'مساعد AI' لبدء محادثة ذكية متخصصة.",
      "اطلب من المساعد اقتراح أسئلة مقابلة لوظيفة معينة أو تحليل الفروق بين أفضل 3 مرشحين.",
      "استخدم أزرار الأوامر السريعة المجهزة مسبقاً للحصول على صياغات فورية.",
      "يتم حفظ سجل المحادثات للرجوع إليها لاحقاً."
    ],
    stepsEn: [
      "Navigate to 'AI Assistant' for specialized recruitment intelligence.",
      "Prompt AI to generate interview questions or compare top 3 candidates.",
      "Use quick-prompt chips for instant HR drafting.",
      "Conversations are archived and searchable across sessions."
    ],
    path: "/ai-assistant",
    icon: Bot,
    category: "ai",
    badgeAr: "ذكاء اصطناعي",
    badgeEn: "AI",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20"
  },
  {
    id: "question-bank",
    titleAr: "بنك الأسئلة والاختبارات ومكافحة الغش",
    titleEn: "Question Bank & Assessments",
    descAr: "بناء بنوك أسئلة تخصصية، تصميم اختبارات الكفاءة والقدرات للمعلمين والموظفين، مع نظام مراقبة ذكي (Proctoring) لكشف تبديل النوافذ ومؤشر النزاهة (Integrity Score).",
    descEn: "Create question banks, conduct skill assessments with anti-cheat proctoring (tab-switch detection and integrity score calculation).",
    stepsAr: [
      "أنشئ بنك أسئلة مخصص للتخصص المطلوب (تربوي، رياضي، لغوي، تقني).",
      "أضف أسئلة متعددة الخيارات أو مقالية، أو استعن بالذكاء الاصطناعي لتوليدها.",
      "أرسل رابط الاختبار للمرشح، وسيقوم النظام بمراقبة الاختبار وكشف أي محاولات غش.",
      "تظهر درجات الاختبار ومؤشر النزاهة مباشرة في بطاقة المرشح ومسار التوظيف."
    ],
    stepsEn: [
      "Set up specialized question banks by domain and difficulty.",
      "Add MCQ or open questions, or auto-generate with AI.",
      "Dispatch assessment links with active anti-cheat proctoring.",
      "Results and integrity scores sync directly to applicant profile."
    ],
    path: "/question-bank",
    icon: HelpCircle,
    category: "ai",
    badgeAr: "اختبارات",
    badgeEn: "Assessments",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20"
  },
  {
    id: "resume-archive",
    titleAr: "أرشيف السير الذاتية وقاعدة المواهب",
    titleEn: "Resume Archive & Talent Pool",
    descAr: "أرشيف ذكي ومفهرس لآلاف السير الذاتية، يدعم البحث الدلالي بالمهارات وسنوات الخبرة والمدن، وإمكانية إعادة استقطاب المرشحين بنقرة واحدة للشواغر الجديدة.",
    descEn: "Semantic archive of resumes with deep talent pool search by skills, years of experience, and location for fast re-engagement.",
    stepsAr: [
      "انتقل إلى 'أرشيف السير الذاتية' أو 'قاعدة المواهب'.",
      "استخدم شريط البحث السريع للبحث عن مهارة محددة أو رخصة تعليمية.",
      "استعرض الملفات المصنفة وسيرهم الذاتية السابقة وتقييماتهم.",
      "اضغط 'ترشيح لوظيفة جديدة' لنقل المرشح مباشرة لمسار وظيفي حديث."
    ],
    stepsEn: [
      "Open 'Resume Archive' or 'Talent Pool'.",
      "Search semantically by skill, title, or ETEC license.",
      "Inspect candidate history, past evaluations, and resumes.",
      "Click 'Assign to Job' to immediately enroll candidate in a new pipeline."
    ],
    path: "/resume-archive",
    icon: FolderArchive,
    category: "ai",
    badgeAr: "أرشيف ذكي",
    badgeEn: "Talent Pool",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
  },
  {
    id: "tasks",
    titleAr: "لوحة إدارة المهام وفريق العمل",
    titleEn: "Task Board & Workflow",
    descAr: "تخطيط المهام داخل الشركة بمسؤول وناتج وموعد، ثم تنفيذ موثق ومراجعة اختيارية وإكمال.",
    descEn: "Manage HR & recruiting team tasks with assignment, due dates, priority labels, and status Kanban transitions.",
    stepsAr: [
      "افتح 'إدارة المهام' من شريط التنقل أو قائمة الأداء.",
      "أضف مهمة بعنوان وناتج مطلوب ومسؤول من حسابات الشركة وموعد تسليم ومراجع اختياري.",
      "افتح تفاصيل المهمة لبدء التنفيذ وتوثيق الأنشطة والناتج وحل العوائق قبل التسليم.",
      "المراجع المحدد يعتمد المهمة أو يعيدها بسبب. راجع المتأخرات والأرشيف وسجل التغييرات."
    ],
    stepsEn: [
      "Open 'Task Board' from navigation or workspace switcher.",
      "Plan a task with a real assignee, expected outcome, deadline and optional reviewer.",
      "Use task details to start work, complete activities, record results and clear blockers.",
      "The assigned reviewer approves or returns work with a reason. Review overdue tasks, archive and history."
    ],
    path: "/tasks",
    icon: CheckSquare,
    category: "performance",
    badgeAr: "مهام وأداء",
    badgeEn: "Tasks",
    color: "text-blue-600",
    bg: "bg-blue-600/10",
    border: "border-blue-600/20"
  },
  {
    id: "evaluation",
    titleAr: "دورات تقييم ٣٦٠ المستقلة",
    titleEn: "Independent 360 Review Cycles",
    descAr: "إجابات من حسابات المشاركين داخل الشركة، ومعايير وأوزان معلنة، ونتائج مجمّعة تحمي الفئات قليلة الردود.",
    descEn: "Responses from assigned company accounts, explicit criteria and weights, and aggregate results with small-group suppression.",
    stepsAr: [
      "مسؤول الشركة ينشئ مسودة ويحدد الموظف والفترة والموعد النهائي ومعايير السلوك وأوزانها.",
      "يضيف المشاركين من نفس الشركة ثم يفتح الدورة؛ بعدها تثبت المعايير والمشاركون.",
      "كل مشارك يدخل من حسابه ويسلّم إجابة واحدة من 1 إلى 5 أو لم ألاحظ لكل معيار.",
      "المسؤول يغلق الدورة؛ تظهر النتائج للموظف والمسؤولين فقط، وتُحجب الفئة السرية إذا قلّت عن ثلاثة ردود صالحة للمعيار."
    ],
    stepsEn: [
      "A company administrator creates a draft with subject, period, deadline, behavioral criteria and weights.",
      "Assign company members and open the cycle; criteria and participants are then frozen.",
      "Each assigned account submits once, rating each criterion from 1 to 5 or not observed.",
      "Close the cycle to release results to the subject and administrators; confidential groups need three valid responses per criterion."
    ],
    path: "/evaluation",
    icon: Target,
    category: "performance",
    badgeAr: "مهام وأداء",
    badgeEn: "Evaluation",
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    border: "border-amber-600/20"
  },
  {
    id: "reports",
    titleAr: "التقارير التحليلية المتقدمة ومؤشرات KPIs",
    titleEn: "Reports & Analytics",
    descAr: "لوحة تحليلات تفاعلية لمعدلات التوظيف، قمع المراحل (Funnel)، متوسط وقت التعيين (Time-to-hire)، تكلفة التوظيف، وتصدير التقارير بصيغة PDF و Excel.",
    descEn: "Interactive recruitment analytics: hiring velocity, pipeline funnels, source attribution, and exportable PDF/Excel reports.",
    stepsAr: [
      "افتح شاشة 'التقارير' لاستعراض لوحة المؤشرات البيانية.",
      "حدد النطاق الزمني والوظائف أو الفروع المراد تحليلها.",
      "تابع معدل تحويل المتقدمين من مرحلة لأخرى ونسب القبول والرفض.",
      "اضغط 'تصدير التقرير' لتحميل ملف PDF رسمي أو شيت Excel تفصيلي."
    ],
    stepsEn: [
      "Open 'Reports' for visual recruitment dashboards.",
      "Filter by time range, specific jobs, or company branches.",
      "Inspect funnel conversion rates and bottleneck stages.",
      "Export reports into polished PDF or Excel files."
    ],
    path: "/reports",
    icon: BarChart3,
    category: "admin",
    badgeAr: "إدارة وتقارير",
    badgeEn: "Analytics",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20"
  },
  {
    id: "hiring-plan",
    titleAr: "خطة التوظيف الاستراتيجية وتتبع الأهداف",
    titleEn: "Strategic Hiring Plan",
    descAr: "وضع الأهداف الشهرية والسنوية للتوظيف، متابعة الميزانيات المخصصة، ومراقبة التقدم الفعلي مقابل المخطط له للمنشأة وفروعها.",
    descEn: "Establish monthly and quarterly hiring goals, allocate budgets, and track actual headcount vs planned targets.",
    stepsAr: [
      "انتقل إلى 'خطة التوظيف' لتحديد عدد الشواغر المستهدفة لكل قسم.",
      "حدد الميزانية التقديرية وتاريخ الإغلاق المطلوب.",
      "تابع مؤشر الإنجاز والنسبة المئوية لتحقيق أهداف الاستقطاب.",
      "استفد من التوصيات الذكية لتسريع سد الشواغر الحرجة."
    ],
    stepsEn: [
      "Open 'Hiring Plan' to set target quotas per department.",
      "Specify budget allocations and required closing dates.",
      "Track target progress bars and variance metrics.",
      "Act on AI recommendations for bottleneck positions."
    ],
    path: "/hiring-plan",
    icon: Award,
    category: "admin",
    badgeAr: "إدارة وتقارير",
    badgeEn: "Planning",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20"
  },
  {
    id: "converted-orders",
    titleAr: "الطلبات المحولة ومكاتب التوظيف والوساطة",
    titleEn: "Converted Orders & Agencies",
    descAr: "إدارة ومتابعة طلبات التوظيف المحولة من مكاتب العمل والوساطة الخارجية، مع بوابة خاصة للمكاتب لمشاركة المرشحين وتتبع الاعتمادات والعمولات.",
    descEn: "Track external agency submissions, manage staffing agency portals, and supervise converted hiring requisitions.",
    stepsAr: [
      "استعرض 'الطلبات المحولة' لمتابعة الطلبات القادمة من المكاتب المعتمدة.",
      "أدِر مكاتب التوظيف والوكالات الشريكة عبر 'إدارة مكاتب التوظيف'.",
      "يمكن للمكتب الشريك رفع المرشحين ومتابعة تقدمهم في مسار التوظيف.",
      "توثيق العمولات وحالة مباشرة الموظف المحول."
    ],
    stepsEn: [
      "Browse 'Converted Orders' to supervise agency referrals.",
      "Manage agency partners via Company Agencies portal.",
      "Partners can submit resumes and follow application stages.",
      "Track placement commissions and onboarding milestones."
    ],
    path: "/converted-orders",
    icon: FileCheck2,
    category: "admin",
    badgeAr: "إدارة وتقارير",
    badgeEn: "Agencies",
    color: "text-indigo-600",
    bg: "bg-indigo-600/10",
    border: "border-indigo-600/20"
  },
  {
    id: "direct-apply",
    titleAr: "بوابة التقديم المباشر والتحليل الذكي للسيرة والرخصة",
    titleEn: "Direct Apply & AI Parsing",
    descAr: "صفحة تقديم عامة وسريعة للمرشحين والمعلمين، تدعم السحب والإفلات وقراءة نصوص PDF و Word بالذكاء الاصطناعي، واستخراج بيانات رخصة المعلم (ETEC) وحساب التقييم فوراً.",
    descEn: "Public job application portal featuring instant PDF/Word resume text extraction, ETEC teacher verification, and automatic candidate scoring.",
    stepsAr: [
      "ينقر المرشح على رابط التقديم المباشر الخاص بالوظيفة (`/apply/:jobId`).",
      "يسحب المرشح ملف السيرة الذاتية أو يرفقه، ليقوم الذكاء الاصطناعي بقراءته فوراً واستخراج الجوال والبريد وسنوات الخبرة والمهارات.",
      "يتم توثيق رقم الرخصة المهنية للمعلمين (ETEC) ورابط الدرس التجريبي.",
      "عند الإرسال، يحصل المرشح على كود تتبع رسمي وحساب بوابة خاص به لمتابعة حالة طلبه."
    ],
    stepsEn: [
      "Applicant clicks the job direct URL (`/apply/:jobId`).",
      "Uploads resume via Drag & Drop, where AI extracts phone, email, experience, and skills in real time.",
      "Documents ETEC license and demo lesson video URL.",
      "On submission, applicant receives a tracking code and portal account."
    ],
    path: "/jobs",
    icon: Sparkles,
    category: "core",
    badgeAr: "بوابة التقديم",
    badgeEn: "Portal",
    color: "text-emerald-600",
    bg: "bg-emerald-600/10",
    border: "border-emerald-600/20"
  },
  {
    id: "settings-security",
    titleAr: "مصفوفة الصلاحيات، سجل الأمان، والإعدادات",
    titleEn: "Permissions, Audit Log & Settings",
    descAr: "إدارة إعدادات المنشأة، تخصيص خادم البريد SMTP، ضبط التنبيهات، مصفوفة الصلاحيات الدقيقة لكل دور (مدير، موظف، مراجع)، وسجل الأمان والتدقيق الشامل.",
    descEn: "Company branding, custom SMTP settings, notification triggers, granular role-permission matrix, and comprehensive security audit logs.",
    stepsAr: [
      "افتح 'الإعدادات' لضبط هوية المنشأة وخادم البريد SMTP الخاص بك.",
      "استخدم مصفوفة الصلاحيات (Role Permissions Matrix) لتحديد الشاشات والإجراءات لكل دور وظيفي.",
      "تابع 'سجل الأمان' (Audit Log) لرصد جميع العمليات والتسجيلات والتغييرات الحساسة مع عناوين IP.",
      "أدِر أعضاء الفريق وأرسل دعوات الانضمام بكلمات مرور مؤقتة."
    ],
    stepsEn: [
      "Open 'Settings' to customize branding and dedicated SMTP servers.",
      "Adjust role permissions matrix for Admin, Recruiter, and Reviewer roles.",
      "Monitor Audit Log for full accountability, user sessions, and IP logging.",
      "Invite team members with role-tailored access."
    ],
    path: "/settings",
    icon: Settings,
    category: "admin",
    badgeAr: "أمان وإعدادات",
    badgeEn: "Security",
    color: "text-slate-600",
    bg: "bg-slate-600/10",
    border: "border-slate-600/20"
  },
];

const quickStartSteps = [
  { icon: Briefcase, titleKey: "tutorial.qs.step1.title", descKey: "tutorial.qs.step1.desc" },
  { icon: Share2, titleKey: "tutorial.qs.step2.title", descKey: "tutorial.qs.step2.desc" },
  { icon: Users, titleKey: "tutorial.qs.step3.title", descKey: "tutorial.qs.step3.desc" },
  { icon: Calendar, titleKey: "tutorial.qs.step4.title", descKey: "tutorial.qs.step4.desc" },
  { icon: FileText, titleKey: "tutorial.qs.step5.title", descKey: "tutorial.qs.step5.desc" },
  { icon: CheckCircle2, titleKey: "tutorial.qs.step6.title", descKey: "tutorial.qs.step6.desc" },
];

const faqKeys = [
  "tutorial.faq.q1", "tutorial.faq.q2", "tutorial.faq.q3", "tutorial.faq.q4",
  "tutorial.faq.q5", "tutorial.faq.q6", "tutorial.faq.q7", "tutorial.faq.q8",
];

export default function Tutorial() {
  const { t, locale, dir } = useI18n();
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const welcomeAudioUrl = "/videos/tawzeef-x-tutorial-main-audio.mp3";
  const [welcomeAudio, setWelcomeAudio] = useState<HTMLAudioElement | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const video = welcomeVideoRef.current;
    if (!video || !welcomeAudioUrl) return;

    const audio = welcomeAudio || new Audio(welcomeAudioUrl);
    if (!welcomeAudio) {
      setWelcomeAudio(audio);
    }
    video.muted = true;

    const handlePlay = () => {
      audio.currentTime = video.currentTime;
      audio.play().catch(console.warn);
    };

    const handlePause = () => {
      audio.pause();
    };

    const handleSeeking = () => {
      audio.currentTime = video.currentTime;
    };

    const handleVolume = () => {
      audio.volume = video.volume;
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("volumechange", handleVolume);

    audio.volume = video.volume;
    audio.currentTime = video.currentTime;
    if (!video.paused) {
      audio.play().catch(console.warn);
    }

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("volumechange", handleVolume);
      audio.pause();
    };
  }, [welcomeAudioUrl, welcomeAudio]);

  const filteredModules = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SYSTEM_MODULES.filter((mod) => {
      const matchCat = selectedCategory === "all" || mod.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        mod.titleAr.toLowerCase().includes(q) ||
        mod.titleEn.toLowerCase().includes(q) ||
        mod.descAr.toLowerCase().includes(q) ||
        mod.descEn.toLowerCase().includes(q) ||
        mod.stepsAr.some((s) => s.toLowerCase().includes(q)) ||
        mod.stepsEn.some((s) => s.toLowerCase().includes(q)) ||
        mod.path.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 select-none" dir={dir}>

        {/* Hero Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-card to-emerald-500/10 border border-primary/20 p-6 md:p-10 shadow-sm"
        >
          <div className="absolute top-0 end-0 w-80 h-80 bg-primary/10 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-[90px] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 z-10">
            <div className="flex-1 text-center md:text-start space-y-4">
              <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-3 py-1 font-bold gap-1.5 shadow-2xs">
                  <BookOpen className="w-3.5 h-3.5" />
                  {locale === "en" ? "Official System Guide" : "دليل النظام بالكامل الشامل 📚"}
                </Badge>
                <Badge variant="outline" className="text-xs bg-card/60">
                  {locale === "en" ? "16 Comprehensive Modules" : "١٦ قسماً ووظيفة متكاملة"}
                </Badge>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
                {locale === "en" ? "Complete Tawzeef-X System Guide" : "دليل نظام توظيف X بالكامل"}
              </h1>

              <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
                {locale === "en"
                  ? "Everything you need to master Tawzeef-X: step-by-step documentation, interactive system map, direct screen access, and practical examples for educational & enterprise recruitment."
                  : "مرجعك الشامل لاحتراف جميع أقسام منصة توظيف X: شروحات تفصيلية خطوة بخطوة، خريطة النظام التفاعلية، روابط الوصول المباشر، وأمثلة عملية لاستقطاب المعلمين وإدارة التوظيف."}
              </p>

              {/* Action Buttons in Hero */}
              <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap pt-2">
                <Button
                  onClick={() => {
                    localStorage.removeItem("tawzeef-x-tour-completed");
                    window.location.reload();
                  }}
                  className="gap-2 rounded-xl text-xs font-bold h-10 px-5 shadow-sm"
                >
                  <Zap className="w-4 h-4" />
                  {locale === "en" ? "Start Interactive Tour" : "بدء الجولة التفاعلية الحية"}
                </Button>

                <Link to="/library">
                  <Button variant="outline" className="gap-2 rounded-xl text-xs font-bold h-10 px-5 bg-card/60">
                    <LibraryBig className="w-4 h-4 text-primary" />
                    {locale === "en" ? "Explore System Library" : "مكتبة النظام والقوالب"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Welcome Video Widget */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full md:w-[380px] shrink-0"
            >
              <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-primary/20 bg-black">
                <video
                  ref={welcomeVideoRef}
                  src="/videos/tawzeef-x-tutorial-main.mp4"
                  controls
                  loop
                  playsInline
                  className="w-full aspect-video bg-black"
                  preload="metadata"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2 flex items-center gap-1.5 justify-center font-medium">
                <PlayCircle className="w-3.5 h-3.5 text-primary" />
                {locale === "en" ? "Watch Video Tour (2 min)" : "شاهد الفيديو التعريفي السريع (دقيقتان)"}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Global Search & Filter Bar for Guide */}
        <div className="bg-card/70 backdrop-blur-md rounded-2xl border border-border/70 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "en" ? "Search any feature, screen, or keyword..." : "ابحث في دليل النظام (مثال: رخصة، كانبان، عروض، مهام، تقييم)..."}
              className="pr-9 h-10 text-xs rounded-xl bg-background"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-muted/40 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === "all" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "en" ? "All Modules" : "جميع الأقسام"}
            </button>
            <button
              onClick={() => setSelectedCategory("core")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === "core" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "en" ? "Core Recruitment" : "التوظيف الأساسي"}
            </button>
            <button
              onClick={() => setSelectedCategory("ai")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === "ai" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "en" ? "AI & Library" : "الذكاء والمكتبة"}
            </button>
            <button
              onClick={() => setSelectedCategory("performance")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === "performance" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "en" ? "Tasks & Performance" : "المهام والأداء"}
            </button>
            <button
              onClick={() => setSelectedCategory("admin")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === "admin" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "en" ? "Management & Security" : "الإدارة والأمان"}
            </button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="modules" className="w-full space-y-6">
          <div className="flex justify-center">
            <TabsList className="flex-wrap h-auto gap-1.5 p-1.5 bg-muted/70 backdrop-blur-md rounded-2xl border border-border/50">
              <TabsTrigger value="modules" className="gap-2 rounded-xl text-xs font-bold py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-2xs">
                <Compass className="w-4 h-4" />
                {locale === "en" ? "System Map & Modules (16)" : "خريطة وأقسام النظام (١٦)"}
              </TabsTrigger>
              <TabsTrigger value="quickstart" className="gap-2 rounded-xl text-xs font-bold py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-2xs">
                <Zap className="w-4 h-4" />
                {t("tutorial.tab.quickstart")}
              </TabsTrigger>
              <TabsTrigger value="workflow" className="gap-2 rounded-xl text-xs font-bold py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-2xs">
                <GitBranch className="w-4 h-4" />
                {t("tutorial.tab.workflow")}
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2 rounded-xl text-xs font-bold py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-2xs">
                <Bot className="w-4 h-4" />
                {t("tutorial.tab.ai")}
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2 rounded-xl text-xs font-bold py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-2xs">
                <PlayCircle className="w-4 h-4" />
                {locale === "en" ? "Video Guides" : "الفيديوهات التعليمية"}
              </TabsTrigger>
              <TabsTrigger value="examples" className="gap-2 rounded-xl text-xs font-bold py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-2xs">
                <Layers className="w-4 h-4" />
                {t("tutorial.tab.examples")}
              </TabsTrigger>
              <TabsTrigger value="shortcuts" className="gap-2 rounded-xl text-xs font-bold py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-2xs">
                <Keyboard className="w-4 h-4" />
                {t("tutorial.tab.shortcuts")}
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-2 rounded-xl text-xs font-bold py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-2xs">
                <HelpCircle className="w-4 h-4" />
                {t("tutorial.tab.faq")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ═════════ TAB 1: Complete System Modules (The Core Guide) ═════════ */}
          <TabsContent value="modules" className="space-y-6 focus-visible:outline-none">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                {locale === "en"
                  ? `Showing ${filteredModules.length} of ${SYSTEM_MODULES.length} system modules`
                  : `يتم عرض ${filteredModules.length} من أصل ${SYSTEM_MODULES.length} قسماً في دليل النظام`}
              </span>
              {searchQuery && (
                <span className="font-bold text-primary">
                  {locale === "en" ? `Filtered by "${searchQuery}"` : `نتائج البحث عن: "${searchQuery}"`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredModules.map((mod, index) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className={`h-full rounded-3xl border ${mod.border} bg-card/80 backdrop-blur-md shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group`}>
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-2xl ${mod.bg} ${mod.color} shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}>
                            <mod.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {locale === "en" ? mod.badgeEn : mod.badgeAr}
                              </Badge>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {mod.path}
                              </span>
                            </div>
                            <CardTitle className="text-base font-black text-foreground">
                              {locale === "en" ? mod.titleEn : mod.titleAr}
                            </CardTitle>
                          </div>
                        </div>

                        <Link to={mod.path}>
                          <Button size="sm" variant="ghost" className="h-8 text-xs font-bold gap-1 rounded-xl text-primary hover:bg-primary/10">
                            <span>{locale === "en" ? "Open" : "فتح"}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>

                      <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                        {locale === "en" ? mod.descEn : mod.descAr}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 space-y-2">
                        <p className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          <span>{locale === "en" ? "How to use step-by-step:" : "خطوات الاستخدام النموذجية:"}</span>
                        </p>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          {(locale === "en" ? mod.stepsEn : mod.stepsAr).map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
                                {sIdx + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>

                    <div className="px-6 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {locale === "en" ? "Full integration & RLS protected" : "متكامل 100% مع الصلاحيات وقاعدة البيانات"}
                      </span>
                      <Link to={mod.path}>
                        <Button size="sm" className="h-8 text-xs font-bold rounded-xl gap-1 bg-primary text-primary-foreground shadow-2xs">
                          <span>{locale === "en" ? "Go to Module" : "انتقل إلى الشاشة"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ═════════ TAB 2: Quick Start ═════════ */}
          <TabsContent value="quickstart" className="space-y-6 focus-visible:outline-none">
            <Card className="rounded-3xl border border-border/70 bg-card/80 p-6 md:p-8 space-y-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span>{t("tutorial.qs.title")}</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  {t("tutorial.qs.subtitle")}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <div className="space-y-4">
                  {quickStartSteps.map((step, i) => (
                    <motion.div
                      key={step.titleKey}
                      initial={{ opacity: 0, x: locale === "ar" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-4 relative"
                    >
                      {i < quickStartSteps.length - 1 && (
                        <div className="absolute start-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent" />
                      )}
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 z-10 shadow-xs border border-primary/20">
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="pb-6 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-[10px] bg-primary/15 text-primary border-0 font-bold">
                            {locale === "en" ? `Step ${i + 1}` : `الخطوة ${i + 1}`}
                          </Badge>
                          <p className="text-sm font-bold text-foreground">{t(step.titleKey)}</p>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═════════ TAB 3: Typical Workflow ═════════ */}
          <TabsContent value="workflow" className="space-y-6 focus-visible:outline-none">
            <Card className="rounded-3xl border border-border/70 bg-card/80 p-6 md:p-8 space-y-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <span>{t("tutorial.workflow.title")}</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  {t("tutorial.workflow.subtitle")}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <div className="relative">
                  {[1, 2, 3, 4, 5, 6, 7].map((n, i) => {
                    const icons = [Briefcase, Users, Bot, Kanban, Calendar, FileText, CheckCircle2];
                    const colors = [
                      "bg-blue-500/10 text-blue-500 border-blue-500/20",
                      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
                      "bg-violet-500/10 text-violet-500 border-violet-500/20",
                      "bg-amber-500/10 text-amber-500 border-amber-500/20",
                      "bg-rose-500/10 text-rose-500 border-rose-500/20",
                      "bg-green-500/10 text-green-500 border-green-500/20",
                    ];
                    const Icon = icons[i];
                    return (
                      <motion.div
                        key={n}
                        initial={{ opacity: 0, x: locale === "ar" ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-4 relative"
                      >
                        {i < 6 && (
                          <div className="absolute start-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 to-transparent" />
                        )}
                        <div className={`w-12 h-12 rounded-2xl border ${colors[i]} flex items-center justify-center shrink-0 z-10 shadow-xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="pb-8 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="text-[10px] bg-primary/10 text-primary border-0 font-bold">{i + 1}</Badge>
                            <p className="text-sm font-bold text-foreground">{t(`tutorial.workflow.step${n}.title`)}</p>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(`tutorial.workflow.step${n}.desc`)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═════════ TAB 4: AI Guide ═════════ */}
          <TabsContent value="ai" className="focus-visible:outline-none">
            <AIGuide />
          </TabsContent>

          {/* ═════════ TAB 5: Feature Videos ═════════ */}
          <TabsContent value="videos" className="focus-visible:outline-none">
            <FeatureVideos />
          </TabsContent>

          {/* ═════════ TAB 6: Practical Examples ═════════ */}
          <TabsContent value="examples" className="focus-visible:outline-none">
            <PracticalExamples />
          </TabsContent>

          {/* ═════════ TAB 7: Keyboard Shortcuts ═════════ */}
          <TabsContent value="shortcuts" className="focus-visible:outline-none">
            <KeyboardShortcuts />
          </TabsContent>

          {/* ═════════ TAB 8: FAQ ═════════ */}
          <TabsContent value="faq" className="space-y-4 focus-visible:outline-none">
            <Card className="rounded-3xl border border-border/70 bg-card/80 p-6 md:p-8 space-y-4">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                {t("tutorial.faq.title")}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {faqKeys.map((key) => (
                  <AccordionItem key={key} value={key} className="border border-border/60 rounded-2xl px-4 bg-background/50">
                    <AccordionTrigger className="hover:no-underline text-sm font-bold py-3.5">
                      {t(`${key}.q`)}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
                      {t(`${key}.a`)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </DashboardLayout>
  );
}
