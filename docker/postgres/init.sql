CREATE DATABASE authdb;
CREATE DATABASE monitoringdb;
CREATE DATABASE alertdb;
CREATE DATABASE notificationdb;

GRANT ALL PRIVILEGES ON DATABASE authdb TO observability;
GRANT ALL PRIVILEGES ON DATABASE monitoringdb TO observability;
GRANT ALL PRIVILEGES ON DATABASE alertdb TO observability;
GRANT ALL PRIVILEGES ON DATABASE notificationdb TO observability;
