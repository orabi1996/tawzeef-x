import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban,
  Calendar,
  FileText,
  FileCheck2,
  CheckSquare,
  Target,
  Bot,
  LibraryBig,
  Star,
  Archive,
  BookOpen,
  GitBranch,
  ClipboardList,
  BarChart3,
  Award,
  Bell,
  Building2,
  Handshake,
  UserCog,
  Shield,
  Settings,
  HelpCircle,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export interface StepActionTrigger {
  labelAr: string;
  labelEn: string;
  actionType: "navigate" | "open_modal" | "custom_event";
  target: string;
}

export interface GuideStep {
  stepNumber: number;
  titleAr: string;
  titleEn: string;
  actionAr: string;
  actionEn: string;
  expectedOutcomeAr: string;
  expectedOutcomeEn: string;
  tipsAr?: string;
  tipsEn?: string;
  actionTrigger?: StepActionTrigger;
}

export interface WorkflowStage {
  stepNumber: number;
  labelAr: string;
  labelEn: string;
}

export interface ScreenButtonGuide {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  actionType?: "primary" | "secondary" | "action";
}

export interface ScreenProTip {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface ScreenFaq {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

export interface ScreenGuideItem {
  id: string;
  matchPaths: string[];
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  badgeEn: string;
  category: "core" | "ai" | "performance" | "admin";
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  summaryAr: string;
  summaryEn: string;
  targetAudienceAr: string;
  targetAudienceEn: string;
  workflowStages?: WorkflowStage[];
  steps: GuideStep[];
  keyButtons: ScreenButtonGuide[];
  proTips: ScreenProTip[];
  faqs: ScreenFaq[];
  quickLinks: { labelAr: string; labelEn: string; path: string }[];
}

export const SCREEN_GUIDES: ScreenGuideItem[] = [
  {
    id: "dashboard",
    matchPaths: ["/dashboard"],
    titleAr: "لوحة التحكم المركزية",
    titleEn: "Central Dashboard",
    badgeAr: "نظرة عامة",
    badgeEn: "Overview",
    category: "core",
    icon: LayoutDashboard,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    summaryAr: "مركز المراقبة اللحظي لجميع عمليات التوظيف ومؤشرات الأداء السريعة في منشأتك.",
    summaryEn: "Real-time monitoring hub for all hiring activities, stats, and critical indicators.",
    targetAudienceAr: "مدراء التوظيف، مسؤولو الموارد البشرية، الإدارة العليا",
    targetAudienceEn: "Hiring Managers, HR Specialists, Executives",
    workflowStages: [
      { stepNumber: 1, labelAr: "متابعة المؤشرات", labelEn: "Monitor KPIs" },
      { stepNumber: 2, labelAr: "مراجعة المهام", labelEn: "Urgent Tasks" },
      { stepNumber: 3, labelAr: "فحص المتقدمين", labelEn: "New Applicants" },
      { stepNumber: 4, labelAr: "اتخاذ إجراء سريع", labelEn: "Quick Action" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "إلقاء نظرة على البطاقات الإحصائية العلوية",
        titleEn: "Inspect Top KPI Metrics Cards",
        actionAr: "راقب عدد الوظائف النشطة، إجمالي المتقدمين، المقابلات المجدولة اليوم، والعروض الوظيفية المعلقة.",
        actionEn: "Check active job openings, total applicants, today's interviews, and pending offers.",
        expectedOutcomeAr: "معرفة سريعة بحجم العمل المطلوب اليوم دون الحاجة للبحث في القوائم.",
        expectedOutcomeEn: "Instant snapshot of current hiring workload and pending actions.",
              actionTrigger: {
          labelAr: "إنشاء شاغر جديد الآن ⚡",
          labelEn: "Create New Job Now ⚡",
          actionType: "navigate",
          target: "/jobs?action=new",
        },
      },
      {
        stepNumber: 2,
        titleAr: "مراجعة المهام العاجلة ومواعيد المقابلات",
        titleEn: "Review Urgent Tasks and Today's Schedule",
        actionAr: "انظر إلى قائمة مقابلات اليوم في الجانب الأيمن واضغط على رابط المقابلة لدخول غرفة الفيديو أو مراجعة بيانات المرشح.",
        actionEn: "Inspect upcoming interviews and click to launch video room or review candidate.",
        expectedOutcomeAr: "الاستعداد المسبق للمقابلات وعدم تفويت أي موعد مجدول.",
        expectedOutcomeEn: "Prompt readiness for all meetings without missing schedules."
      },
      {
        stepNumber: 3,
        titleAr: "متابعة أحدث المتقدمين والمرشحين المميزين",
        titleEn: "Track Recent Applications & Top AI Matches",
        actionAr: "استعرض جدول أحدث المتقدمين بالذكاء الاصطناعي مع نسبة المطابقة (AI Match %)، واضغط على أي مرشح لفتح ملفه فوراً.",
        actionEn: "Review latest applications with AI match scores and click any applicant for quick review.",
        expectedOutcomeAr: "سرعة اتخاذ القرار بالفرز أو القبول المبدئي للمرشحين الأعلى كفاءة.",
        expectedOutcomeEn: "Rapid qualification of high-scoring candidates."
      },
      {
        stepNumber: 4,
        titleAr: "استخدام إجراءات الإنشاء السريعة",
        titleEn: "Utilize Quick Action Triggers",
        actionAr: "اضغط على زر 'وظيفة جديدة' أو 'دعوة فريق' أو 'جدولة مقابلة' لإنجاز أي مهمة بنقرة واحدة.",
        actionEn: "Click 'New Job', 'Invite Team', or 'Schedule Interview' directly from the dashboard.",
        expectedOutcomeAr: "توفير وقت التنقل بين القوائم المختلفة.",
        expectedOutcomeEn: "Zero friction in initiating key hiring actions."
      }
    ],
    keyButtons: [
      {
        nameAr: "شاغر جديد (+)",
        nameEn: "New Job (+)",
        descriptionAr: "يفتح نافذة إنشاء وظيفة جديدة وتحديد متطلباتها فوراً.",
        descriptionEn: "Opens modal to draft and publish a new job opening.",
        actionType: "primary"
      },
      {
        nameAr: "تصفية حسب المنشأة / الفرع",
        nameEn: "Filter by Company / Branch",
        descriptionAr: "يتيح لمسؤولي الشركات المتعددة التبديل بين مقرات العمل والشركات التابعة.",
        descriptionEn: "Allows multi-tenant admins to toggle between subsidiaries.",
        actionType: "secondary"
      },
      {
        nameAr: "عرض الكل",
        nameEn: "View All",
        descriptionAr: "ينقلك مباشرة إلى الشاشة التفصيلية المقابلة (المرشحين أو المقابلات أو الوظائف).",
        descriptionEn: "Navigates directly to the comprehensive view of that resource.",
        actionType: "action"
      }
    ],
    proTips: [
      {
        titleAr: "استخدم اختصار البحث السريع ⌘K",
        titleEn: "Use ⌘K Quick Command Palette",
        descriptionAr: "في أي وقت ومن أي شاشة، اضغط على زر ⌘K أو Ctrl+K للبحث عن أي مرشح أو وظيفة أو الانتقال لشاشة أخرى بلمح البصر.",
        descriptionEn: "Press Ctrl+K / ⌘K anywhere to jump instantly to any candidate, job, or system screen."
      },
      {
        titleAr: "تحديث البيانات اللحظي التلقائي",
        titleEn: "Real-time Live Sync",
        descriptionAr: "لوحة التحكم متصلة بقاعدة البيانات بشكل حي ومباشر؛ إذا تقدم مرشح الآن أو تم اعتماد عرض ستتحدث الأرقام تلقائياً دون إعادة تحميل الصفحة.",
        descriptionEn: "Data synchronizes in real time without needing browser page refreshes."
      }
    ],
    faqs: [
      {
        qAr: "لماذا تظهر بعض الأرقام صفراً؟",
        qEn: "Why do some metrics show zero?",
        aAr: "إذا كانت منشأتك جديدة، فهذا يعني أنه لم يتم إنشاء وظائف أو إضافة مرشحين بعد. ابدأ بإنشاء أول وظيفة من زر 'شاغر جديد'.",
        aEn: "If your workspace is new, no jobs or candidates exist yet. Click 'New Job' to kickstart."
      }
    ],
    quickLinks: [
      { labelAr: "شاشة الوظائف", labelEn: "Jobs", path: "/jobs" },
      { labelAr: "شاشة المرشحين", labelEn: "Candidates", path: "/candidates" },
      { labelAr: "مسار التوظيف", labelEn: "Pipeline", path: "/pipeline" }
    ]
  },
  {
    id: "jobs",
    matchPaths: ["/jobs"],
    titleAr: "إدارة الوظائف والشواغر",
    titleEn: "Job Openings & Requisitions",
    badgeAr: "أساسي",
    badgeEn: "Core",
    category: "core",
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    summaryAr: "إنشاء وإدارة وتخصيص إعلانات الوظائف ونشرها، مع استخراج روابط التقديم المباشر ورموز QR للمرشحين.",
    summaryEn: "Create, manage, and distribute job postings with direct applicant portals and QR codes.",
    targetAudienceAr: "مسؤولو التوظيف، مدراء الأقسام، مسؤولو الموارد البشرية",
    targetAudienceEn: "Recruiters, Hiring Managers, HR Coordinators",
    workflowStages: [
      { stepNumber: 1, labelAr: "إنشاء المسودة", labelEn: "Draft Specs" },
      { stepNumber: 2, labelAr: "المعايير والرخص", labelEn: "Requirements & ETEC" },
      { stepNumber: 3, labelAr: "حفظ ونشر الشاغر", labelEn: "Publish Live" },
      { stepNumber: 4, labelAr: "رابط التقديم و QR", labelEn: "Share Link & QR" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "الضغط على زر 'وظيفة جديدة'",
        titleEn: "Click 'New Job' Button",
        actionAr: "انقر على زر 'إنشاء وظيفة جديدة' في أعلى يسار الشاشة، أو اختر قالباً جاهزاً من 'مكتبة النظام'.",
        actionEn: "Click 'New Job' or pick a ready template from the System Library.",
        expectedOutcomeAr: "فتح نموذج إدخال بيانات الوظيفة الشامل.",
        expectedOutcomeEn: "Opens comprehensive job configuration dialog.",
              actionTrigger: {
          labelAr: "فتح نموذج إنشاء وظيفة ⚡",
          labelEn: "Open Job Form ⚡",
          actionType: "navigate",
          target: "/jobs?action=new",
        },
      },
      {
        stepNumber: 2,
        titleAr: "تعبئة المتطلبات والشروط الأساسية",
        titleEn: "Fill Core Requirements & Details",
        actionAr: "أدخل المسمى الوظيفي، القسم، المدينة، نمط العمل (حضوري/عن بعد)، وسنوات الخبرة المطلوبة والراتب التقديري.",
        actionEn: "Enter Job Title, Department, City, Work Mode, required experience, and salary range.",
        expectedOutcomeAr: "تحديد معايير الفلترة التلقائية التي سيعتمد عليها الذكاء الاصطناعي.",
        expectedOutcomeEn: "Configures automatic criteria used by AI scoring.",
              actionTrigger: {
          labelAr: "استعراض قوالب الوظائف ⚡",
          labelEn: "Browse Templates ⚡",
          actionType: "navigate",
          target: "/library",
        },
      },
      {
        stepNumber: 3,
        titleAr: "تفعيل متطلبات رخصة المعلم والدرس التجريبي (إن وجدت)",
        titleEn: "Toggle ETEC License & Demo Lesson",
        actionAr: "للوظائف التعليمية، قم بتفعيل خيار 'اشتراط رخصة هيئة تقويم التعليم والتدريب ETEC' وخيار 'رابط درس تجريبي'.",
        actionEn: "For teaching jobs, enable ETEC Professional License verification and demo video.",
        expectedOutcomeAr: "ظهور حقول إجبارية للمرشح للتحقق من رخصته قبل إتمام التقديم.",
        expectedOutcomeEn: "Enforces license and video upload requirements on candidate portal."
      },
      {
        stepNumber: 4,
        titleAr: "حفظ ونشر الوظيفة ومشاركة الرابط",
        titleEn: "Publish Job & Share Direct Link",
        actionAr: "اضغط 'حفظ ونشر'. ثم اضغط على زر 'مشاركة الرابط' لنسخ رابط التقديم المباشر أو تحميل رمز QR ونشره في لينكد إن ووسائل التواصل.",
        actionEn: "Save & publish. Click 'Share Link' to copy direct apply URL or download QR code.",
        expectedOutcomeAr: "الوظيفة تصبح نشطة ويستطيع المرشحون التقديم عليها فوراً عبر `/apply/:id`.",
        expectedOutcomeEn: "Job is live and ready to receive candidate submissions instantly."
      }
    ],
    keyButtons: [
      {
        nameAr: "إنشاء وظيفة جديدة",
        nameEn: "Create New Job",
        descriptionAr: "يفتح نافذة إعداد الشاغر من الصفر.",
        descriptionEn: "Opens empty form to create a new job from scratch.",
        actionType: "primary"
      },
      {
        nameAr: "مشاركة الرابط / رمز QR",
        nameEn: "Share Link / QR Code",
        descriptionAr: "ينسخ رابط التقديم المباشر للوظيفة ويولد رمز الاستجابة السريعة للطباعة والنشر.",
        descriptionEn: "Copies candidate apply link and generates scannable QR code.",
        actionType: "action"
      },
      {
        nameAr: "تعديل / إغلاق الشاغر",
        nameEn: "Edit / Close Job",
        descriptionAr: "يتيح تغيير الشروط أو إيقاف استقبال الطلبات عند الاكتفاء.",
        descriptionEn: "Modifies requirements or closes job to stop new applications.",
        actionType: "secondary"
      }
    ],
    proTips: [
      {
        titleAr: "وفر 90% من وقتك باستخدام قوالب النظام",
        titleEn: "Save 90% Time with Library Templates",
        descriptionAr: "بدلاً من كتابة الوصف يدوياً، افتح 'مكتبة النظام' واستخدم قوالب الوظائف الجاهزة (معلم لغة عربية، رياضيات، مطور برمجيات، HR...) المعدة بأحدث معايير المهارات والمسؤوليات.",
        descriptionEn: "Use pre-built job templates from System Library instead of typing from scratch."
      },
      {
        titleAr: "التحكم في ظهور الوظيفة في بوابة التوظيف",
        titleEn: "Control Public Visibility",
        descriptionAr: "يمكنك إبقاء الوظيفة داخلية (Internal) أو نشرها للعامة، مع إمكانية إخفاء الراتب إذا رغبت.",
        descriptionEn: "Toggle between public and internal job status, and show/hide salary figures."
      }
    ],
    faqs: [
      {
        qAr: "كيف يمكنني إيقاف استقبال الطلبات على وظيفة مؤقتاً؟",
        qEn: "How do I pause applications temporarily?",
        aAr: "اضغط على النقاط الثلاث بجانب الوظيفة، واختر 'تغيير الحالة' إلى 'مغلقة مؤقتاً' أو 'مسودة'.",
        aEn: "Click the 3-dots menu on the job card and set status to 'Paused' or 'Draft'."
      }
    ],
    quickLinks: [
      { labelAr: "مكتبة قوالب الوظائف", labelEn: "Job Templates", path: "/library" },
      { labelAr: "مسار التوظيف", labelEn: "Pipeline", path: "/pipeline" },
      { labelAr: "المرشحون", labelEn: "Candidates", path: "/candidates" }
    ]
  },
  {
    id: "candidates",
    matchPaths: ["/candidates"],
    titleAr: "إدارة وفحص المرشحين والفرز الذكي",
    titleEn: "Candidates & Smart Screening",
    badgeAr: "أساسي",
    badgeEn: "Core",
    category: "core",
    icon: Users,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    summaryAr: "استعراض ملفات المتقدمين، قراءة السير الذاتية بالذكاء الاصطناعي، مطابقة رخص المعلمين، وتصفية المرشحين بدقة فائقة.",
    summaryEn: "Review applicants, parse resumes with AI, verify educator licenses, and filter candidates.",
    targetAudienceAr: "مسؤولو التوظيف، لجان المقابلات، مدراء الأقسام",
    targetAudienceEn: "Recruiters, Interview Panels, Department Leads",
    workflowStages: [
      { stepNumber: 1, labelAr: "استقبال الطلب", labelEn: "Inbound Application" },
      { stepNumber: 2, labelAr: "مطابقة الـ AI", labelEn: "AI Match Scoring" },
      { stepNumber: 3, labelAr: "فحص رخصة ETEC", labelEn: "ETEC License Check" },
      { stepNumber: 4, labelAr: "الترقية للمقابلة", labelEn: "Advance to Interview" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "تصفية المرشحين حسب الوظيفة أو المرحلة",
        titleEn: "Filter Candidates by Job or Stage",
        actionAr: "استخدم القوائم المنسدلة في أعلى الشاشة لاختيار الوظيفة المحددة، أو فلترة المرشحين حسب الحالة (جديد، مقابلة، تقييم، عرض).",
        actionEn: "Use top dropdowns to narrow down by job opening, stage, or application date.",
        expectedOutcomeAr: "حصر المتقدمين للشواغر المطلوبة وتسهيل فرزهم.",
        expectedOutcomeEn: "Focuses view strictly on the relevant applicant pool.",
              actionTrigger: {
          labelAr: "الانتقال لمسار الكانبان ⚡",
          labelEn: "Open Pipeline Kanban ⚡",
          actionType: "navigate",
          target: "/pipeline",
        },
      },
      {
        stepNumber: 2,
        titleAr: "الاعتماد على نسبة تطابق الذكاء الاصطناعي (AI Score)",
        titleEn: "Leverage AI Match Score Ranking",
        actionAr: "رتب القائمة حسب عمود 'درجة الذكاء الاصطناعي' لمعرفة المرشحين ذوي أعلى توافق مع متطلبات الوظيفة وخبراتها.",
        actionEn: "Sort table by AI Score column to prioritize best matches instantly.",
        expectedOutcomeAr: "الوصول السريع إلى أفضل 10% من المتقدمين دون تضييع الوقت في قراءة مئات السير يدوياً.",
        expectedOutcomeEn: "Surfaces top 10% best candidates in seconds."
      },
      {
        stepNumber: 3,
        titleAr: "فتح ملف المرشح وفحص السيرة والوثائق",
        titleEn: "Inspect Profile, Resume, and ETEC License",
        actionAr: "اضغط على اسم أي مرشح لفتح نافذة ملفه الشامل: قراءة السيرة الذاتية المستخرجة، التحقق من رقم رخصة هيئة تقويم التعليم ETEC، ومشاهدة فيديو الدرس التجريبي.",
        actionEn: "Click candidate name to inspect parsed CV, ETEC license status, and demo video.",
        expectedOutcomeAr: "الاطلاع على كافة بيانات المرشح في شاشة واحدة.",
        expectedOutcomeEn: "Full 360 view of the applicant's credentials in one drawer."
      },
      {
        stepNumber: 4,
        titleAr: "اتخاذ الإجراء: ترقية المرحلة أو جدولة مقابلة",
        titleEn: "Take Action: Advance Stage or Schedule Interview",
        actionAr: "من داخل ملف المرشح، اضغط 'نقل إلى مرحلة المقابلة' أو 'جدولة مقابلة فورية' أو 'إرسال اختبار بنك الأسئلة'.",
        actionEn: "Click 'Advance Stage', 'Schedule Interview', or 'Send Assessment' directly.",
        expectedOutcomeAr: "انتقال المرشح فوراً للمرحلة التالية وإرسال إشعار آلي له.",
        expectedOutcomeEn: "Immediate stage transition with automated candidate notification."
      }
    ],
    keyButtons: [
      {
        nameAr: "إضافة مرشح يدوياً (+)",
        nameEn: "Add Candidate Manually (+)",
        descriptionAr: "يتيح لمسؤول التوظيف رفع سيرة ذاتية يدوياً لمرشح جاء عن طريق توصية أو وسيلة خارجية.",
        descriptionEn: "Manually upload a resume received from referrals or external channels.",
        actionType: "primary"
      },
      {
        nameAr: "تصدير إلى Excel / PDF",
        nameEn: "Export to Excel / PDF",
        descriptionAr: "تنزيل كشف كامل ببيانات وتواصل المرشحين المحددين.",
        descriptionEn: "Download candidate records and contact info to spreadsheet.",
        actionType: "action"
      },
      {
        nameAr: "إجراءات جماعية (Bulk Actions)",
        nameEn: "Bulk Actions",
        descriptionAr: "تحديد عدة مرشحين لنقلهم لمرحلة المقابلة أو إرسال رسائل جماعية دفعة واحدة.",
        descriptionEn: "Select multiple candidates to bulk move or message at once.",
        actionType: "secondary"
      }
    ],
    proTips: [
      {
        titleAr: "تفعيل التقييم السريع بنجوم الجدارة",
        titleEn: "Use Rating Stars & Team Notes",
        descriptionAr: "يمكن لكل عضو في لجنة الفرز وضع تقييم من 1 إلى 5 نجوم مع كتابة ملاحظة خاصة تظهر لأعضاء الفريق الآخرين فقط.",
        descriptionEn: "Leave 1-5 star ratings and private team notes visible only to interviewers."
      },
      {
        titleAr: "البحث الذكي بالمهارات",
        titleEn: "Smart Search by Skill",
        descriptionAr: "في حقل البحث، اكتب أي مهارة دقيقة (مثل: 'React', 'كيمياء عضوية', 'Math') وسيقوم النظام بالبحث داخل نصوص السير الذاتية بالكامل.",
        descriptionEn: "Type specific skills in the search box to search inside raw resume contents."
      }
    ],
    faqs: [
      {
        qAr: "هل يحتاج المرشح لإنشاء حساب ليظهر هنا؟",
        qEn: "Does candidate need an account to appear here?",
        aAr: "لا، بمجرد أن يرفع المرشح سيرته على رابط الوظيفة، يقوم النظام بإنشاء ملف وتوليد كود تتبع فوري له تلقائياً.",
        aEn: "No, submitting the public job application automatically creates the profile."
      }
    ],
    quickLinks: [
      { labelAr: "مسار التوظيف (كانبان)", labelEn: "Pipeline", path: "/pipeline" },
      { labelAr: "جدولة المقابلات", labelEn: "Interviews", path: "/interviews" },
      { labelAr: "أرشيف السير الذاتية", labelEn: "Resume Archive", path: "/resume-archive" }
    ]
  },
  {
    id: "pipeline",
    matchPaths: ["/pipeline"],
    titleAr: "مسار التوظيف والكانبان التفاعلي",
    titleEn: "Hiring Pipeline & Kanban Board",
    badgeAr: "أساسي",
    badgeEn: "Core",
    category: "core",
    icon: Kanban,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    summaryAr: "لوحة سحب وإفلات تفاعلية لمتابعة رحلة المرشح من التقديم حتى التعيين النهائي مع بوابات جودة وتحقق آلي.",
    summaryEn: "Interactive drag-and-drop board tracking candidates across hiring stages with quality gates.",
    targetAudienceAr: "مدراء ومسؤولو التوظيف ولجان الاعتماد",
    targetAudienceEn: "Recruiters, Hiring Managers, Approval Panels",
    workflowStages: [
      { stepNumber: 1, labelAr: "تقديم جديد", labelEn: "New Applications" },
      { stepNumber: 2, labelAr: "مراجعة أولية", labelEn: "Initial Screening" },
      { stepNumber: 3, labelAr: "المقابلة والدرس", labelEn: "Interview & Demo" },
      { stepNumber: 4, labelAr: "العرض والتعيين", labelEn: "Offer & Placement" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "اختيار الوظيفة المراد إدارتها",
        titleEn: "Select Job Requisition",
        actionAr: "من القائمة المنسدلة في الأعلى، اختر الوظيفة لمشاهدة مسار مرشحيها المقسم حسب المراحل.",
        actionEn: "Pick job opening to view its dedicated pipeline stage columns.",
        expectedOutcomeAr: "عرض كافة أعمدة المراحل الخاصة بهذه الوظيفة فقط.",
        expectedOutcomeEn: "Renders clean, focused Kanban columns for this job.",
              actionTrigger: {
          labelAr: "جدولة مقابلة للمرشح ⚡",
          labelEn: "Schedule Interview ⚡",
          actionType: "navigate",
          target: "/interviews",
        },
      },
      {
        stepNumber: 2,
        titleAr: "سحب وإفلات بطاقة المرشح",
        titleEn: "Drag and Drop Candidate Cards",
        actionAr: "امسك بطاقة المرشح بالماوس أو اللمس، واسحبها من عمود (مثلاً: 'مراجعة أولية') وأفلتها في عمود ('مؤهل للمقابلة').",
        actionEn: "Drag candidate card from one column and drop into target stage.",
        expectedOutcomeAr: "تحديث حالة المرشح في قاعدة البيانات فوراً وإرسال إشعار بريدي للمرشح إذا كانت الإشعارات مفعلة.",
        expectedOutcomeEn: "Instant stage transition saved in DB with auto-email dispatch."
      },
      {
        stepNumber: 3,
        titleAr: "مراعاة شروط وقواعد التحقق (Quality Safeguards)",
        titleEn: "Comply with Stage Safeguards",
        actionAr: "إذا كان الانتقال لمرحلة 'العرض الوظيفي' يتطلب اجتياز المقابلة أو الاختبار، سينبهك النظام إذا لم يكتمل الشرط لحماية جودة التعيين.",
        actionEn: "System alerts you if required assessments or interviews are incomplete before offer stage.",
        expectedOutcomeAr: "حماية المنشأة من الأخطاء العشوائية أو تخطي مراحل التقييم الإجبارية.",
        expectedOutcomeEn: "Prevents accidental bypass of mandatory evaluation stages."
      },
      {
        stepNumber: 4,
        titleAr: "استعراض الإجراءات السريعة من ظهر البطاقة",
        titleEn: "Use Card Quick Actions",
        actionAr: "اضغط على زر الهاتف أو البريد أو الأيقونات المصغرة على بطاقة المرشح للتواصل معه أو فتح تقرير المقابلة فوراً.",
        actionEn: "Click phone, email, or score icons on candidate card for instant actions.",
        expectedOutcomeAr: "تنفيذ الإجراء دون الحاجة لمغادرة لوحة الكانبان.",
        expectedOutcomeEn: "Zero context-switching during high-volume screening."
      }
    ],
    keyButtons: [
      {
        nameAr: "تصفية سريعة (فلتر)",
        nameEn: "Quick Filter",
        descriptionAr: "تصفية البطاقات حسب نسبة مطابقة الـ AI، أو التقييم بالنجوم، أو المدن.",
        descriptionEn: "Filter pipeline cards by AI match %, star rating, or city.",
        actionType: "action"
      },
      {
        nameAr: "مقارنة المرشحين",
        nameEn: "Compare Candidates",
        descriptionAr: "اختيار حتى 4 مرشحين ومقارنة نقاط القوة والضعف والخبرات جنباً إلى جنب.",
        descriptionEn: "Select up to 4 candidates to view side-by-side competency comparison.",
        actionType: "primary"
      },
      {
        nameAr: "تخصيص المراحل",
        nameEn: "Customize Stages",
        descriptionAr: "إعادة ترتيب الأعمدة أو إضافة مرحلة جديدة خاصة بمنشأتك.",
        descriptionEn: "Add, reorder, or rename pipeline stages to match internal process.",
        actionType: "secondary"
      }
    ],
    proTips: [
      {
        titleAr: "استخدم السحب الجماعي للفرز السريع",
        titleEn: "Bulk Selection & Actions",
        descriptionAr: "يمكنك تحديد مربعات الاختيار على بطاقات المرشحين ونقل 10 مرشحين دفعة واحدة إلى مرحلة المقابلة بضغطة زر واحدة.",
        descriptionEn: "Check multiple cards to transition several applicants simultaneously."
      }
    ],
    faqs: [
      {
        qAr: "هل يمكن التراجع عن سحب بطاقة مرشح؟",
        qEn: "Can I undo moving a candidate card?",
        aAr: "نعم بكل سهولة، فقط اسحب البطاقة وأعدها إلى العمود السابق في أي وقت.",
        aEn: "Yes, simply drag the card back to its previous column at any time."
      }
    ],
    quickLinks: [
      { labelAr: "جدولة المقابلات", labelEn: "Interviews", path: "/interviews" },
      { labelAr: "العروض الوظيفية", labelEn: "Offers", path: "/offers" },
      { labelAr: "قائمة المرشحين", labelEn: "Candidates", path: "/candidates" }
    ]
  },
  {
    id: "interviews",
    matchPaths: ["/interviews"],
    titleAr: "جدولة المقابلات وغرف الفيديو المدمجة",
    titleEn: "Interview Scheduling & Video Rooms",
    badgeAr: "أساسي",
    badgeEn: "Core",
    category: "core",
    icon: Calendar,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    summaryAr: "إدارة تقويم المقابلات، حجز المواعيد، غرف المقابلات الافتراضية بالفيديو المدمجة، وتسجيل التقييم اللحظي للجنة.",
    summaryEn: "Manage interview calendar, schedule meetings, launch virtual video rooms, and record scores.",
    targetAudienceAr: "مسؤولو التوظيف، لجان المقابلات، رؤساء الأقسام",
    targetAudienceEn: "Recruiters, Interviewers, Department Heads",
    workflowStages: [
      { stepNumber: 1, labelAr: "حجز الموعد", labelEn: "Slot Booking" },
      { stepNumber: 2, labelAr: "دعوة اللجنة", labelEn: "Panel Invites" },
      { stepNumber: 3, labelAr: "غرفة فيديو HD", labelEn: "HD Video Room" },
      { stepNumber: 4, labelAr: "اعتماد التقييم", labelEn: "Submit Scorecard" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "الضغط على 'جدولة مقابلة جديدة'",
        titleEn: "Click 'Schedule Interview'",
        actionAr: "اضغط على زر 'جدولة مقابلة جديدة' في أعلى الصفحة، أو من بطاقة المرشح في شاشة الكانبان.",
        actionEn: "Click 'Schedule Interview' button or initiate from candidate card.",
        expectedOutcomeAr: "فتح نافذة اختيار المرشح والوقت والنوع.",
        expectedOutcomeEn: "Opens interview scheduling configuration modal.",
              actionTrigger: {
          labelAr: "جدولة موعد جديد الآن ⚡",
          labelEn: "Schedule Interview Slot ⚡",
          actionType: "navigate",
          target: "/interviews?action=create",
        },
      },
      {
        stepNumber: 2,
        titleAr: "تحديد تفاصيل المقابلة واللجنة ونوع اللقاء",
        titleEn: "Set Time, Interviewers, and Mode",
        actionAr: "اختر المرشح، حدد اليوم والتوقيت، أعضاء اللجنة من فريقك، ونوع المقابلة (غرفة فيديو افتراضية Tawzeef-X، أو حضورية بالمقر).",
        actionEn: "Pick candidate, date/time, interview committee, and mode (Virtual Video Room or In-Person).",
        expectedOutcomeAr: "توليد رابط غرفة فيديو مشفر تلقائياً للمقابلة وإرساله لطرفي اللقاء.",
        expectedOutcomeEn: "Generates encrypted video room link and dispatches calendar invites."
      },
      {
        stepNumber: 3,
        titleAr: "دخول غرفة المقابلة الافتراضية المدمجة",
        titleEn: "Launch Embedded Video Room",
        actionAr: "في موعد المقابلة، اضغط على زر 'دخول الغرفة' للانتقال إلى غرفة الفيديو عالية الدقة المدمجة في المنصة دون الحاجة لبرامج خارجية كـ Zoom أو Teams.",
        actionEn: "Click 'Enter Room' at scheduled time to launch HD built-in video meeting.",
        expectedOutcomeAr: "لقاء تفاعلي مباشر يتيح مشاركة الشاشة وعرض سيرة المرشح بجانب الفيديو.",
        expectedOutcomeEn: "Seamless meeting with screen share and resume dock beside video."
      },
      {
        stepNumber: 4,
        titleAr: "تسجيل درجات التقييم وتفريغ الملاحظات",
        titleEn: "Submit Real-time Scorecard",
        actionAr: "أثناء أو بعد المقابلة، قم بتعبئة نموذج التقييم المخصص (المظهر، المهارة التخصصية، مهارات التواصل، والنتيجة العامة) واضغط 'حفظ التقييم'.",
        actionEn: "Fill out the structured scorecard (competencies, communication, score) and submit.",
        expectedOutcomeAr: "ربط تقييم اللجنة مباشرة بملف المرشح وحساب متوسط الدرجة آلياً.",
        expectedOutcomeEn: "Scores saved permanently to candidate profile and averaged automatically."
      }
    ],
    keyButtons: [
      {
        nameAr: "جدولة مقابلة جديدة (+)",
        nameEn: "Schedule New Interview (+)",
        descriptionAr: "حجز موعد جديد وإرسال دعوات التقويم للمرشح والمقيمين.",
        descriptionEn: "Books new interview slot and dispatches calendar invitations.",
        actionType: "primary"
      },
      {
        nameAr: "دخول غرفة الفيديو",
        nameEn: "Join Video Room",
        descriptionAr: "يفتح غرفة الاجتماع الافتراضية المدمجة والمؤمنة.",
        descriptionEn: "Opens the secure in-platform virtual video conference.",
        actionType: "action"
      },
      {
        nameAr: "نموذج التقييم (Scorecard)",
        nameEn: "Open Scorecard",
        descriptionAr: "يفتح بطاقة معايير تقييم المرشح لتسجيل ملاحظات ودرجات المقابلة.",
        descriptionEn: "Opens evaluation criteria rubric to grade candidate performance.",
        actionType: "secondary"
      }
    ],
    proTips: [
      {
        titleAr: "تذكير تلقائي عبر WhatsApp والبريد",
        titleEn: "Automated Reminders",
        descriptionAr: "يرسل النظام تذكيراً آلياً للمرشح قبل المقابلة بـ 24 ساعة ثم بساعتين لتقليل نسبة الغياب (No-Show).",
        descriptionEn: "Automated reminders sent 24h and 2h before interview to minimize no-shows."
      }
    ],
    faqs: [
      {
        qAr: "هل يحتاج المرشح لتنزيل أي تطبيق لدخول المقابلة؟",
        qEn: "Does the applicant need to download any software?",
        aAr: "لا، غرفة الفيديو تعمل مباشرة على أي متصفح (سواء على الهاتف الذكي أو الكمبيوتر) بدون أي تحميل.",
        aEn: "No, the video room runs directly in any browser on mobile and desktop without installs."
      }
    ],
    quickLinks: [
      { labelAr: "مسار التوظيف", labelEn: "Pipeline", path: "/pipeline" },
      { labelAr: "العروض الوظيفية", labelEn: "Offers", path: "/offers" },
      { labelAr: "لوحة التحكم", labelEn: "Dashboard", path: "/dashboard" }
    ]
  },
  {
    id: "offers",
    matchPaths: ["/offers"],
    titleAr: "العروض الوظيفية الرقمية والتوقيع الإلكتروني",
    titleEn: "Digital Offers & E-Signature",
    badgeAr: "أساسي",
    badgeEn: "Core",
    category: "core",
    icon: FileText,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    summaryAr: "إنشاء عروض العمل الرسمية بالريال السعودي، حساب البدلات، إرسال العقد الرقمي برابط تتبع، والتوقيع الإلكتروني للمرشح مع توليد PDF رسمي.",
    summaryEn: "Generate official job offers in SAR, configure allowances, send digital links, and secure e-signatures with PDF generation.",
    targetAudienceAr: "مدراء الموارد البشرية، مسؤولو التوظيف، الإدارة المالية",
    targetAudienceEn: "HR Directors, Talent Acquisition Leads, Finance",
    workflowStages: [
      { stepNumber: 1, labelAr: "الراتب والبدلات", labelEn: "Comp & Allowances" },
      { stepNumber: 2, labelAr: "مسودة العقد", labelEn: "Contract Review" },
      { stepNumber: 3, labelAr: "إرسال الرابط", labelEn: "Send Encrypted Link" },
      { stepNumber: 4, labelAr: "التوقيع و PDF", labelEn: "E-Sign & PDF" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "الضغط على 'إنشاء عرض وظيفي جديد'",
        titleEn: "Click 'Create Job Offer'",
        actionAr: "انقر زر 'عرض وظيفي جديد' واختر المرشح الفائز من قائمة المقبولين.",
        actionEn: "Click 'New Offer' and select the qualified candidate from the list.",
        expectedOutcomeAr: "فتح محرر العرض الوظيفي الرسمي المتكامل.",
        expectedOutcomeEn: "Opens official job offer builder with salary breakdown.",
              actionTrigger: {
          labelAr: "إنشاء عرض وظيفي رسمي ⚡",
          labelEn: "Draft Job Offer ⚡",
          actionType: "navigate",
          target: "/offers?action=create",
        },
      },
      {
        stepNumber: 2,
        titleAr: "تحديد تفاصيل الراتب والبدلات والمزايا",
        titleEn: "Set Salary, Allowances, & Start Date",
        actionAr: "أدخل الراتب الأساسي (بالريال السعودي)، بدل السكن، بدل النقل، التأمين الطبي، وتاريخ المباشرة المتوقع ومدة سريان العرض (مثلاً 5 أيام).",
        actionEn: "Enter Basic Salary (SAR), Housing, Transport, Medical Insurance, and Start Date.",
        expectedOutcomeAr: "حساب الإجمالي التلقائي ومطابقته لبنود نظام العمل السعودي وقوى.",
        expectedOutcomeEn: "Auto-calculates gross compensation conforming to Saudi labor regulations."
      },
      {
        stepNumber: 3,
        titleAr: "مراجعة بنود العقد وإرساله للمرشح",
        titleEn: "Review Terms and Dispatch Offer Link",
        actionAr: "راجع مسودة العرض الرسمية باللغتين العربية والإنجليزية، ثم اضغط 'إرسال العرض للمرشح'.",
        actionEn: "Review offer preview, then click 'Send to Candidate'.",
        expectedOutcomeAr: "توليد رابط مشفر وآمن مخصص للمرشح وإرساله عبر رسالة نصية وبريد إلكتروني.",
        expectedOutcomeEn: "Encrypted secure offer link dispatched to candidate via email & SMS."
      },
      {
        stepNumber: 4,
        titleAr: "متابعة توقيع المرشح وتوليد الـ PDF الرسمي",
        titleEn: "Track E-Signature & Download PDF",
        actionAr: "يدخل المرشح على الرابط ويوقع إلكترونياً بلمسة أو بالماوس. يتحول العرض فوراً في لوحتك إلى 'تم القبول' ويمكنك تحميل ملف PDF المعتمد والموقع رسمياً.",
        actionEn: "Candidate signs electronically. Offer changes to 'Accepted' and PDF is ready to download.",
        expectedOutcomeAr: "إنهاء دورة التوظيف الرسمية وتأكيد تعيين الموظف الجديد بنجاح تام.",
        expectedOutcomeEn: "Offer legally signed and candidate successfully hired."
      }
    ],
    keyButtons: [
      {
        nameAr: "إنشاء عرض جديد (+)",
        nameEn: "New Offer (+)",
        descriptionAr: "يفتح محرر إنشاء العروض الوظيفية الرسمية.",
        descriptionEn: "Opens builder to prepare a formal employment offer.",
        actionType: "primary"
      },
      {
        nameAr: "تحميل PDF الرسمي",
        nameEn: "Download PDF",
        descriptionAr: "تنزيل العرض الوظيفي الرسمي بصيغة PDF عالية الجودة مع الشعار والتوقيعات.",
        descriptionEn: "Downloads official branded PDF with signatures.",
        actionType: "action"
      },
      {
        nameAr: "نسخ رابط العرض للمرشح",
        nameEn: "Copy Offer Portal Link",
        descriptionAr: "نسخ رابط بوابة استعراض وتوقيع العرض المباشر للمرشح.",
        descriptionEn: "Copies candidate's encrypted offer review link.",
        actionType: "secondary"
      }
    ],
    proTips: [
      {
        titleAr: "تحديد مهلة انتهاء سريان العرض (Expiry Deadline)",
        titleEn: "Set Expiry Counter",
        descriptionAr: "حدد مدة معينة للقبول (مثلاً 3 إلى 7 أيام)؛ سيظهر للمرشح عداد تنازلي يحفزه على سرعة اتخاذ القرار والتوقيع.",
        descriptionEn: "Set an expiry countdown (e.g. 5 days) to encourage prompt candidate decisions."
      }
    ],
    faqs: [
      {
        qAr: "ماذا لو أراد المرشح التفاوض أو تعديل الراتب؟",
        qEn: "What if candidate negotiates the offer?",
        aAr: "يمكنك في أي وقت فتح العرض والضغط على 'تعديل المسودة' وتحديث الأرقام وإعادة إرسالها دون الحاجة لإنشاء عرض جديد.",
        aEn: "You can click 'Edit Offer' at any time to revise numbers and re-dispatch."
      }
    ],
    quickLinks: [
      { labelAr: "الطلبات المحولة", labelEn: "Converted Orders", path: "/converted-orders" },
      { labelAr: "مسار التوظيف", labelEn: "Pipeline", path: "/pipeline" },
      { labelAr: "تقييم الأداء", labelEn: "Evaluation", path: "/evaluation" }
    ]
  },
  {
    id: "system-library",
    matchPaths: ["/library", "/system-library"],
    titleAr: "مكتبة النظام وقوالب العمل ومستعرض Material 3",
    titleEn: "System Library, Templates & Design Assets",
    badgeAr: "مكتبة مركزية",
    badgeEn: "Library",
    category: "ai",
    icon: LibraryBig,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    summaryAr: "المستودع المركزي لجميع أصول التوظيف: أكثر من 12 قالباً وظيفياً جاهزاً، مسودات العقود الرسمية المتوافقة مع قوى، قوالب المراسلات، ومستعرض أيقونات Google Material Symbols.",
    summaryEn: "Central repository of ready-made job templates, legal employment contracts, HR messages, and Google Material Symbols.",
    targetAudienceAr: "مسؤولو التوظيف، مدراء الموارد البشرية، مصممو ومطورو النظام",
    targetAudienceEn: "Recruiters, HR Specialists, System Admins",
    workflowStages: [
      { stepNumber: 1, labelAr: "قوالب الوظائف", labelEn: "Job Templates" },
      { stepNumber: 2, labelAr: "مسودات العقود", labelEn: "Legal Contracts" },
      { stepNumber: 3, labelAr: "نماذج المراسلات", labelEn: "Email Templates" },
      { stepNumber: 4, labelAr: "رموز Material 3", labelEn: "Material Symbols" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "استعراض أجنحة المكتبة الأربعة",
        titleEn: "Explore the 4 Library Tabs",
        actionAr: "تنقل بين أجنحة المكتبة الأربعة: 1) قوالب الوظائف الجاهزة، 2) مسودات العقود والوثائق، 3) قوالب البريد والمراسلات، 4) مكتبة Google Material 3.",
        actionEn: "Toggle between the 4 tabs: Job Templates, Contracts & Offers, Messages, and Material 3.",
        expectedOutcomeAr: "الوصول السريع للأصل أو النموذج الذي تحتاجه في ثوانٍ معدودة.",
        expectedOutcomeEn: "Rapid access to any HR template or design asset.",
              actionTrigger: {
          labelAr: "استخدام قالب لإنشاء وظيفة ⚡",
          labelEn: "Use Template For Job ⚡",
          actionType: "navigate",
          target: "/jobs?action=new",
        },
      },
      {
        stepNumber: 2,
        titleAr: "استخدام قالب وظيفة لإنشاء شاغر بنقرة واحدة",
        titleEn: "Instantiate Job from Template in 1 Click",
        actionAr: "في جناح 'قوالب الوظائف'، ابحث عن الوظيفة (مثلاً: معلم كيمياء، مطور واجهات، أخصائي تسويق) واضغط زر 'استخدام القالب لإنشاء وظيفة'.",
        actionEn: "Pick a job template and click 'Use Template to Create Job'.",
        expectedOutcomeAr: "فتح شاشة الوظائف ونقل كافة المسؤوليات والمهارات والشروط جاهزة ومكتوبة باحترافية.",
        expectedOutcomeEn: "Populates the job builder instantly with industry-grade requirements and skills.",
              actionTrigger: {
          labelAr: "استعراض مسودات العقود ⚡",
          labelEn: "View Contract Drafts ⚡",
          actionType: "navigate",
          target: "/library",
        },
      },
      {
        stepNumber: 3,
        titleAr: "نسخ مسودة عقد العمل أو اتفاقية السرية NDA",
        titleEn: "Copy Official Employment Contract Draft",
        actionAr: "في جناح 'مسودات العقود'، اختر عقد العمل المعتمد واضغط 'نسخ النص' للاستفادة منه في صياغة العروض الرسمية المتوافقة مع نظام العمل.",
        actionEn: "Copy contract drafts compliant with Saudi labor standards.",
        expectedOutcomeAr: "حماية قانونية متكاملة دون الحاجة لصياغة عقود من الصفر.",
        expectedOutcomeEn: "Full legal compliance without drafting contracts from scratch."
      },
      {
        stepNumber: 4,
        titleAr: "استخدام مستعرض أيقونات Material Symbols",
        titleEn: "Search & Copy Material Symbols",
        actionAr: "في جناح 'Google Material Design 3'، ابحث بالاسم عن أي أيقونة أو رمز وانسخ كودها أو اسمها لاستخدامه في النظام.",
        actionEn: "Search through Google Material Symbols and copy names for immediate use.",
        expectedOutcomeAr: "الحفاظ على هوية بصرية موحدة وتصميم أنيق عبر المنصة.",
        expectedOutcomeEn: "Consistent, polished visual styling across all system screens."
      }
    ],
    keyButtons: [
      {
        nameAr: "استخدام القالب لإنشاء وظيفة",
        nameEn: "Use Template for New Job",
        descriptionAr: "ينقلك مباشرة لنموذج إنشاء وظيفة مع تعبئة كافة الحقول بالقالب المختار.",
        descriptionEn: "Opens job builder with all fields pre-populated from this template.",
        actionType: "primary"
      },
      {
        nameAr: "نسخ نص النموذج",
        nameEn: "Copy Template Text",
        descriptionAr: "ينسخ نص العقد أو رسالة البريد إلى الحافظة لاستخدامها فوراً.",
        descriptionEn: "Copies contract or email template text directly to clipboard.",
        actionType: "action"
      },
      {
        nameAr: "معاينة النموذج الكامل",
        nameEn: "Preview Full Template",
        descriptionAr: "يفتح نافذة لعرض كافة تفاصيل النموذج والشروط.",
        descriptionEn: "Opens detailed preview drawer showing all template details.",
        actionType: "secondary"
      }
    ],
    proTips: [
      {
        titleAr: "تحديث دائم للقوالب المتوافقة مع قطاع التعليم",
        titleEn: "Education & Tech Specialized Templates",
        descriptionAr: "تحتوي المكتبة على قوالب متخصصة جداً لمدارس المملكة تشمل رخص المعلم ETEC والمسار التخصصي لكل مادة دراسية.",
        descriptionEn: "Features specialized Saudi school teacher templates with ETEC licensing prerequisites."
      }
    ],
    faqs: [
      {
        qAr: "هل يمكنني إضافة قوالب خاصة بمنشأتي؟",
        qEn: "Can I customize or add proprietary templates?",
        aAr: "نعم، يمكنك تعديل أي قالب وحفظه باسم وظيفة جديدة ليصبح متاحاً لمنشأتك دائماً.",
        aEn: "Yes, you can edit any template and save it as a reusable organization custom job."
      }
    ],
    quickLinks: [
      { labelAr: "إنشاء وظيفة جديدة", labelEn: "Jobs", path: "/jobs" },
      { labelAr: "العروض الوظيفية", labelEn: "Offers", path: "/offers" },
      { labelAr: "دليل النظام بالكامل", labelEn: "System Guide", path: "/tutorial" }
    ]
  },
  {
    id: "tasks",
    matchPaths: ["/tasks", "/task-board"],
    titleAr: "إدارة المهام والتنفيذ والمراجعة", titleEn: "Task planning, execution and review",
    badgeAr: "أداء ومهام", badgeEn: "Tasks", category: "performance", icon: CheckSquare,
    color: "text-blue-600", bg: "bg-blue-600/10", border: "border-blue-600/20",
    summaryAr: "مهام داخل الشركة بمسؤول من حسابات الفريق، وناتج واضح وموعد تسليم، مع مراجعة اختيارية وسجل تغييرات وأرشفة قابلة للاسترجاع.",
    summaryEn: "Company-scoped tasks with real account assignees, agreed outcomes, deadlines, optional review, history and reversible archive.",
    targetAudienceAr: "أعضاء الشركة ومسؤولو الفريق", targetAudienceEn: "Company members and team administrators",
    workflowStages: [
      {stepNumber:1,labelAr:"التخطيط والتكليف",labelEn:"Plan and assign"},
      {stepNumber:2,labelAr:"التنفيذ وتوثيق الناتج",labelEn:"Execute and document"},
      {stepNumber:3,labelAr:"المراجعة عند التكليف",labelEn:"Review when assigned"},
      {stepNumber:4,labelAr:"الإكمال والمتابعة",labelEn:"Complete and follow up"}
    ],
    steps: [
      {stepNumber:1,titleAr:"حدد المطلوب والمسؤول",titleEn:"Define outcome and ownership",
      actionAr:"أنشئ مهمة بعنوان وناتج مطلوب وموعد تسليم. مسؤول الشركة يستطيع تكليف أعضاء آخرين؛ العضو ينشئ مهامه لنفسه. اختر مراجعًا مختلفًا إذا لزم اعتماد مستقل.",
      actionEn:"Create a task with title, outcome and due date. Administrators can assign others; members create their own tasks. Select a different reviewer for independent approval.",
      expectedOutcomeAr:"تظهر المهمة ضمن المخططة لحسابات المنشئ والمسؤول والمراجع ومسؤولي الشركة.",expectedOutcomeEn:"The planned task appears for its creator, assignee, reviewer and company administrators.",
      actionTrigger:{labelAr:"إضافة مهمة الآن",labelEn:"New task",actionType:"navigate",target:"/tasks?action=new"}},
      {stepNumber:2,titleAr:"نفّذ وسجّل الناتج",titleEn:"Execute and document",
      actionAr:"المسؤول يبدأ التنفيذ من التفاصيل، ويضيف أنشطة ويحدّثها ويسجّل ناتج التنفيذ وأي عائق. احفظ تحديث التنفيذ قبل تغيير الحالة.",
      actionEn:"The assignee starts work from task details, records activities, results and blockers. Save work updates before changing status.",
      expectedOutcomeAr:"يُمنع التسليم دون ناتج أو مع أنشطة ناقصة أو عائق قائم.",expectedOutcomeEn:"Submission requires a result, completed activities and no unresolved blocker."},
      {stepNumber:3,titleAr:"راجع ثم اعتمد أو أعد للتعديل",titleEn:"Review and approve or return",
      actionAr:"المراجع المحدد وحده يعتمد العمل أو يعيده للتعديل مع السبب. دون مراجع يؤكد المسؤول الإكمال. يمكن للمنشئ أو مسؤول الشركة إعادة الفتح بسبب موثق أو الأرشفة والاسترجاع.",
      actionEn:"Only the assigned reviewer approves or returns work with a reason. Without a reviewer, the assignee confirms completion. Creators and administrators can reopen with a reason or archive and restore.",
      expectedOutcomeAr:"حالة وسجل تغييرات واضحان؛ لا تُحتسب المهام تلقائيًا كدرجات أداء.",expectedOutcomeEn:"A clear status and activity history; task counts never automatically become performance scores."}
    ],
    keyButtons:[
      {nameAr:"إضافة مهمة جديدة",nameEn:"New task",descriptionAr:"تخطيط مهمة من الصفر أو بقالب اختياري.",descriptionEn:"Plan a task from scratch or an optional template.",actionType:"primary"},
      {nameAr:"بانتظار مراجعتي",nameEn:"Awaiting my review",descriptionAr:"يعرض المهام المسلّمة لك للمراجعة.",descriptionEn:"Filter work submitted to you for review.",actionType:"action"},
      {nameAr:"الأرشيف",nameEn:"Archive",descriptionAr:"عرض المهام المؤرشفة واسترجاع ما لديك صلاحية إدارته.",descriptionEn:"View archived tasks and restore those you manage.",actionType:"action"}
    ],
    proTips:[{titleAr:"المتابعة بعد التقييم",titleEn:"Follow up a review",descriptionAr:"من تقرير الدورة المغلقة أنشئ مهمة تطوير بناتج وموعد. الربط مرجع للمناقشة ولا يغيّر درجة التقييم.",descriptionEn:"Create a development task from a closed-cycle report. The link supports discussion and never changes review scores."}],
    faqs:[{qAr:"هل يصل إشعار تلقائي أو موعد في التقويم؟",qEn:"Are notifications or calendar entries automatic?",aAr:"لا. تظهر المهمة داخل حسابات المشاركين في لوحة المهام؛ لم يُضف إرسال تلقائي للبريد أو التقويم.",aEn:"No. Tasks appear in participants’ task boards; automatic email and calendar delivery are not implemented."}],
    quickLinks:[{labelAr:"تقييم الأداء",labelEn:"Performance reviews",path:"/evaluation"},{labelAr:"إدارة الفريق",labelEn:"Team",path:"/team"}]
  },
  {
    id: "evaluation",
    matchPaths: ["/evaluation", "/performance-evaluation", "/evaluation/cycles", "/evaluation/manual"],
    titleAr: "تقييم الأداء المؤسسي الشامل (360 Degree)",
    titleEn: "360-Degree Performance Evaluation",
    badgeAr: "أداء ومهام",
    badgeEn: "Evaluation",
    category: "performance",
    icon: Target,
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    border: "border-amber-600/20",
    summaryAr: "دورات مستقلة من شاشة تقييم الأداء بمعايير وأوزان محددة، وتكليف المشاركين من نفس الشركة، وإجابات من حساباتهم. يمكن تعديل المسودة قبل الفتح، ويبقى السجل اليدوي السابق منفصلًا.",
    summaryEn: "Independent cycles on the performance review page use explicit criteria and weights, same-company assignments and responses from assigned accounts. Drafts can be edited before opening; the previous manual log remains separate.",
    targetAudienceAr: "مدراء الموارد البشرية، رؤساء الأقسام، الموظفون",
    targetAudienceEn: "HR Directors, Department Heads, Employees",
    workflowStages: [
      { stepNumber: 1, labelAr: "إعداد الدورة", labelEn: "Configure cycle" },
      { stepNumber: 2, labelAr: "تكليف المشاركين", labelEn: "Assign reviewers" },
      { stepNumber: 3, labelAr: "الإجابات المستقلة", labelEn: "Independent answers" },
      { stepNumber: 4, labelAr: "إغلاق ونتائج", labelEn: "Close and review" },
    ],
    steps: [
      { stepNumber: 1, titleAr: "إنشاء مسودة", titleEn: "Create a draft",
        actionAr: "افتح رابط الدورات المستقلة. مسؤول الشركة يحدد الموظف والفترة والموعد النهائي والمعايير وأوزانها بمجموع مائة.",
        actionEn: "Open Independent cycles. A company administrator selects subject, period, deadline and criteria with weights totaling 100.",
        expectedOutcomeAr: "مسودة خاصة بالشركة مع تكليف ذاتي تلقائي.", expectedOutcomeEn: "A company-scoped draft with an automatic self assignment." },
      { stepNumber: 2, titleAr: "تكليف المشاركين وفتح الدورة", titleEn: "Assign reviewers and open",
        actionAr: "أضف حسابات من نفس الشركة. مدير واحد كحد أقصى وثلاثة مشاركين على الأقل في أي فئة سرية. بعد الفتح تثبت المعايير والتكليفات.",
        actionEn: "Assign company accounts: at most one manager and at least three people per confidential group. Opening freezes criteria and assignments.",
        expectedOutcomeAr: "كل مشارك يرى تكليفه داخل حسابه دون بريد تلقائي.", expectedOutcomeEn: "Each participant sees their assignment in their account, without automatic email." },
      { stepNumber: 3, titleAr: "تسليم الإجابات ثم إغلاق الدورة", titleEn: "Submit answers and close",
        actionAr: "كل مشارك يجيب مرة واحدة من حسابه بدرجات من واحد إلى خمسة أو لم ألاحظ. المسؤول يغلق الدورة لإظهار النتائج المجمّعة.",
        actionEn: "Each assigned account submits once with scores from 1 to 5 or not observed. An administrator closes the cycle to release aggregate results.",
        expectedOutcomeAr: "نتيجة ثابتة للموظف والمسؤولين فقط؛ التقييم الذاتي مستبعد من المتوسط الخارجي.", expectedOutcomeEn: "A frozen report for the subject and administrators; self scores are excluded from external averages." }
    ],
    keyButtons: [
      { nameAr: "إنشاء دورة", nameEn: "Create cycle", descriptionAr: "حفظ معايير الدورة ومسودتها.", descriptionEn: "Save the cycle criteria and draft.", actionType: "primary" },
      { nameAr: "إغلاق الدورة وإظهار النتائج", nameEn: "Close cycle and release results", descriptionAr: "يمنع الردود الجديدة ويثبت النتائج نهائيًا.", descriptionEn: "Stops new responses and freezes the report permanently.", actionType: "action" }
    ],
    proTips: [{ titleAr: "معايير قابلة للملاحظة", titleEn: "Observable criteria",
      descriptionAr: "عدّل المعايير للدور الوظيفي. غياب فئة يجعل النتيجة جزئية؛ الأداة للتطوير وليست قرار ترقية آليًا.",
      descriptionEn: "Adapt criteria to the role. Missing groups make results partial; use the tool for development, not automatic promotion decisions." }],
    faqs: [{ qAr: "كيف تُحمى سرية الزملاء؟", qEn: "How are peer ratings protected?",
      aAr: "لا تظهر الإجابات الفردية. يلزم ثلاثة ردود صالحة لكل معيار في الفئة لعرض متوسطها. المسؤول يعرف قائمة المشاركين. هذه الحماية تخص الدورات المستقلة، وليس السجل اليدوي القديم.",
      aEn: "Individual answers are not shown. Each confidential group needs three valid responses per criterion to reveal its mean. Administrators know the roster. This protection applies to independent cycles, not the old manual log." }],
    quickLinks: [
      { labelAr: "السجل اليدوي السابق", labelEn: "Previous manual log", path: "/evaluation/manual" },
      { labelAr: "لوحة المهام", labelEn: "Task Board", path: "/tasks" },
      { labelAr: "التقارير التحليلية", labelEn: "Reports", path: "/reports" },
      { labelAr: "إدارة الفريق", labelEn: "Team", path: "/team" }
    ]
  },
  {
    id: "ai-assistant",
    matchPaths: ["/ai-assistant"],
    titleAr: "مساعد الذكاء الاصطناعي التوليدي والأتمتة",
    titleEn: "Recruitment AI Assistant & Copilot",
    badgeAr: "ذكاء اصطناعي",
    badgeEn: "AI",
    category: "ai",
    icon: Bot,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    summaryAr: "شات بوت ذكي مخصص للتوظيف: تحليل السير الذاتية، صياغة أسئلة المقابلات، مقارنة كفاءات المرشحين، وتقديم استشارات لنظام العمل وقوى.",
    summaryEn: "Specialized AI copilot for resume evaluation, interview question generation, candidate scoring, and HR advisory.",
    targetAudienceAr: "مسؤولو التوظيف، مدراء الموارد البشرية، المقابلون",
    targetAudienceEn: "Recruiters, HR Directors, Interviewers",
    workflowStages: [
      { stepNumber: 1, labelAr: "اختيار الاستفسار", labelEn: "Select Query" },
      { stepNumber: 2, labelAr: "تحليل الـ AI", labelEn: "AI Analysis" },
      { stepNumber: 3, labelAr: "مقارنة الكفاءات", labelEn: "Competency Matrix" },
      { stepNumber: 4, labelAr: "تطبيق المخرجات", labelEn: "Apply to Hiring" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "اختيار أمر سريع أو كتابة استفسار مخصص",
        titleEn: "Choose Quick Prompt or Type Query",
        actionAr: "انقر على أحد الأزرار السريعة (مثل: 'اقترح أسئلة مقابلة لمعلم رياضيات', 'قارن بين المرشحين', 'حلل سيرة ذاتية') أو اكتب سؤالك في خانة الدردشة.",
        actionEn: "Click ready prompt chips or type your specialized recruitment question.",
        expectedOutcomeAr: "بدء الذكاء الاصطناعي في تحليل الطلب وصياغة إجابة تخصصية فورية.",
        expectedOutcomeEn: "Instant expert recruitment answer formulated in seconds.",
              actionTrigger: {
          labelAr: "بدء محادثة ذكية جديدة ⚡",
          labelEn: "Start AI Chat ⚡",
          actionType: "navigate",
          target: "/ai-assistant",
        },
      },
      {
        stepNumber: 2,
        titleAr: "طلب فحص أو مقارنة مرشحين محددين",
        titleEn: "Request Deep Candidate Comparison",
        actionAr: "اطلب من المساعد: 'قارن بين مرشحي وظيفة مطور React وأخبرني بمن هو الأفضل ولمذا'، وسيقوم بقراءة بياناتهم ومقارنتها.",
        actionEn: "Ask AI to compare applicants for a specific vacancy and provide rankings.",
        expectedOutcomeAr: "جدول مقارنة دقيق يوضح نقاط القوة والضعف ومبرر التوصية.",
        expectedOutcomeEn: "Detailed comparative matrix highlighting pros and cons."
      },
      {
        stepNumber: 3,
        titleAr: "نسخ المخرجات واستخدامها في التوظيف",
        titleEn: "Copy and Apply AI Outputs",
        actionAr: "اضغط زر 'نسخ' على إجابة الـ AI لنقل الأسئلة أو الوصف الوظيفي فوراً إلى شاشة الوظائف أو نموذج المقابلات.",
        actionEn: "Click 'Copy' to paste generated questions or descriptions into jobs or interviews.",
        expectedOutcomeAr: "توفير ساعات من الكتابة والبحث اليدوي.",
        expectedOutcomeEn: "Massive time savings on manual HR drafting."
      }
    ],
    keyButtons: [
      {
        nameAr: "أوامر سريعة (Prompt Chips)",
        nameEn: "Quick Prompt Chips",
        descriptionAr: "أزرار لاقتراح أهم العمليات الأكثر طلباً دون الحاجة لكتابتها يدوياً.",
        descriptionEn: "One-click prompts for most common recruitment queries.",
        actionType: "action"
      },
      {
        nameAr: "محادثة جديدة (+)",
        nameEn: "New Chat (+)",
        descriptionAr: "بدء جلسة استفسار جديدة ومسح المحادثة السابقة.",
        descriptionEn: "Starts a fresh conversational thread.",
        actionType: "primary"
      }
    ],
    proTips: [
      {
        titleAr: "كن محدداً في صياغة الشروط",
        titleEn: "Be Specific in Prompts",
        descriptionAr: "عند طلب أسئلة مقابلة، اذكر نوع المرحلة (مثلاً: 'أسئلة درس تجريبي لمرحلة ابتدائية') للحصول على نتائج مطابقة بنسبة 100%.",
        descriptionEn: "Include grade level and subject to get highly tailored teaching rubrics."
      }
    ],
    faqs: [
      {
        qAr: "هل يحفظ المساعد سرية بيانات المرشحين؟",
        qEn: "Is candidate data safe and private?",
        aAr: "نعم، كافة البيانات معالجة ومشفرة داخل بيئة النظام الآمنة ولا تتم مشاركتها خارج المنصة.",
        aEn: "Yes, all data is securely processed and encrypted within the system."
      }
    ],
    quickLinks: [
      { labelAr: "بنك الأسئلة والاختبارات", labelEn: "Question Bank", path: "/question-bank" },
      { labelAr: "مكتبة النظام", labelEn: "System Library", path: "/library" },
      { labelAr: "المرشحون", labelEn: "Candidates", path: "/candidates" }
    ]
  },
  {
    id: "question-bank",
    matchPaths: ["/question-bank"],
    titleAr: "بنك الأسئلة والاختبارات ومكافحة الغش",
    titleEn: "Question Bank & Anti-Cheat Assessments",
    badgeAr: "اختبارات",
    badgeEn: "Assessments",
    category: "ai",
    icon: HelpCircle,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    summaryAr: "إنشاء بنوك أسئلة مهنية واختبارات كفاءة للمعلمين والموظفين، مع نظام مراقبة ذكي (Proctoring) لكشف تبديل النوافذ ومؤشر النزاهة.",
    summaryEn: "Build specialized question banks, conduct proctored assessments, and calculate integrity scores.",
    targetAudienceAr: "لجان الاختبارات، الموجهون التربويون، مسؤولو التوظيف",
    targetAudienceEn: "Assessment Teams, Educational Supervisors, Recruiters",
    workflowStages: [
      { stepNumber: 1, labelAr: "إنشاء البنك", labelEn: "Question Bank" },
      { stepNumber: 2, labelAr: "توليد بالـ AI", labelEn: "MCQ & AI Questions" },
      { stepNumber: 3, labelAr: "إرسال الاختبار", labelEn: "Dispatch Exam" },
      { stepNumber: 4, labelAr: "النزاهة والدرجات", labelEn: "Integrity Scoring" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "إنشاء بنك أسئلة أو اختبار جديد",
        titleEn: "Create Question Bank or Exam",
        actionAr: "اضغط على 'بنك أسئلة جديد'، حدد المادة أو التخصص ومستوى الصعوبة.",
        actionEn: "Click 'New Question Bank', set subject, domain, and difficulty.",
        expectedOutcomeAr: "إنشاء مستودع أسئلة منظم للوظيفة المستهدفة.",
        expectedOutcomeEn: "Instantiates categorized assessment repository.",
              actionTrigger: {
          labelAr: "إنشاء بنك أسئلة جديد ⚡",
          labelEn: "Create Question Bank ⚡",
          actionType: "navigate",
          target: "/question-bank?action=create",
        },
      },
      {
        stepNumber: 2,
        titleAr: "إضافة الأسئلة أو توليدها بالذكاء الاصطناعي",
        titleEn: "Add Questions or Auto-Generate with AI",
        actionAr: "أضف أسئلة اختيار من متعدد مع تحديد الإجابة الصحيحة، أو اضغط زر 'توليد أسئلة بالـ AI' وسيقوم النظام بإنشائها فوراً.",
        actionEn: "Add MCQ questions with answer keys, or click 'Generate with AI'.",
        expectedOutcomeAr: "بناء اختبار متكامل من 10 إلى 30 سؤالاً في دقيقة واحدة.",
        expectedOutcomeEn: "Complete exam ready in under 60 seconds."
      },
      {
        stepNumber: 3,
        titleAr: "إرسال رابط الاختبار للمرشحين",
        titleEn: "Send Exam Link to Candidates",
        actionAr: "أرسل رابط الاختبار للمرشح؛ سيقوم النظام بضبط وقت محدد (مثلاً 20 دقيقة) ومراقبة محاولات تبديل النوافذ (Tab Switch).",
        actionEn: "Dispatch exam link with time limit and active anti-cheat monitoring.",
        expectedOutcomeAr: "اختبار مقنن وموثوق يقيس الكفاءة الحقيقية.",
        expectedOutcomeEn: "Fair and tamper-resistant candidate assessment."
      },
      {
        stepNumber: 4,
        titleAr: "مراجعة النتائج ومؤشر النزاهة (Integrity Score)",
        titleEn: "Inspect Results & Integrity Score",
        actionAr: "استعرض درجات المرشحين ومؤشر النزاهة (مثلاً 98% نزاهة)، مع توثيق أي مخالفات تمت أثناء الحل.",
        actionEn: "Review candidate test scores and integrity metrics on applicant profile.",
        expectedOutcomeAr: "ربط الدرجة تلقائياً بمسار التوظيف والفرز.",
        expectedOutcomeEn: "Scores automatically sync to recruitment scorecard."
      }
    ],
    keyButtons: [
      {
        nameAr: "إنشاء بنك أسئلة (+)",
        nameEn: "New Question Bank (+)",
        descriptionAr: "إنشاء مجلد أسئلة جديد لتخصص محدد.",
        descriptionEn: "Creates new domain question bank.",
        actionType: "primary"
      },
      {
        nameAr: "توليد أسئلة بالذكاء الاصطناعي",
        nameEn: "Generate with AI",
        descriptionAr: "توليد 10 أسئلة تخصصية فورية مع الإجابات النموذجية.",
        descriptionEn: "Generates 10 specialized MCQs with answer keys via AI.",
        actionType: "action"
      }
    ],
    proTips: [
      {
        titleAr: "تفعيل الترتيب العشوائي للأسئلة والخيارات",
        titleEn: "Randomize Question Order",
        descriptionAr: "تفعيل خيار الترتيب العشوائي يضمن عدم تشابه ترتيب الأسئلة بين المرشحين لمنع تناقل الإجابات.",
        descriptionEn: "Random order prevents candidates from sharing answer keys."
      }
    ],
    faqs: [
      {
        qAr: "ماذا يحدث إذا أغلق المرشح المتصفح أثناء الاختبار؟",
        qEn: "What happens if applicant closes browser?",
        aAr: "يتم حفظ الإجابات المنجزة وتوثيق الخروج في سجل النزاهة (Integrity Log).",
        aEn: "Answer state is saved and exit event is logged in integrity report."
      }
    ],
    quickLinks: [
      { labelAr: "شاشة المرشحين", labelEn: "Candidates", path: "/candidates" },
      { labelAr: "مساعد الذكاء الاصطناعي", labelEn: "AI Assistant", path: "/ai-assistant" },
      { labelAr: "مسار التوظيف", labelEn: "Pipeline", path: "/pipeline" }
    ]
  },
  {
    id: "resume-archive",
    matchPaths: ["/resume-archive", "/talent-pool"],
    titleAr: "أرشيف السير الذاتية وقاعدة المواهب",
    titleEn: "Resume Archive & Talent Pool",
    badgeAr: "أرشيف ذكي",
    badgeEn: "Talent Pool",
    category: "ai",
    icon: Archive,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    summaryAr: "المستودع الذكي المفهرس لكافة السير الذاتية السابقة، والبحث الدلالي بالمهارات ورخص المعلمين لإعادة استقطاب الكفاءات بنقرة واحدة.",
    summaryEn: "Indexed resume archive with semantic skill search to re-engage past applicants instantly.",
    targetAudienceAr: "مسؤولو التوظيف، باحثو المواهب (Sourcers)",
    targetAudienceEn: "Talent Sourcers, Senior Recruiters",
    workflowStages: [
      { stepNumber: 1, labelAr: "البحث بالمهارات", labelEn: "Semantic Search" },
      { stepNumber: 2, labelAr: "معاينة السيرة", labelEn: "Inspect Track Record" },
      { stepNumber: 3, labelAr: "ترشيح لشواغر", labelEn: "Re-enroll in Job" },
      { stepNumber: 4, labelAr: "المتابعة في المسار", labelEn: "Track in Pipeline" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "البحث الذكي بالمهارة أو المسمى أو المدينة",
        titleEn: "Semantic Search by Skill or Title",
        actionAr: "اكتب في شريط البحث أي كلمة مفتاحية (مثلاً: 'معلم لغة إنجليزية', 'رخصة مهنية خبير', 'جدة').",
        actionEn: "Search across archive using keywords, skills, or licenses.",
        expectedOutcomeAr: "ظهور جميع المرشحين المطابقين من كافة الوظائف السابقة في ثوانٍ.",
        expectedOutcomeEn: "Returns all matching candidates across past requisition history.",
              actionTrigger: {
          labelAr: "ترشيح موهبة لشواغر حالية ⚡",
          labelEn: "Assign to Active Job ⚡",
          actionType: "navigate",
          target: "/pipeline",
        },
      },
      {
        stepNumber: 2,
        titleAr: "معاينة الملف والسيرة الذاتية السابقة",
        titleEn: "Preview Profile & Past CV",
        actionAr: "اضغط على بطاقة المرشح لاستعراض تقييماته السابقة وملاحظات لجان المقابلات وسيرته المحفوظة.",
        actionEn: "Click candidate to review historical evaluations and stored resume.",
        expectedOutcomeAr: "معرفة سجل المرشح كاملاً دون الحاجة للبدء من الصفر.",
        expectedOutcomeEn: "Instant access to historical feedback and candidate track record."
      },
      {
        stepNumber: 3,
        titleAr: "إعادة ترشيح الموهبة لوظيفة جديدة بنقرة واحدة",
        titleEn: "Assign to New Job Requisition in 1 Click",
        actionAr: "اضغط زر 'ترشيح لوظيفة جديدة' واختر الشاغر المفتوح حالياً.",
        actionEn: "Click 'Enroll in Job' and pick an open active job requisition.",
        expectedOutcomeAr: "إدراج المرشح فوراً في مسار الوظيفة الجديدة وإشعاره دون تكلفة إعلانات جديدة.",
        expectedOutcomeEn: "Immediate enrollment in new pipeline at zero additional sourcing cost."
      }
    ],
    keyButtons: [
      {
        nameAr: "ترشيح لشواغر حالية",
        nameEn: "Assign to Open Job",
        descriptionAr: "نقل المرشح من الأرشيف إلى مسار توظيف نشط.",
        descriptionEn: "Transitions archived candidate into an active pipeline.",
        actionType: "primary"
      },
      {
        nameAr: "رفع سير ذاتية دفعة واحدة",
        nameEn: "Bulk Resume Upload",
        descriptionAr: "رفع ملفات PDF متعددة ليقوم الذكاء الاصطناعي بفهرستها وأرشفتها.",
        descriptionEn: "Batch upload multiple resumes for AI indexing.",
        actionType: "action"
      }
    ],
    proTips: [
      {
        titleAr: "استغل قاعدة المواهب لتقليص وقت التوظيف 70%",
        titleEn: "Cut Time-to-Hire by 70%",
        descriptionAr: "قبل نشر أي وظيفة جديدة، ابحث في الأرشيف أولاً؛ غالباً ستجد مرشحين مؤهلين تمت مقابلتهم سابقاً وجاهزين للتعيين فوراً.",
        descriptionEn: "Always search the talent pool before advertising externally."
      }
    ],
    faqs: [
      {
        qAr: "هل يتم حذف السير القديمة تلقائياً؟",
        qEn: "Are old resumes deleted automatically?",
        aAr: "لا، يتم حفظ السير بشكل آمن ومشفر ودائم لتكون رصيداً مستمراً لمنشأتك.",
        aEn: "No, resumes remain permanently archived and encrypted for future re-engagement."
      }
    ],
    quickLinks: [
      { labelAr: "شاشة المرشحين", labelEn: "Candidates", path: "/candidates" },
      { labelAr: "الوظائف والشواغر", labelEn: "Jobs", path: "/jobs" },
      { labelAr: "مسار التوظيف", labelEn: "Pipeline", path: "/pipeline" }
    ]
  },
  {
    id: "reports",
    matchPaths: ["/reports"],
    titleAr: "التقارير التحليلية ومؤشرات الأداء KPIs",
    titleEn: "Recruitment Reports & Analytics",
    badgeAr: "تقارير",
    badgeEn: "Analytics",
    category: "admin",
    icon: BarChart3,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    summaryAr: "لوحة تحليلات تفاعلية لمعدلات التوظيف، قمع المراحل (Funnel)، متوسط وقت التعيين (Time-to-hire)، وتصدير التقارير بصيغة PDF و Excel.",
    summaryEn: "Interactive dashboards for hiring velocity, pipeline funnels, source attribution, and exportable reports.",
    targetAudienceAr: "الإدارة العليا، مدراء الموارد البشرية، مدراء التوظيف",
    targetAudienceEn: "Executives, HR Leaders, Recruitment Heads",
    workflowStages: [
      { stepNumber: 1, labelAr: "النطاق الزمني", labelEn: "Time Range" },
      { stepNumber: 2, labelAr: "قمع التحويل", labelEn: "Conversion Funnel" },
      { stepNumber: 3, labelAr: "سرعة التوظيف", labelEn: "Time-to-Hire" },
      { stepNumber: 4, labelAr: "تصدير التقارير", labelEn: "Export PDF/Excel" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "تحديد النطاق الزمني والفلاتر",
        titleEn: "Select Date Range & Filters",
        actionAr: "حدد الفترة الزمنية (آخر 30 يوماً / الربع الحالي / مخصص) واختر وظيفة أو فرعاً معيناً.",
        actionEn: "Set date filter (Last 30 Days, Q1, Year) and scope by branch or department.",
        expectedOutcomeAr: "تحديث جميع الرسوم البيانية والأرقام لتطابق النطاق المختار.",
        expectedOutcomeEn: "Charts instantly reflect targeted time period and scope.",
              actionTrigger: {
          labelAr: "استعراض لوحة التقارير ⚡",
          labelEn: "View Analytics ⚡",
          actionType: "navigate",
          target: "/reports",
        },
      },
      {
        stepNumber: 2,
        titleAr: "تحليل قمع المراحل (Conversion Funnel)",
        titleEn: "Analyze Stage Conversion Funnel",
        actionAr: "راقب نسبة انتقال المتقدمين من مرحلة التقديم إلى المقابلة ثم العرض ثم التعيين لمعرفة أي مراحل التوظيف تشهد عنق زجاجة أو تأخيراً.",
        actionEn: "Inspect funnel drop-off rates from application to acceptance.",
        expectedOutcomeAr: "اكتشاف معوقات التوظيف وتحسين سرعة استقطاب الكفاءات.",
        expectedOutcomeEn: "Pinpoints bottlenecks and optimizes hiring velocity."
      },
      {
        stepNumber: 3,
        titleAr: "تصدير التقرير الرسمي PDF / Excel",
        titleEn: "Export Official Report",
        actionAr: "اضغط زر 'تصدير التقرير' لتحميل تقرير تنفيذي رسمي جاهز للتقديم لمجلس الإدارة.",
        actionEn: "Click 'Export Report' to download executive PDF or raw Excel data.",
        expectedOutcomeAr: "حفظ ملف رسمي موثق بشعار المنشأة.",
        expectedOutcomeEn: "Generates branded executive report ready for board presentations."
      }
    ],
    keyButtons: [
      {
        nameAr: "تصدير تقرير PDF",
        nameEn: "Export PDF",
        descriptionAr: "توليد ملف تقرير مصمم وجاهز للعرض والطباعة.",
        descriptionEn: "Exports styled executive presentation PDF.",
        actionType: "primary"
      },
      {
        nameAr: "تصدير بيانات Excel",
        nameEn: "Export Excel",
        descriptionAr: "تنزيل البيانات الرقمية الخام للتحليل في الجداول الحسابية.",
        descriptionEn: "Downloads raw tabular data for custom spreadsheet modeling.",
        actionType: "action"
      }
    ],
    proTips: [
      {
        titleAr: "راقب مؤشر متوسط وقت التعيين (Time-to-Hire)",
        titleEn: "Track Time-to-Hire Closely",
        descriptionAr: "المعدل المثالي لإغلاق الشاغر في المنشآت المتميزة يتراوح بين 14 إلى 21 يوماً؛ إذا زاد عن ذلك استخدم الفلاتر لمعرفة السبب.",
        descriptionEn: "Benchmark hiring time: high-performing teams average 14-21 days."
      }
    ],
    faqs: [
      {
        qAr: "هل تتحدث التقارير لحظياً؟",
        qEn: "Are reports calculated in real time?",
        aAr: "نعم، كافة الرسوم ومؤشرات الأداء تحتسب مباشرة من أحدث بيانات قاعدة البيانات.",
        aEn: "Yes, metrics derive directly and dynamically from live operational data."
      }
    ],
    quickLinks: [
      { labelAr: "خطة التوظيف", labelEn: "Hiring Plan", path: "/hiring-plan" },
      { labelAr: "لوحة التحكم", labelEn: "Dashboard", path: "/dashboard" },
      { labelAr: "مسار التوظيف", labelEn: "Pipeline", path: "/pipeline" }
    ]
  },
  {
    id: "hiring-plan",
    matchPaths: ["/hiring-plan"],
    titleAr: "خطة التوظيف الاستراتيجية وتتبع الأهداف",
    titleEn: "Strategic Hiring Plan & Quotas",
    badgeAr: "تخطيط استراتيجي",
    badgeEn: "Planning",
    category: "admin",
    icon: Award,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    summaryAr: "تحديد مستهدفات التوظيف الربع سنوية والسنوية، رصد الميزانيات المعتمدة، ومقارنة التعيينات الفعلية بالخطة المعتمدة لكل قسم.",
    summaryEn: "Establish hiring quotas, track department budgets, and monitor target headcount achievement.",
    targetAudienceAr: "الإدارة العليا، مدراء الموارد البشرية، الإدارة المالية",
    targetAudienceEn: "C-Level, HR Heads, Finance Directors",
    workflowStages: [
      { stepNumber: 1, labelAr: "مستهدفات القسم", labelEn: "Department Quotas" },
      { stepNumber: 2, labelAr: "الميزانيات المعتمدة", labelEn: "Budget Allocation" },
      { stepNumber: 3, labelAr: "التتبع التلقائي", labelEn: "Automated Tracking" },
      { stepNumber: 4, labelAr: "قياس الإنجاز", labelEn: "Variance & Results" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "إضافة مستهدف توظيف جديد لقسم",
        titleEn: "Add Department Hiring Quota",
        actionAr: "اضغط على 'إضافة مستهدف'، حدد القسم، عدد الشواغر المطلوبة، والميزانية المعتمدة وتاريخ الإغلاق المطلوب.",
        actionEn: "Click 'Add Quota', select department, headcount goal, budget, and target completion date.",
        expectedOutcomeAr: "إدراج الهدف في جدول متابعة الخطة السنوية.",
        expectedOutcomeEn: "Logs objective into annual strategic hiring roadmap."
      },
      {
        stepNumber: 2,
        titleAr: "متابعة نسبة إنجاز الشواغر التلقائية",
        titleEn: "Track Automated Quota Fulfillment",
        actionAr: "عند قبول أي عرض وظيفي في شاشة العروض، يقوم النظام تلقائياً برفع نسبة إنجاز الخطة المقابلة بدون تدخل يدوي.",
        actionEn: "Accepting job offers automatically increments fulfillment progress bars.",
        expectedOutcomeAr: "متابعة دقيقة ومحدثة بدون أي تكرار للجهد.",
        expectedOutcomeEn: "Seamless sync between day-to-day hiring and executive targets."
      }
    ],
    keyButtons: [
      {
        nameAr: "إضافة مستهدف جديد (+)",
        nameEn: "New Quota (+)",
        descriptionAr: "تحديد عدد شواغر وميزانية لقسم معين.",
        descriptionEn: "Sets headcount target and budget for a specific department.",
        actionType: "primary"
      }
    ],
    proTips: [
      {
        titleAr: "توزيع الأهداف على الفصول الأربعة",
        titleEn: "Quarterly Target Phasing",
        descriptionAr: "قسم الاحتياجات الكبرى إلى أرباع (Q1, Q2, Q3, Q4) لتجنب الضغط على لجان التوظيف وضمان جودة الاختيار.",
        descriptionEn: "Phase requisitions across quarters to avoid recruitment team burnout."
      }
    ],
    faqs: [
      {
        qAr: "هل يمكن تعديل الميزانية أثناء العام؟",
        qEn: "Can allocated budget be adjusted mid-year?",
        aAr: "نعم، يستطيع المدير المالي أو مدير HR تعديل الميزانيات وتوثيق سبب التعديل.",
        aEn: "Yes, authorized managers can update allocations with recorded audit notes."
      }
    ],
    quickLinks: [
      { labelAr: "التقارير التحليلية", labelEn: "Reports", path: "/reports" },
      { labelAr: "شاشة الوظائف", labelEn: "Jobs", path: "/jobs" },
      { labelAr: "العروض الوظيفية", labelEn: "Offers", path: "/offers" }
    ]
  },
  {
    id: "converted-orders",
    matchPaths: ["/converted-orders"],
    titleAr: "الطلبات المحولة ومكاتب التوظيف والوساطة",
    titleEn: "Converted Orders & Agency Management",
    badgeAr: "مكاتب ووساطة",
    badgeEn: "Agencies",
    category: "admin",
    icon: FileCheck2,
    color: "text-indigo-600",
    bg: "bg-indigo-600/10",
    border: "border-indigo-600/20",
    summaryAr: "إدارة طلبات التوظيف المحولة من مكاتب الاستقدام والتوظيف الخارجية، ومتابعة عمولات المكاتب وحالات مباشرة الموظفين.",
    summaryEn: "Manage external agency referrals, staffing partner portals, commission tracking, and candidate placement.",
    targetAudienceAr: "مسؤولو التوظيف، مشرفو التعاقدات الخارجية، الإدارة المالية",
    targetAudienceEn: "Agency Coordinators, Talent Acquisition, Finance",
    workflowStages: [
      { stepNumber: 1, labelAr: "استلام الطلبات", labelEn: "Agency Orders" },
      { stepNumber: 2, labelAr: "مراجعة المرشح", labelEn: "Screen Candidate" },
      { stepNumber: 3, labelAr: "توثيق المباشرة", labelEn: "Placement Confirmed" },
      { stepNumber: 4, labelAr: "صرف العمولة", labelEn: "Commission Payout" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "مراجعة الطلبات القادمة من المكاتب المعتمدة",
        titleEn: "Review Inbound Agency Orders",
        actionAr: "استعرض جدول الطلبات المحولة للتعرف على المكاتب المرسلة والمرشحين المقترحين والوظائف المرتبطة بها.",
        actionEn: "Browse converted requisitions to review partner agency candidate submissions.",
        expectedOutcomeAr: "حصر ومراجعة مرشحي المكاتب الخارجية في واجهة مركزية واحدة.",
        expectedOutcomeEn: "Centralized oversight of all third-party staffing submissions.",
              actionTrigger: {
          labelAr: "إدارة مكاتب التوظيف ⚡",
          labelEn: "Manage Agencies ⚡",
          actionType: "navigate",
          target: "/company/agencies",
        },
      },
      {
        stepNumber: 2,
        titleAr: "اعتماد المرشح أو تحويله لمسار التوظيف الداخلي",
        titleEn: "Qualify Candidate or Push to Pipeline",
        actionAr: "افحص بيانات وسيرة المرشح واضغط 'قبول وإدراج في المسار' ليتم تقييمه بواسطة لجان المنشأة.",
        actionEn: "Accept submission to enroll candidate into standard interview pipeline.",
        expectedOutcomeAr: "بدء إجراءات المقابلة والتقييم بسلاسة.",
        expectedOutcomeEn: "Seamless transition into standard hiring workflow."
      },
      {
        stepNumber: 3,
        titleAr: "توثيق المباشرة وحساب عمولة المكتب",
        titleEn: "Record Placement & Commission",
        actionAr: "عند مباشرة الموظف العمل، اضغط 'توثيق المباشرة' لإصدار استحقاق عمولة المكتب الشريك في سجلات النظام.",
        actionEn: "Confirm candidate start date to record agreed agency commission payout.",
        expectedOutcomeAr: "توثيق مالي دقيق يمنع أي خلافات مع مكاتب الوساطة.",
        expectedOutcomeEn: "Clean, indisputable financial settlement with staffing partners."
      }
    ],
    keyButtons: [
      {
        nameAr: "إضافة طلب محول (+)",
        nameEn: "Add Converted Order (+)",
        descriptionAr: "تسجيل طلب قادم يدوياً من مكتب توظيف.",
        descriptionEn: "Logs an inbound placement order from an agency.",
        actionType: "primary"
      },
      {
        nameAr: "بوابة المكاتب الشريكة",
        nameEn: "Agency Portal",
        descriptionAr: "إدارة تراخيص مكاتب التوظيف والاتفاقيات ونسب العمولات.",
        descriptionEn: "Manage agency partner contracts and commission tiers.",
        actionType: "action"
      }
    ],
    proTips: [
      {
        titleAr: "منح المكاتب وصولاً مقيداً لرفع المرشحين",
        titleEn: "Empower Agencies with Self-Service Access",
        descriptionAr: "يمكنك دعوة مكاتب التوظيف لبوابة مخصصة تتيح لهم رفع السير الذاتية ومتابعة حالة مرشحيهم دون الاطلاع على بيانات منشأتك السرية.",
        descriptionEn: "Grant agencies partner portal access to submit CVs without exposing internal data."
      }
    ],
    faqs: [
      {
        qAr: "كيف يتم منع تكرار المرشحين من أكثر من مكتب؟",
        qEn: "How does the system prevent duplicate submissions?",
        aAr: "يكشف النظام آلياً تطابق رقم الهوية/الإقامة أو البريد الإلكتروني ويمنع تسجيل المرشح مرتين، وينسب الأسبقية للمكتب الأول.",
        aEn: "System auto-detects matching National ID/Email and credits the first submitter."
      }
    ],
    quickLinks: [
      { labelAr: "مكاتب التوظيف والشركاء", labelEn: "Agencies", path: "/company/agencies" },
      { labelAr: "العروض الوظيفية", labelEn: "Offers", path: "/offers" },
      { labelAr: "مسار التوظيف", labelEn: "Pipeline", path: "/pipeline" }
    ]
  },
  {
    id: "team",
    matchPaths: ["/team"],
    titleAr: "إدارة فريق العمل والأدوار والصلاحيات",
    titleEn: "Team Management & Access Roles",
    badgeAr: "إدارة وصلاحيات",
    badgeEn: "Team",
    category: "admin",
    icon: UserCog,
    color: "text-purple-600",
    bg: "bg-purple-600/10",
    border: "border-purple-600/20",
    summaryAr: "دعوة أعضاء فريق التوظيف والمقابلات، تعيين الأدوار (مسؤول، مجند، مقيّم)، وضبط مصفوفة الصلاحيات لكل شاشة.",
    summaryEn: "Invite team members, assign RBAC roles (Admin, Recruiter, Reviewer), and configure screen permissions.",
    targetAudienceAr: "مسؤولو النظام، مدراء الموارد البشرية",
    targetAudienceEn: "Super Admins, HR System Administrators",
    workflowStages: [
      { stepNumber: 1, labelAr: "دعوة بالبريد", labelEn: "Send Invitation" },
      { stepNumber: 2, labelAr: "تحديد الدور", labelEn: "Assign RBAC Role" },
      { stepNumber: 3, labelAr: "مصفوفة الصلاحيات", labelEn: "Screen Permissions" },
      { stepNumber: 4, labelAr: "متابعة الأنشطة", labelEn: "Monitor Activity" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "الضغط على 'دعوة عضو جديد'",
        titleEn: "Click 'Invite Team Member'",
        actionAr: "انقر زر 'دعوة عضو جديد' في أعلى الشاشة وأدخل البريد الإلكتروني والاسم والدور المقترح.",
        actionEn: "Click 'Invite Member', enter email, full name, and select role.",
        expectedOutcomeAr: "إرسال رابط دعوة آمن عبر البريد الإلكتروني.",
        expectedOutcomeEn: "Dispatches secure email onboarding invitation.",
              actionTrigger: {
          labelAr: "دعوة عضو جديد للفريق ⚡",
          labelEn: "Invite Team Member ⚡",
          actionType: "navigate",
          target: "/team?action=invite",
        },
      },
      {
        stepNumber: 2,
        titleAr: "اختيار الدور والصلاحيات بدقة",
        titleEn: "Select Role & Screen Permissions",
        actionAr: "حدد دور العضو: 'مدير نظام (Admin)' لكامل الصلاحيات، أو 'مسؤول توظيف (Recruiter)' للوظائف والمقابلات، أو 'مقيّم (Reviewer)' للمقابلات والتقييم فقط.",
        actionEn: "Choose role: Admin (full), Recruiter (hiring ops), or Reviewer (scorecards only).",
        expectedOutcomeAr: "تأمين بيانات المنشأة وحجب الشاشات الحساسة كالأجور والتقارير المالية عن غير المصرح لهم.",
        expectedOutcomeEn: "Enforces strict principle of least privilege across company screens."
      }
    ],
    keyButtons: [
      {
        nameAr: "دعوة عضو (+)",
        nameEn: "Invite Member (+)",
        descriptionAr: "إرسال دعوة انضمام للمنصة بالبريد.",
        descriptionEn: "Sends system invitation link to employee email.",
        actionType: "primary"
      },
      {
        nameAr: "مصفوفة الصلاحيات",
        nameEn: "Permissions Matrix",
        descriptionAr: "تخصيص صلاحيات القراءة والتعديل لكل شاشة بدقة.",
        descriptionEn: "Fine-grained per-screen read/write permission configuration.",
        actionType: "action"
      }
    ],
    proTips: [
      {
        titleAr: "استخدم دور 'المقيّم' لأعضاء لجان المقابلات",
        titleEn: "Use Reviewer Role for Interviewers",
        descriptionAr: "امنح مدراء الأقسام والمدرسين الأوائل دور 'Reviewer' لتمكينهم من تقييم المقابلات دون الاطلاع على رواتب المرشحين.",
        descriptionEn: "Reviewer role allows panel grading while masking candidate salary details."
      }
    ],
    faqs: [
      {
        qAr: "كيف ألغي وصول موظف غادر المنشأة؟",
        qEn: "How do I revoke access for departed staff?",
        aAr: "اضغط على زر النقاط الثلاث بجانب اسمه واختر 'تعطيل الحساب' أو 'حذف العضوية' فوراً.",
        aEn: "Click the 3-dots menu on member row and select 'Deactivate' or 'Revoke'."
      }
    ],
    quickLinks: [
      { labelAr: "سجل الأمان والعمليات", labelEn: "Audit Log", path: "/audit-log" },
      { labelAr: "إعدادات المنشأة", labelEn: "Settings", path: "/settings" }
    ]
  },
  {
    id: "audit-log",
    matchPaths: ["/audit-log"],
    titleAr: "سجل الأمان ومراقبة العمليات (Audit Trail)",
    titleEn: "Security Audit Trail & Compliance",
    badgeAr: "أمان وحوكمة",
    badgeEn: "Security",
    category: "admin",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    summaryAr: "سجل تدقيق كامل ومؤرخ بدقة لكافة العمليات الحساسة: إنشاء الوظائف، تعديل الرواتب، قبول العروض، الدخول والخروج، لضمان أعلى معايير الحوكمة والنزاهة.",
    summaryEn: "Comprehensive, tamper-proof log of sensitive operations (job changes, salary edits, offer acceptances, auth events).",
    targetAudienceAr: "مسؤولو الأمان السيبراني، مدراء الامتثال، الإدارة العليا",
    targetAudienceEn: "Security Officers, Compliance Leads, Super Admins",
    workflowStages: [
      { stepNumber: 1, labelAr: "التوثيق التلقائي", labelEn: "Immutable Logging" },
      { stepNumber: 2, labelAr: "تصفية الأحداث", labelEn: "Filter Events" },
      { stepNumber: 3, labelAr: "فحص التغيير", labelEn: "Diff & IP Check" },
      { stepNumber: 4, labelAr: "تصدير الامتثال", labelEn: "Export Compliance" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "تصفية السجل حسب المستخدم أو نوع الحركة",
        titleEn: "Filter Logs by User or Action Type",
        actionAr: "استخدم محرك التصفية للبحث عن حركة معينة (مثلاً: تعديل عرض وظيفي، حذف مرشح، أو محاولات تسجيل الدخول).",
        actionEn: "Filter logs by operator, entity type (Jobs, Offers, Auth), or specific action.",
        expectedOutcomeAr: "حصر السجلات المرتبطة بالحدث بدقة ثانية الحدوث.",
        expectedOutcomeEn: "Pinpoints exact audit record with microsecond timestamp."
      },
      {
        stepNumber: 2,
        titleAr: "فحص تفاصيل التغيير (Before / After)",
        titleEn: "Inspect Change Diff (Before / After)",
        actionAr: "اضغط على أي سجل لمشاهدة عنوان الآي بي (IP Address) وجهاز المستخدم والقيم قبل وبعد التعديل.",
        actionEn: "Click record to inspect IP, device metadata, and exact data diffs.",
        expectedOutcomeAr: "معرفة المتسبب في التغيير والتأكد من مطابقة الإجراء للسياسات.",
        expectedOutcomeEn: "Full accountability with zero ambiguity."
      }
    ],
    keyButtons: [
      {
        nameAr: "تصدير السجل للأمان والامتثال",
        nameEn: "Export Audit Log",
        descriptionAr: "تنزيل سجل العمليات بصيغة CSV لجهات التدقيق الداخلي والحكومي.",
        descriptionEn: "Exports full audit trail for internal & regulatory compliance.",
        actionType: "primary"
      }
    ],
    proTips: [
      {
        titleAr: "سجلات غير قابلة للتعديل أو الحذف",
        titleEn: "Immutable Records",
        descriptionAr: "كافة السجلات في هذه الشاشة محمية بقواعد أمان صارمة (RLS) ومستحيلة الحذف أو التعديل من أي مستخدم.",
        descriptionEn: "Logs are append-only and strictly protected from tampering by RLS policies."
      }
    ],
    faqs: [
      {
        qAr: "كم مدة الاحتفاظ بالسجلات؟",
        qEn: "How long are audit records retained?",
        aAr: "يتم حفظ السجلات بشكل دائم لتلبية متطلبات نظام حماية البيانات الشخصية والامتثال الحكومي في المملكة.",
        aEn: "Logs are archived permanently to satisfy Saudi Personal Data Protection regulations."
      }
    ],
    quickLinks: [
      { labelAr: "إدارة الفريق والصلاحيات", labelEn: "Team", path: "/team" },
      { labelAr: "إعدادات الحساب والمنشأة", labelEn: "Settings", path: "/settings" }
    ]
  },
  {
    id: "settings",
    matchPaths: ["/settings"],
    titleAr: "إعدادات المنشأة والحساب والتكاملات",
    titleEn: "Organization & Account Settings",
    badgeAr: "إعدادات",
    badgeEn: "Settings",
    category: "admin",
    icon: Settings,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    summaryAr: "تخصيص هوية المنشأة (الشعار، الألوان، خلفية الدخول)، ربط البريد الإلكتروني، إعدادات الأمان والتكامل مع الأنظمة الأخرى (Webhooks & API).",
    summaryEn: "Customize brand assets (logo, colors, login bg), email gateways, integrations (Webhooks, API), and security controls.",
    targetAudienceAr: "مسؤولو النظام، مسؤولو الموارد البشرية، مدراء تقنية المعلومات",
    targetAudienceEn: "System Administrators, IT Leads, HR Managers",
    workflowStages: [
      { stepNumber: 1, labelAr: "الهوية والشعار", labelEn: "Brand Assets" },
      { stepNumber: 2, labelAr: "البريد المؤسسي", labelEn: "Corporate SMTP" },
      { stepNumber: 3, labelAr: "الأمان 2FA", labelEn: "2FA & Security" },
      { stepNumber: 4, labelAr: "التكاملات و API", labelEn: "Webhooks & API" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "تخصيص الهوية البصرية والشعار",
        titleEn: "Upload Brand Logo & Assets",
        actionAr: "انتقل إلى تبويب 'الهوية والمنشأة'، وارفع شعار منشأتك وحدد الاسم واللون الأساسي ليظهر في كافة صفحات التقديم والعروض الوظيفية الرسمية.",
        actionEn: "Navigate to 'Branding' tab, upload logo and set primary theme color.",
        expectedOutcomeAr: "ظهور شعارك تلقائياً على كل العروض الوظيفية وخطابات العمل وبوابة التقديم.",
        expectedOutcomeEn: "Consistent enterprise branding across candidate portals and PDF offers.",
              actionTrigger: {
          labelAr: "تخصيص هوية المنشأة ⚡",
          labelEn: "Customize Branding ⚡",
          actionType: "navigate",
          target: "/settings",
        },
      },
      {
        stepNumber: 2,
        titleAr: "ضبط خادم البريد والإشعارات (SMTP)",
        titleEn: "Configure Email Delivery & Notifications",
        actionAr: "في تبويب 'البريد'، اربط بريد منشأتك الرسمي لترسل دعوات المقابلات والعروض الوظيفية من نطاق شركتك الرسمي مباشرة.",
        actionEn: "Set custom email sender to dispatch interview invites from your corporate domain.",
        expectedOutcomeAr: "وصول الرسائل لصندوق الوارد وضمان موثوقية عالية لدى المتقدمين.",
        expectedOutcomeEn: "High deliverability and professional candidate trust."
      }
    ],
    keyButtons: [
      {
        nameAr: "حفظ الإعدادات",
        nameEn: "Save Settings",
        descriptionAr: "حفظ وتطبيق التغييرات على مستوى المنشأة فوراً.",
        descriptionEn: "Saves and applies configuration changes immediately.",
        actionType: "primary"
      }
    ],
    proTips: [
      {
        titleAr: "تفعيل التحقق بخطوتين (2FA)",
        titleEn: "Enable 2FA Security",
        descriptionAr: "ينصح بتفعيل التحقق بخطوتين لجميع مسؤولي التوظيف لضمان أقصى حماية لبيانات المتقدمين وسجلات الرواتب.",
        descriptionEn: "Enable two-factor authentication to secure sensitive salary records."
      }
    ],
    faqs: [
      {
        qAr: "هل تتغير خلفية صفحة الدخول للجميع؟",
        qEn: "Does custom login background affect all users?",
        aAr: "نعم، رفع خلفية مخصصة في الإعدادات سيجعلها تظهر لجميع موظفي منشأتك عند الدخول للنظام.",
        aEn: "Yes, customized login backgrounds greet all company members upon sign-in."
      }
    ],
    quickLinks: [
      { labelAr: "إدارة الفريق", labelEn: "Team", path: "/team" },
      { labelAr: "مكتبة النظام", labelEn: "Library", path: "/library" },
      { labelAr: "سجل الأمان", labelEn: "Audit Log", path: "/audit-log" }
    ]
  },
  {
    id: "tutorial",
    matchPaths: ["/tutorial", "/guide", "/system-guide", "/help"],
    titleAr: "دليل النظام التفاعلي الشامل (16 قسماً)",
    titleEn: "Comprehensive 16-Module System Guide",
    badgeAr: "دليل شامل",
    badgeEn: "Guide",
    category: "admin",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    summaryAr: "الموسوعة التعليمية الشاملة لمنصة Tawzeef-X، تغطي كافة الميزات الـ 16 والخطوات العملية والفيديوهات ونماذج العمل والأسئلة الشائعة.",
    summaryEn: "Complete encyclopedia covering all 16 platform modules, workflows, tutorials, shortcuts, and FAQs.",
    targetAudienceAr: "كافة مستخدمي المنصة من موظفين ومسؤولين ومقيمين",
    targetAudienceEn: "All system users, recruiters, managers, and reviewers",
    workflowStages: [
      { stepNumber: 1, labelAr: "البحث في الدليل", labelEn: "Search Guide" },
      { stepNumber: 2, labelAr: "خطوات العمل", labelEn: "Actionable Steps" },
      { stepNumber: 3, labelAr: "التنفيذ المباشر", labelEn: "Hands-on Execution" },
      { stepNumber: 4, labelAr: "إتقان المنصة", labelEn: "Mastery" },
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "استخدام محرك البحث السريع بالدليل",
        titleEn: "Search Any Feature Instantly",
        actionAr: "اكتب في حقل البحث أي ميزة ترغب بمعرفتها (مثلاً: 'رخصة المعلم', 'عقد العمل', 'المقابلات الافتراضية').",
        actionEn: "Type any feature keyword in search box to filter relevant modules instantly.",
        expectedOutcomeAr: "ظهور القسم المعني مع خطوات الاستخدام التفصيلية فوراً.",
        expectedOutcomeEn: "Instant spotlight on the desired workflow instructions.",
              actionTrigger: {
          labelAr: "فتح الدليل الشامل 16 قسماً ⚡",
          labelEn: "Open 16-Module Tutorial ⚡",
          actionType: "navigate",
          target: "/tutorial",
        },
      },
      {
        stepNumber: 2,
        titleAr: "الضغط على 'انتقل إلى الشاشة'",
        titleEn: "Use Direct 'Open Screen' Action",
        actionAr: "بعد قراءة خطوات أي قسم، اضغط على زر 'انتقل إلى الشاشة' للانتقال فوراً والبدء في تنفيذ العمل عملياً.",
        actionEn: "Click 'Go to Screen' button to jump directly into the application and take action.",
        expectedOutcomeAr: "تنفيذ فوري دون حيرة أو بحث.",
        expectedOutcomeEn: "Immediate hands-on execution without guesswork."
      }
    ],
    keyButtons: [
      {
        nameAr: "انتقل إلى الشاشة",
        nameEn: "Go to Screen",
        descriptionAr: "زر انتقال مباشر للشاشة المشروحة في الدليل.",
        descriptionEn: "Direct navigation link to the corresponding screen.",
        actionType: "primary"
      }
    ],
    proTips: [
      {
        titleAr: "راجع قسم 'البدء السريع في 6 خطوات'",
        titleEn: "Start with 6-Step Quickstart",
        descriptionAr: "إذا كنت تستخدم المنصة لأول مرة، ابدأ بقسم 'البدء السريع في 6 خطوات' في أعلى صفحة الدليل لإتقان دورة التوظيف كاملة في 10 دقائق.",
        descriptionEn: "New to Tawzeef-X? Follow the 6-step quickstart in the guide to master the entire hiring loop in 10 minutes."
      }
    ],
    faqs: [
      {
        qAr: "هل يتحدث الدليل عند إضافة ميزات جديدة؟",
        qEn: "Is the guide updated with new releases?",
        aAr: "نعم، الدليل مبرمج ليعكس كافة ميزات وتحديثات المنصة بشكل دائم وموثق.",
        aEn: "Yes, the guide is permanently updated with every feature release."
      }
    ],
    quickLinks: [
      { labelAr: "لوحة التحكم", labelEn: "Dashboard", path: "/dashboard" },
      { labelAr: "مكتبة النظام", labelEn: "Library", path: "/library" },
      { labelAr: "الوظائف والشواغر", labelEn: "Jobs", path: "/jobs" }
    ]
  }
];

/**
 * Helper to match current route against registered screen guides.
 */
export function getGuideForPath(pathname: string): ScreenGuideItem {
  // Normalize pathname
  const cleanPath = pathname.toLowerCase();

  // Find exact or prefix match
  const found = SCREEN_GUIDES.find(g => 
    g.matchPaths.some(p => cleanPath === p || (p !== "/dashboard" && cleanPath.startsWith(p)))
  );

  // Default fallback to dashboard if not matched
  return found || SCREEN_GUIDES[0];
}
