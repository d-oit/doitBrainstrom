import { useState, useEffect, lazy, Suspense } from 'react'
import './styles/App.css'
// s3Service will be imported dynamically
import Layout from './components/Layout'
import { Box, Typography, Alert, Paper, CircularProgress } from '@mui/material'
import ThemeDemo from './components/Demo/ThemeDemo'
import { useI18n } from './contexts/I18nContext'
import { ChatContextProvider } from './contexts/ChatContext'
import FloatingChatButton from './components/Chat/FloatingChatButton'
import { ResponsiveGrid, ResponsiveGridItem } from './components/layout/ResponsiveGrid'
import { getTabStateAsync, setTabState } from './services/navigationStorageService'
import { runAllMigrations } from './utils/migrationUtils'

// Lazy load components
const MindMapCard = lazy(() => import('./components/MindMapCard'))
const MindMap = lazy(() => import('./components/MindMap'))

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3, height: 'calc(100vh - 200px)' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Separate component for the main app content
function AppContent({ tabValue, onTabChange, buckets, error, isLoading, t }: {
  tabValue: number;
  onTabChange: (value: number) => void;
  buckets: AWS.S3.Bucket[] | null;
  error: string | null;
  isLoading: boolean;
  t: (key: string, params?: Record<string, string>) => string;
}) {
  return (
    <Layout currentTab={tabValue} onTabChange={onTabChange}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('app.title')}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {t('app.subtitle')}
        </Typography>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Suspense fallback={<Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}>
          <MindMap />
        </Suspense>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <ThemeDemo />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {t('s3.connectionTest')}
          </Typography>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : buckets ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>{t('s3.connectionSuccess')}</Alert>
              <Typography variant="h6" component="h3" gutterBottom>
                {t('s3.availableBuckets')}
              </Typography>
              <ul>
                {buckets.map((bucket) => (
                  <li key={bucket.Name}>{bucket.Name}</li>
                ))}
              </ul>
            </Box>
          ) : (
            <Alert severity="info">{t('s3.testConnection')}</Alert>
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('tabs.sampleCards')}
        </Typography>
        <ResponsiveGrid container gap="md">
          <ResponsiveGridItem xs={12} sm={6} md={4}>
            <Suspense fallback={<Box p={2}><CircularProgress size={20} /></Box>}>
              <MindMapCard
                title={t('mindMap.mainIdea')}
                description={t('mindMap.mainIdeaDesc')}
              />
            </Suspense>
          </ResponsiveGridItem>
          <ResponsiveGridItem xs={12} sm={6} md={4}>
            <Suspense fallback={<Box p={2}><CircularProgress size={20} /></Box>}>
              <MindMapCard
                title={t('mindMap.supportingConcept')}
                description={t('mindMap.supportingConceptDesc')}
              />
            </Suspense>
          </ResponsiveGridItem>
          <ResponsiveGridItem xs={12} sm={6} md={4}>
            <Suspense fallback={<Box p={2}><CircularProgress size={20} /></Box>}>
              <MindMapCard
                title={t('mindMap.anotherConcept')}
                description={t('mindMap.anotherConceptDesc')}
              />
            </Suspense>
          </ResponsiveGridItem>
        </ResponsiveGrid>
      </TabPanel>

      {/* Chat Button */}
      <ChatContextProvider>
        <FloatingChatButton position="bottom-right" />
      </ChatContextProvider>
    </Layout>
  );
}

function App() {
  const [buckets, setBuckets] = useState<AWS.S3.Bucket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { t, isReady } = useI18n();

  // Initialize app state from IndexedDB
  useEffect(() => {
    const initializeAppState = async () => {
      try {
        if (typeof runAllMigrations === 'function' && typeof getTabStateAsync === 'function') {
          await runAllMigrations();
          const savedTabValue = await getTabStateAsync();
          setTabValue(savedTabValue);
        }
      } catch (error) {
        console.error('Failed to initialize app state from IndexedDB:', error);
      }
    };
    initializeAppState();
  }, []);

  useEffect(() => {
    const fetchBuckets = async () => {
      if (tabValue !== 1) return;

      setIsLoading(true);
      setBuckets(null);
      setError(null);

      try {
        const { listBuckets } = await import('./services/s3Service');
        const result = await listBuckets();

        if (result.error) {
          setError(t(result.error === 'No buckets found' ? 's3.noBuckets' : 's3.connectionError'));
          return;
        }

        if (!result.buckets || result.buckets.length === 0) {
          setError(t('s3.noBuckets'));
          return;
        }

        setBuckets(result.buckets);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(t('s3.connectionError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuckets();
  }, [t, tabValue]);

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
    if (typeof setTabState === 'function') {
      setTabState(newValue);
    }
  };

  if (!isReady) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <AppContent
    tabValue={tabValue}
    onTabChange={handleTabChange}
    buckets={buckets}
    error={error}
    isLoading={isLoading}
    t={t}
  />;
}

export default App
