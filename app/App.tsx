import React from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { AnchorsPage } from './pages/AnchorsPage';
import { EventsPage } from './pages/EventsPage';
import { ValidatorsPage } from './pages/ValidatorsPage';
import { AnchorDetail } from './pages/AnchorDetail';
import { EventDetail } from './pages/EventDetail';
import { AccountDetail } from './pages/AccountDetail';
import { SearchResults } from './pages/SearchResults';
import { Starfield } from './components/Starfield';


function getPathForRoute(path: string, id?: string): string {
  switch (path) {
    case 'landing':
      return '/';
    case 'dashboard':
      return '/dashboard';
    case 'anchors':
      return '/anchors';
    case 'events':
      return '/events';
    case 'validators':
      return '/validators';
    case 'anchor_detail':
      return `/anchor/${encodeURIComponent(id || '')}`;
    case 'event_detail':
      return `/event/${encodeURIComponent(id || '')}`;
    case 'account_detail':
      return `/account/${encodeURIComponent(id || '')}`;
    case 'search_results':
      return `/search?q=${encodeURIComponent(id || '')}`;
    default:
      return '/';
  }
}


function getNavHighlightFromPathname(pathname: string): string {
  if (pathname === '/') return 'landing';
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname === '/anchors' || pathname.startsWith('/anchor/')) return 'anchors';
  if (pathname === '/events' || pathname.startsWith('/event/')) return 'events';
  if (pathname === '/validators') return 'validators';
  return '';
}

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = getNavHighlightFromPathname(location.pathname);

  const handleNavigate = (path: string, id?: string) => {
    window.scrollTo(0, 0);
    navigate(getPathForRoute(path, id));
  };

  return (
    <div className={`min-h-screen font-sans text-white selection:bg-indigo-500 selection:text-white ${location.pathname === '/' ? 'bg-black' : 'bg-transparent'}`}>
      {location.pathname !== '/' && <Starfield />}
      <Navbar onNavigate={handleNavigate} currentPath={currentPath} />

      <main className={location.pathname === '/' ? 'w-full' : 'relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-10 min-h-[70vh]'}>
        <Routes>
          <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
          <Route path="/dashboard" element={<Dashboard onNavigate={handleNavigate} />} />
          <Route path="/anchors" element={<AnchorsPage onNavigate={handleNavigate} />} />
          <Route path="/events" element={<EventsPage onNavigate={handleNavigate} />} />
          <Route path="/validators" element={<ValidatorsPage />} />
          <Route
            path="/anchor/:id"
            element={<AnchorDetailWrapper onNavigate={handleNavigate} />}
          />
          <Route
            path="/event/:id"
            element={<EventDetailWrapper onNavigate={handleNavigate} />}
          />
          <Route
            path="/account/:address"
            element={<AccountDetailWrapper onNavigate={handleNavigate} />}
          />
          <Route
            path="/search"
            element={<SearchResultsWrapper onNavigate={handleNavigate} />}
          />
          <Route path="*" element={<LandingPage onNavigate={handleNavigate} />} />
        </Routes>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

const AnchorDetailWrapper = ({ onNavigate }: { onNavigate: (p: string, id?: string) => void }) => {
  const { id } = useParams<{ id: string }>();
  return <AnchorDetail anchorId={id || 'anchor_setu_default'} onNavigate={onNavigate} />;
};

const EventDetailWrapper = ({ onNavigate }: { onNavigate: (p: string, id?: string) => void }) => {
  const { id } = useParams<{ id: string }>();
  return <EventDetail eventId={id || 'ev_setu_default'} onNavigate={onNavigate} />;
};

const AccountDetailWrapper = ({ onNavigate }: { onNavigate: (p: string, id?: string) => void }) => {
  const { address } = useParams<{ address: string }>();
  return <AccountDetail address={address || 'alice_wallet'} onNavigate={onNavigate} />;
};

const SearchResultsWrapper = ({ onNavigate }: { onNavigate: (p: string, id?: string) => void }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  return <SearchResults query={query} onNavigate={onNavigate} />;
};

const App = () => (
  <AppContent />
);

export default App;
