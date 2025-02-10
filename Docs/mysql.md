Below is the same guide formatted in Markdown suitable for a GitHub README or documentation file:

# MySQL 8 GTID-Based Replication Setup on RHEL 9

This guide explains how to set up MySQL 8’s default (GTID-based) replication on Red Hat Enterprise Linux 9. The setup uses global transaction identifiers (GTIDs) so that the replica (slave) can automatically track and apply all transactions from the master (source).

---

## Prerequisites

- MySQL 8 is installed on both the master and replica servers.
- RHEL 9 is used on both machines.
- Firewall rules allow communication on port `3306` (or your chosen MySQL port) between the servers.
- You have root privileges (or sudo access) on both systems.

---

## 1. Configure the Master (Source) Server

### 1.1 Edit MySQL Configuration

Open the configuration file (commonly located at `/etc/my.cnf.d/mysql-server.cnf`) and add or modify the following settings under the `[mysqld]` section:

```ini
[mysqld]
# Listen on the master’s IP address so that the replica can connect
bind-address = <master-ip-address>

# Unique server ID (e.g., 1)
server-id = 1

# Enable binary logging (required for replication)
log_bin = /var/log/mysql/mysql-bin.log

# Enable GTID mode
gtid_mode = ON
enforce-gtid-consistency = ON

# Optionally, specify databases to replicate
# binlog_do_db = your_database_name

1.2 Restart MySQL

Restart the MySQL service to apply changes:

sudo systemctl restart mysqld

1.3 Create a Replication User

Log in to MySQL as root:

mysql -u root -p

Create a dedicated replication user and grant the required privileges (replace <replica-ip>, <replication_user>, and <password> with your values):

CREATE USER 'replication_user'@'<replica-ip>' IDENTIFIED BY '<password>';
GRANT REPLICATION SLAVE ON *.* TO 'replication_user'@'<replica-ip>';
FLUSH PRIVILEGES;

	Tip: You can temporarily set the master to read-only during initial setup:

1.4 Note the Binary Log Coordinates

Run the following command to get the binary log file and position:

SHOW MASTER STATUS\G

Take note of the File (e.g., mysql-bin.000002) and Position (e.g., 939). With GTID replication you can use auto-positioning.

2. Configure the Replica (Slave) Server

2.1 Edit MySQL Configuration

On the replica server, open /etc/my.cnf.d/mysql-server.cnf and add or modify the following settings:

[mysqld]
# Listen on the replica’s IP address
bind-address = <replica-ip-address>

# Unique server ID (must differ from the master; e.g., 2)
server-id = 2

# Recommended: Enable binary logging on the replica (optional but useful)
log_bin = /var/log/mysql/mysql-bin.log

# Enable GTID mode
gtid_mode = ON
enforce-gtid-consistency = ON

# Log updates from replication for further replication if needed
log-replica-updates = ON

# Do not start replication automatically on server startup
skip-replica-start = ON

2.2 Restart MySQL

Restart the replica’s MySQL service:

sudo systemctl restart mysqld

2.3 Configure the Replica to Connect to the Master

Log in to MySQL on the replica:

mysql -u root -p

(Optional) Set the replica to read-only:

SET GLOBAL read_only = ON;

Use the CHANGE REPLICATION SOURCE TO command to configure replication using GTID auto-positioning. Replace the placeholders accordingly:

CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = '<master-ip-address>',
    SOURCE_USER = 'replication_user',
    SOURCE_PASSWORD = '<password>',
    SOURCE_AUTO_POSITION = 1;

Start the replication threads:

START REPLICA;

(Optional) Once replication is verified, disable read-only if the replica is used for reads:

SET GLOBAL read_only = OFF;

3. Verify Replication

On the replica server, check the replication status with:

SHOW REPLICA STATUS\G

Key indicators:
	•	Slave_IO_Running should be Yes
	•	Slave_SQL_Running should be Yes
	•	The Executed_Gtid_Set field should be nonempty

On the master, you can also verify with:

SHOW MASTER STATUS;

Summary
	1.	Master Configuration:
	•	Set a unique server-id (e.g., 1), enable binary logging, enable GTID mode, and create a replication user.
	2.	Replica Configuration:
	•	Set its own unique server-id (e.g., 2), enable binary logging and GTID mode, and use CHANGE REPLICATION SOURCE TO with SOURCE_AUTO_POSITION=1.
	3.	Start and Verify Replication:
	•	Start replication on the replica and check that both the IO and SQL threads are running.

Following these steps will provide you with a robust GTID-based replication setup on RHEL 9 with MySQL 8.

References
	•	Red Hat Enterprise Linux Documentation on Replicating MySQL
	•	Cloudscoop article on Setup MySQL Master-Slave Replication on RHEL 8

Simply copy and paste the above content into your GitHub Markdown file. You can further edit or enhance it as needed for your repository.