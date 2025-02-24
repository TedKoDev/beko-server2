module.exports = {
  apps: [{
    name: "beko-app",
    script: "./dist/main.js",
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    },
    env_development: {
      NODE_ENV: "development",
      watch: [
        "dist",
        "src"
      ],
      ignore_watch: [
        "node_modules",
        "logs",
        ".git"
      ],
      watch_options: {
        followSymlinks: false
      },
      pre_restart: "pnpm run build",
      exp_backoff_restart_delay: 100
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
}