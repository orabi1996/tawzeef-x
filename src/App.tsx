import CompanyRegistration from "@/pages/CompanyRegistration";
import MotionProvider from "@/components/motion/MotionProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { lazy, Suspense, useState } from "react";
import { PageSkeleton } from "@/components/Skeletons";
import { SessionManager } from "@/components/SessionManager";
import ErrorBoundary from "@/components/ErrorBoundary";

// Eagerly loaded (critical path)
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";

// Lazy loaded pages
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Candidates = lazy(() => import("./pages/Candidates"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const AIRecruitmentTools = lazy(() => import("./pages/AIRecruitmentTools"));
const Settings = lazy(() => import("./pages/Settings"));
const CandidateProfile = lazy(() => import("./pages/CandidateProfile"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const Reports = lazy(() => import("./pages/Reports"));
const Interviews = lazy(() => import("./pages/Interviews"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const ApplyJob = lazy(() => import("./pages/ApplyJob"));
const CandidatePortal = lazy(() => import("./pages/CandidatePortal"));
const BookInterview = lazy(() => import("./pages/BookInterview"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const CompanyAgencies = lazy(() => import("./pages/CompanyAgencies"));
const Offers = lazy(() => import("./pages/Offers"));
const ConvertedOrders = lazy(() => import("./pages/ConvertedOrders"));
const OrderOnboardingPortal = lazy(() => import("./pages/OrderOnboardingPortal"));
const OfferPortal = lazy(() => import("./pages/OfferPortal"));
const VideoRoom = lazy(() => import("./pages/VideoRoom"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Pricing = lazy(() => import("./pages/Pricing"));
const HiringPlan = lazy(() => import("./pages/HiringPlan"));
const JobSeekerDashboard = lazy(() => import("./pages/JobSeekerDashboard"));
const Careers = lazy(() => import("./pages/Careers"));
const Tutorial = lazy(() => import("./pages/Tutorial"));
const AuditLog = lazy(() => import("./pages/AuditLog"));
const TalentPool = lazy(() => import("./pages/TalentPool"));
const Install = lazy(() => import("./pages/Install"));
const QuestionBank = lazy(() => import("./pages/QuestionBank"));
const TakeAssessment = lazy(() => import("./pages/TakeAssessment"));
const WorkflowEditor = lazy(() => import("./pages/WorkflowEditor"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const About = lazy(() => import("./pages/About"));
const Features = lazy(() => import("./pages/Features"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogAdmin = lazy(() => import("./pages/BlogAdmin"));
const TypographyTest = lazy(() => import("./pages/TypographyTest"));
const ResumeArchive = lazy(() => import("./pages/ResumeArchive"));
const AdminCompanies = lazy(() => import("./pages/AdminCompanies"));
const AdminCompanyDetail = lazy(() => import("./pages/AdminCompanyDetail"));
const AdminAgencies = lazy(() => import("./pages/AdminAgencies"));
const CompanyPortal = lazy(() => import("./pages/CompanyPortal"));
const AgencyPortal = lazy(() => import("./pages/AgencyPortal"));
const ChecklistTracker = lazy(() => import("./pages/ChecklistTracker"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const QualityReport = lazy(() => import("./pages/QualityReport"));
const TaskBoard = lazy(() => import("./pages/TaskBoard"));
const Performance360 = lazy(() => import("./pages/Performance360"));
const PerformanceEvaluation = lazy(() => import("./pages/PerformanceEvaluation"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const SystemLibrary = lazy(() => import("./pages/SystemLibrary"));

function PageLoader() {
  return <PageSkeleton />;
}

function RouteTransitionLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}

function AnimatedRoutes() {
  return (
    <Routes>
      <Route element={<RouteTransitionLayout />}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/apply/:id" element={<ApplyJob />} />
        <Route path="/portal" element={<CandidatePortal />} />
        <Route path="/book/:candidateId" element={<BookInterview />} />
        <Route path="/offer/:token" element={<OfferPortal />} />
        <Route path="/onboard/:orderId" element={<OrderOnboardingPortal />} />
        <Route path="/install" element={<Install />} />
        <Route path="/meeting/:roomId" element={<VideoRoom />} />
        <Route path="/assessment/:token" element={<TakeAssessment />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {/* Dev-only route — not accessible in production */}
        {import.meta.env.DEV && <Route path="/typography" element={<TypographyTest />} />}
        <Route path="/invitation/:token" element={<AcceptInvitation />} />

        {/* Protected - any authenticated user */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/company-registration" element={<ProtectedRoute><CompanyRegistration /></ProtectedRoute>} />
        <Route path="/applicant-dashboard" element={<ProtectedRoute><JobSeekerDashboard /></ProtectedRoute>} />
        <Route path="/seeker-dashboard" element={<ProtectedRoute><JobSeekerDashboard /></ProtectedRoute>} />

        {/* Role-protected: admin + recruiter + reviewer */}
        <Route path="/dashboard" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Dashboard /></RoleProtectedRoute>} />
        <Route path="/jobs" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Jobs /></RoleProtectedRoute>} />
        <Route path="/jobs/:id" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><JobDetails /></RoleProtectedRoute>} />
        <Route path="/candidates" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Candidates /></RoleProtectedRoute>} />
        <Route path="/candidates/:id" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><CandidateProfile /></RoleProtectedRoute>} />
        <Route path="/ai-assistant" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><AIAssistant /></RoleProtectedRoute>} />
        <Route path="/ai-tools" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter"]}><AIRecruitmentTools /></RoleProtectedRoute>} />
        <Route path="/reports" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Reports /></RoleProtectedRoute>} />
        <Route path="/interviews" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Interviews /></RoleProtectedRoute>} />
        <Route path="/notifications" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Notifications /></RoleProtectedRoute>} />
        <Route path="/pipeline" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Pipeline /></RoleProtectedRoute>} />
        <Route path="/offers" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Offers /></RoleProtectedRoute>} />
        <Route path="/converted-orders" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><ConvertedOrders /></RoleProtectedRoute>} />
        <Route path="/hiring-plan" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter"]}><HiringPlan /></RoleProtectedRoute>} />
        <Route path="/settings" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Settings /></RoleProtectedRoute>} />
        <Route path="/tutorial" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Tutorial /></RoleProtectedRoute>} />
        <Route path="/guide" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Tutorial /></RoleProtectedRoute>} />
        <Route path="/system-guide" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Tutorial /></RoleProtectedRoute>} />
        <Route path="/help" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Tutorial /></RoleProtectedRoute>} />
        <Route path="/talent-pool" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><TalentPool /></RoleProtectedRoute>} />
        <Route path="/tasks" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><TaskBoard /></RoleProtectedRoute>} />
        <Route path="/task-board" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><TaskBoard /></RoleProtectedRoute>} />
        <Route path="/evaluation/cycles" element={<RoleProtectedRoute screenPath="/evaluation" allowedRoles={["admin", "recruiter", "reviewer"]}><Performance360 /></RoleProtectedRoute>} />
        <Route path="/evaluation" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><Performance360 /></RoleProtectedRoute>} />
        <Route path="/evaluation/manual" element={<RoleProtectedRoute screenPath="/evaluation" allowedRoles={["admin", "recruiter", "reviewer"]}><PerformanceEvaluation /></RoleProtectedRoute>} />
        <Route path="/performance-evaluation" element={<Navigate to="/evaluation" replace />} />

        <Route path="/question-bank" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter"]}><QuestionBank /></RoleProtectedRoute>} />
        <Route path="/library" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><SystemLibrary /></RoleProtectedRoute>} />
        <Route path="/system-library" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><SystemLibrary /></RoleProtectedRoute>} />
        <Route path="/resume-archive" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter", "reviewer"]}><ResumeArchive /></RoleProtectedRoute>} />
        <Route path="/workflow" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter"]}><WorkflowEditor /></RoleProtectedRoute>} />
        <Route path="/checklist-tracker" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter"]}><ChecklistTracker /></RoleProtectedRoute>} />

        <Route path="/roadmap" element={<RoleProtectedRoute allowedRoles={["admin"]} superAdminOnly><Roadmap /></RoleProtectedRoute>} />

        {/* Role-protected: admin only */}
        <Route path="/team" element={<RoleProtectedRoute allowedRoles={["admin"]}><TeamManagement /></RoleProtectedRoute>} />
        <Route path="/audit-log" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter"]}><AuditLog /></RoleProtectedRoute>} />
        <Route path="/admin/blog" element={<RoleProtectedRoute allowedRoles={["admin"]} superAdminOnly><BlogAdmin /></RoleProtectedRoute>} />
        <Route path="/admin/companies" element={<RoleProtectedRoute allowedRoles={["admin"]} superAdminOnly><AdminCompanies /></RoleProtectedRoute>} />
        <Route path="/admin/companies/:id" element={<RoleProtectedRoute allowedRoles={["admin"]} superAdminOnly><AdminCompanyDetail /></RoleProtectedRoute>} />
        <Route path="/admin/agencies" element={<RoleProtectedRoute allowedRoles={["admin"]} superAdminOnly><AdminAgencies /></RoleProtectedRoute>} />
        <Route path="/admin/quality" element={<RoleProtectedRoute allowedRoles={["admin"]} superAdminOnly><QualityReport /></RoleProtectedRoute>} />
        <Route path="/company" element={<ProtectedRoute><CompanyPortal /></ProtectedRoute>} />
        <Route path="/company/agencies" element={<RoleProtectedRoute allowedRoles={["admin", "recruiter"]}><CompanyAgencies /></RoleProtectedRoute>} />
        <Route path="/agency" element={<ProtectedRoute><AgencyPortal /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
      },
      mutations: {
        retry: 0,
      },
    },
  }));

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MotionProvider>
          <I18nProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <CompanyProvider>
                  <TooltipProvider>
                    <SessionManager />
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <AnimatedRoutes />
                    </BrowserRouter>
                  </TooltipProvider>
                </CompanyProvider>
              </AuthProvider>
            </QueryClientProvider>
          </I18nProvider>
        </MotionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
