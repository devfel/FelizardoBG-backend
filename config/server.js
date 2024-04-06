// Path: ./config/server.js

// // Local Configuration
// module.exports = ({ env }) => ({
//   host: env("HOST", "0.0.0.0"),
//   port: env.int("PORT", 1337),
//   app: {
//     keys: env.array("APP_KEYS"),
//   },
//   webhooks: {
//     populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", true),
//   },
// });

module.exports = ({ env }) => ({
  proxy: true,
  host: "0.0.0.0",
  port: process.env.PORT,
  url: env("APP_URL"),
  app: {
    keys: env.array("APP_KEYS"),
  },
  admin: {
    path: "/admin",
    build: {
      backend: env("APP_URL", "https://tabuai-backend.adaptable.app"),
    },
    auth: {
      secret: env("ADMIN_JWT_SECRET"),
    },
  },
});
