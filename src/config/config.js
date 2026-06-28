function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

module.exports = {
  telegram: {
    token: required("OTP_BOT_TOKEN")
  },

  supabase: {
    url: required("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY")
  },

  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://viltrum-card-kappa.vercel.app"
  },

  otp: {
    expirySeconds: 60,
    cooldownSeconds: 60
  }
};
