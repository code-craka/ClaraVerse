import { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
// import Settings from './components/Settings';
import Debug from './components/Debug';
import Onboarding from './components/Onboarding';
import ImageGen from './components/ImageGen';
// import Gallery from './components/Gallery';
import Help from './components/Help';
// import N8N from './components/N8N';
import Servers from './components/Servers';
// import AgentStudio from './components/AgentStudio';
// import Lumaui from './components/Lumaui';
import LumaUILite from './components/LumaUILite';
import Notebooks from './components/Notebooks';
import { db } from './db';
import { ProvidersProvider } from './contexts/ProvidersContext';
import ClaraAssistant from './components/ClaraAssistant';
import { StartupService } from './services/startupService';

const Settings = lazy(() => import('./components/Settings'));
const Gallery = lazy(() => import('./components/Gallery'));
const N8N = lazy(() => import('./components/N8N'));
const AgentStudio = lazy(() => import('./components/AgentStudio'));
const Lumaui = lazy(() => import('./components/Lumaui'));

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-full">
    <div className="text-xl font-semibold">Loading Page...</div>
  </div>
);

function App() {
  const [activePage, setActivePage] = useState(() => localStorage.getItem('activePage') || 'dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string } | null>(null);
  const [alphaFeaturesEnabled, setAlphaFeaturesEnabled] = useState(false);

  useEffect(() => {
    const checkUserInfo = async () => {
      const info = await db.getPersonalInfo();
      if (!info || !info.name) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
        setUserInfo({ name: info.name });
      }
    };
    checkUserInfo();
    
    // Add db to window for debugging in development
    if (import.meta.env.DEV) {
      (window as typeof window & { db: typeof db }).db = db;
    }
  }, []);

  useEffect(() => {
    db.getAlphaFeaturesEnabled?.().then(val => setAlphaFeaturesEnabled(!!val));
  }, []);

  useEffect(() => {
    // Apply startup settings
    StartupService.getInstance().applyStartupSettings();
  }, []);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    const info = await db.getPersonalInfo();
    if (info) {
      setUserInfo({ name: info.name });
    }
  };

  useEffect(() => {
    console.log('Storing activePage:', activePage);
    localStorage.setItem('activePage', activePage);
  }, [activePage]);

  const renderContent = () => {
    if (activePage === 'assistant') {
      return <ClaraAssistant onPageChange={setActivePage} />;
    }
    
    // Clara is now always mounted but conditionally visible
    // This allows it to run in the background
    
    if (activePage === 'agents') {
      return <Suspense fallback={<LoadingFallback />}><AgentStudio onPageChange={setActivePage} userName={userInfo?.name} /></Suspense>;
    }
    

    
    if (activePage === 'image-gen') {
      return <ImageGen onPageChange={setActivePage} />;
    }

    if (activePage === 'gallery') {
      return <Suspense fallback={<LoadingFallback />}><Gallery onPageChange={setActivePage} /></Suspense>;
    }

    if (activePage === 'n8n') {
      return <Suspense fallback={<LoadingFallback />}><N8N onPageChange={setActivePage} /></Suspense>;
    }
    
    if (activePage === 'servers') {
      return <Servers onPageChange={setActivePage} />;
    }

    return (
      <div className="flex h-screen">
        <Sidebar activePage={activePage} onPageChange={setActivePage} alphaFeaturesEnabled={alphaFeaturesEnabled} />
        
        <div className="flex-1 flex flex-col">
          <Topbar userName={userInfo?.name} onPageChange={setActivePage} />
          
          <main className="">
            <Suspense fallback={<LoadingFallback />}>
              {(() => {
                switch (activePage) {
                  case 'settings':
                    return <Settings alphaFeaturesEnabled={alphaFeaturesEnabled} setAlphaFeaturesEnabled={setAlphaFeaturesEnabled} />;
                  case 'debug':
                    return <Debug />;
                  case 'help':
                    return <Help />;
                  case 'notebooks':
                    return <Notebooks />;
                  case 'lumaui':
                    return <Lumaui onPageChange={setActivePage} />;
                  case 'lumaui-lite':
                    return <LumaUILite />;
                  case 'dashboard':
                  default:
                    return <Dashboard onPageChange={setActivePage} />;
                }
              })()}
            </Suspense>
          </main>
        </div>
      </div>
    );
  };

  return (
    <ProvidersProvider>
      <div className="min-h-screen bg-gradient-to-br from-white to-sakura-100 dark:from-gray-900 dark:to-sakura-100">
        {showOnboarding ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <>
            {/* Always render Clara in background - visible when activePage is 'clara' */}
            <div className={activePage === 'clara' ? 'block' : 'hidden'} data-clara-container>
              <ClaraAssistant onPageChange={setActivePage} />
            </div>
            
            {/* Render other content when not on Clara page */}
            {activePage !== 'clara' && renderContent()}
            {/* Fallback for renderContent can be added here if needed, but individual Suspense wrappers are more granular */}
          </>
        )}
      </div>
    </ProvidersProvider>
  );
}

export default App;


