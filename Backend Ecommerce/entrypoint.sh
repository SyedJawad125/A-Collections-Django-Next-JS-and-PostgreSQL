#!/bin/sh

set -e

# Function to wait for a service
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3

    echo "👉 Waiting for $service_name at $host:$port..."
    until nc -z $host $port; do
        echo "$service_name is unavailable - sleeping"
        sleep 10
    done
    echo "✅ $service_name is up!"
}

# Always wait for PostgreSQL
wait_for_service db 5432 "PostgreSQL"

# If this is the worker or web service, wait for RabbitMQ too
if [ "$1" = "celery" ] || [ "$1" = "python" ] || [ "$1" = "gunicorn" ]; then
    wait_for_service rabbitmq 5672 "RabbitMQ"
fi

# Run migrations and scripts only for the web container
if [ "$1" = "python" ] && [ "$2" = "manage.py" ] && [ "$3" = "runserver" ]; then
    echo "👉 Running migrations..."
    python manage.py makemigrations --noinput
    python manage.py migrate --noinput

    echo "👉 Running scripts..."
    python script_permissions.py
    python script_populate.py
fi

# Special handling for gunicorn command
if [ "$1" = "gunicorn" ]; then
    echo "👉 Running migrations for gunicorn..."
    python manage.py makemigrations --noinput
    python manage.py migrate --noinput

    echo "👉 Running scripts for gunicorn..."
    python script_permissions.py
    python script_populate.py
fi

echo "👉 Starting: $@"
exec "$@"