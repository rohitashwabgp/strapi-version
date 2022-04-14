module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '49af5380a8d4dd63a485d02affefd749'),
  },
});
