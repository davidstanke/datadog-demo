import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

const appId = import.meta.env.VITE_DATADOG_APPLICATION_ID;
const clientToken = import.meta.env.VITE_DATADOG_CLIENT_TOKEN;
const site = import.meta.env.VITE_DATADOG_SITE || 'datadoghq.com';
const service = import.meta.env.VITE_DATADOG_SERVICE || 'clay-figurine-store';
const envName = import.meta.env.VITE_DATADOG_ENV || 'development';

const hasValidCredentials = 
  appId && 
  clientToken && 
  appId !== 'your-datadog-rum-application-id' && 
  clientToken !== 'pubxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' &&
  !appId.includes('mock');

if (hasValidCredentials) {
  datadogRum.init({
    applicationId: appId,
    clientToken: clientToken,
    site: site,
    service: service,
    env: envName,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    plugins: [reactPlugin({ router: true })],
  });
  
  // Start Session Replay recording
  datadogRum.startSessionReplayRecording();
} else {
  console.warn(
    'Datadog RUM: Running in mock/local mode. Set valid credentials in .env to enable real tracking.'
  );
}

export { datadogRum };
