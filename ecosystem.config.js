module.exports = {
  apps: [{
    name: "beko-app",
    script: "pnpm",
    args: "run start:prod",
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
    }
  }]
}