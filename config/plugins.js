module.exports = ({ env }) => ({
  upload: {
    config: {
      sizeLimit: 3 * 1024 * 1024, // 3mb in bytes
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },

  email: {
    config: {
      provider: "amazon-ses",
      providerOptions: {
        key: env("AWS_SES_KEY"),
        secret: env("AWS_SES_SECRET"),
        amazon: "https://email.us-east-1.amazonaws.com",
      },
      settings: {
        defaultFrom: "me@devfel.com",
        defaultReplyTo: "tabuai.sac@gmail.com",
      },
    },
  },

  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET"),
    },
  },
});
