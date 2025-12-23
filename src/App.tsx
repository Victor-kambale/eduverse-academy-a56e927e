import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseLearning from "./pages/CourseLearning";
import PaymentSuccess from "./pages/PaymentSuccess";
import Dashboard from "./pages/Dashboard";
import Help from "./pages/Help";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CoursesManagement from "./pages/admin/CoursesManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import TeacherApplications from "./pages/admin/TeacherApplications";
import ContentApprovals from "./pages/admin/ContentApprovals";
import NotificationsDashboard from "./pages/admin/NotificationsDashboard";
import ChatManagement from "./pages/admin/ChatManagement";
import EmailMarketing from "./pages/admin/EmailMarketing";
import NewsletterManagement from "./pages/admin/NewsletterManagement";
import TestingDashboard from "./pages/admin/TestingDashboard";
import PromoManagement from "./pages/admin/PromoManagement";
import LanguageManagement from "./pages/admin/LanguageManagement";
import TeacherDashboardControl from "./pages/admin/TeacherDashboardControl";
import StudentDashboardControl from "./pages/admin/StudentDashboardControl";
import FooterLinksManagement from "./pages/admin/FooterLinksManagement";
import WithdrawalManagement from "./pages/admin/WithdrawalManagement";
import RevenueAnalytics from "./pages/admin/RevenueAnalytics";
import PaymentTesting from "./pages/admin/PaymentTesting";
import CertificatesManagement from "./pages/admin/CertificatesManagement";
import TransfersManagement from "./pages/admin/TransfersManagement";
import MaintenanceManagement from "./pages/admin/MaintenanceManagement";
import SecurityManagement from "./pages/admin/SecurityManagement";
import WithdrawalProcess from "./pages/admin/WithdrawalProcess";
import TeacherRegistration from "./pages/TeacherRegistration";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherChat from "./pages/teacher/TeacherChat";
import Quiz from "./pages/Quiz";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyCertificate from "./pages/VerifyCertificate";
import UniversityRegistration from "./pages/UniversityRegistration";
import UniversityDashboard from "./pages/university/UniversityDashboard";
import GiftCards from "./pages/GiftCards";
import { CopyProtection } from "./components/security/CopyProtection";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-certificate/:credentialId" element={<VerifyCertificate />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/course/:id/success" element={<PaymentSuccess />} />
            <Route
              path="/course/:courseId/learn"
              element={
                <ProtectedRoute>
                  <CourseLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/gift-cards" element={<GiftCards />} />
            <Route path="/degrees" element={<Courses />} />
            <Route path="/careers" element={<About />} />
            <Route
              path="/teacher/register"
              element={
                <ProtectedRoute>
                  <TeacherRegistration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:quizId"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            
            {/* Teacher Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/chat"
              element={
                <ProtectedRoute>
                  <TeacherChat />
                </ProtectedRoute>
              }
            />
            
            {/* University Routes */}
            <Route
              path="/university/register"
              element={
                <ProtectedRoute>
                  <UniversityRegistration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/university/dashboard"
              element={
                <ProtectedRoute>
                  <UniversityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<CoursesManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="teachers" element={<TeacherApplications />} />
              <Route path="content-approvals" element={<ContentApprovals />} />
              <Route path="email-marketing" element={<EmailMarketing />} />
              <Route path="newsletter" element={<NewsletterManagement />} />
              <Route path="notifications" element={<NotificationsDashboard />} />
              <Route path="chat" element={<ChatManagement />} />
              <Route path="testing" element={<TestingDashboard />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="promos" element={<PromoManagement />} />
              <Route path="languages" element={<LanguageManagement />} />
              <Route path="teacher-control" element={<TeacherDashboardControl />} />
              <Route path="student-control" element={<StudentDashboardControl />} />
              <Route path="footer-links" element={<FooterLinksManagement />} />
              <Route path="withdrawals" element={<WithdrawalManagement />} />
              <Route path="revenue" element={<RevenueAnalytics />} />
              <Route path="payment-testing" element={<PaymentTesting />} />
              <Route path="certificates" element={<CertificatesManagement />} />
              <Route path="transfers" element={<TransfersManagement />} />
              <Route path="maintenance" element={<MaintenanceManagement />} />
              <Route path="security" element={<SecurityManagement />} />
              <Route path="withdrawal-process" element={<WithdrawalProcess />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
