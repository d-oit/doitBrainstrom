import { useState, useEffect } from 'react'
import './styles/App.css'
import { listBuckets } from './services/s3Service'
import Layout from './components/Layout'
import MindMapCard from './components/MindMapCard'
import MindMap from './components/MindMap'
import { Box, Grid, Typography, Alert, Paper, Tabs, Tab } from '@mui/material'
import { useI18n } from './contexts/I18nContext'

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
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [buckets, setBuckets] = useState<AWS.S3.Bucket[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0);
  const { t } = useI18n();

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const bucketsData = await listBuckets()
        setBuckets(bucketsData)
      } catch (err) {
        setError(t('s3.connectionError'))
        console.error(err)
      }
    }

    fetchBuckets()
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('app.title')}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {t('app.subtitle')}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="app tabs">
          <Tab label={t('tabs.mindMap')} id="tab-0" aria-controls="tabpanel-0" />
          <Tab label={t('tabs.s3Connection')} id="tab-1" aria-controls="tabpanel-1" />
          <Tab label={t('tabs.sampleCards')} id="tab-2" aria-controls="tabpanel-2" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <MindMap />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {t('s3.connectionTest')}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {buckets && (
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
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('tabs.sampleCards')}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <MindMapCard
              title={t('mindMap.mainIdea')}
              description={t('mindMap.mainIdeaDesc')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MindMapCard
              title={t('mindMap.supportingConcept')}
              description={t('mindMap.supportingConceptDesc')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MindMapCard
              title={t('mindMap.anotherConcept')}
              description={t('mindMap.anotherConceptDesc')}
            />
          </Grid>
        </Grid>
      </TabPanel>
    </Layout>
  )
}

export default App
