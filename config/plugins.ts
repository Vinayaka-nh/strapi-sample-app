module.exports = ({ env }) => ({
    'google-auth': {
      config: {
        providers: {
          google: {
            clientId: env('CLIENT_ID'),
            clientSecret: env('CLIENT_SECRET'),
            redirectUri: `http://localhost:1337/connect/google/callback`,
            scope: ['email', 'profile']
          },
        },
      },
    },
  });
  