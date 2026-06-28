const { createClient } = require("@supabase/supabase-js");
const config = require("../config/config");

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

module.exports = supabase;
