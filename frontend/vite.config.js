export default {
  envDir: '../backend', // points to the directory containing your .env.development.local file
  envPrefix: ['SUPABASE_', 'VITE_'], // expose variables starting with SUPABASE_ and VITE_
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
};
