module.exports = {
  apps: [{
    name: "beko-app",
    script: "pnpm",
    args: "run start:prod",
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
}