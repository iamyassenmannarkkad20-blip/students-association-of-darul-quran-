import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Organisation } from './pages/public/Organisation';
import { Library } from './pages/public/Library';
import { Magazines } from './pages/public/Magazines';
import { Media } from './pages/public/Media';
import { Opportunities } from './pages/public/Opportunities';
import { ServicesMarketplace } from './pages/public/ServicesMarketplace';
import { Certificates } from './pages/public/Certificates';
import { PortfolioView } from './pages/public/PortfolioView';
import { TalentDiscovery } from './pages/public/TalentDiscovery';

// Auth
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Student workspace
import { StudentDashboard } from './pages/student/Dashboard';
import { ProfileEdit } from './pages/student/ProfileEdit';
import { TalentsPage } from './pages/student/TalentsPage';
import { SkillsPage } from './pages/student/SkillsPage';
import { AchievementsPage } from './pages/student/AchievementsPage';
import { ProjectsPage } from './pages/student/ProjectsPage';
import { OrganisationView } from './pages/student/OrganisationView';
import { CreateCenter } from './pages/student/CreateCenter';


// Community
import { CommunityFeed } from './pages/student/CommunityFeed';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';

const FallbackModule: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-semibold">
      <span>SADQ Platform Module</span>
    </div>
    <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-navy-900">{title}</h1>
    <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">{subtitle}</p>
    <div className="pt-4">
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/organisation" element={<Organisation />} />
              <Route path="/library" element={<Library />} />
              <Route path="/magazines" element={<Magazines />} />
              <Route path="/media" element={<Media />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/services" element={<ServicesMarketplace />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/portfolio/:slug" element={<PortfolioView />} />
              <Route path="/explore" element={<TalentDiscovery />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Workspace Routes */}
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<ProfileEdit />} />
              <Route path="/student/talents" element={<TalentsPage />} />
              <Route path="/student/skills" element={<SkillsPage />} />
              <Route path="/student/achievements" element={<AchievementsPage />} />
              <Route path="/student/projects" element={<ProjectsPage />} />
              <Route path="/student/organisation" element={<OrganisationView />} />
              <Route path="/student/create" element={<CreateCenter />} />

              {/* Community */}
              <Route path="/community" element={<CommunityFeed />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminDashboard />} />



              {/* 404 */}
              <Route
                path="*"
                element={
                  <FallbackModule
                    title="Page Not Found"
                    subtitle="The requested page could not be located on SADQ Platform."
                  />
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
