export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  publicUrl: 'http://localhost:4200',
  auth0: {
    domain: 'YOUR_TENANT.auth0.com',
    clientId: 'YOUR_CLIENT_ID',
    audience: 'https://api.yourdomain.com',
  },
  analytics: {
    posthogKey: '',
    gaMeasurementId: '',
  },
};
