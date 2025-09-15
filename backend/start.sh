#!/bin/sh

echo "🚀 Starting Xeno CRM Backend..."
echo "📅 Time: $(date)"
echo "🌍 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"
echo "📊 Database URL: $DATABASE_URL"
echo "🔴 Redis URL: $REDIS_URL"

# Start the application
echo "▶️  Executing: npm start"
exec npm start
