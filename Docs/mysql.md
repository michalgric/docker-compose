Below is an overview of the process and configuration steps you can follow to set up MySQL 8’s default (GTID‐based) replication on Red Hat Enterprise Linux 9. The general idea is to configure your master (source) and replica (slave) servers so that all transactions are logged with global transaction identifiers (GTIDs), which makes it much simpler for the replica to keep in sync with the master.

Below are the high‐level steps along with the key configuration details:

1. Prepare Your Environment

• Ensure that MySQL 8 is installed on both the master and replica servers on RHEL 9.
• Make sure that any firewall rules allow communication on port 3306 (or whichever port MySQL is using) between the servers.

2. Configure the Master (Source) Server
	1.	Edit the MySQL configuration file
Open the file (typically at /etc/my.cnf.d/mysql-server.cnf) and add or modify the following parameters under the [mysqld] section:

[mysqld]
# Listen on the source’s IP address so that the replica can connect
bind-address = <master-ip-address>
# Unique server ID – for example, 1
server-id = 1
# Enable binary logging (required for replication)
log_bin = /var/log/mysql/mysql-bin.log
# Enable GTID mode (default replication mode in MySQL 8)
gtid_mode = ON
enforce-gtid-consistency = ON
# Optionally, include (or exclude) specific databases
# binlog_do_db = your_database_name


	2.	Restart MySQL
After saving your changes, restart the MySQL service:

sudo systemctl restart mysqld


	3.	Create a Replication User
Log into MySQL as root:

mysql -u root -p

Then create a dedicated replication user and grant it the replication privilege. (Replace <replica-ip>, <replication_user>, and <password> with your details.)

CREATE USER 'replication_user'@'<replica-ip>' IDENTIFIED BY '<password>';
GRANT REPLICATION SLAVE ON *.* TO 'replication_user'@'<replica-ip>';
FLUSH PRIVILEGES;


	4.	(Optional) Set the Master to Read-Only
For extra safety during the initial setup, you might temporarily set the master to read-only:

SET GLOBAL read_only = ON;


	5.	Note the Binary Log Coordinates
Execute:

SHOW MASTER STATUS\G

Note the values for File (for example, mysql-bin.000002) and Position (e.g. 939). With GTID-based replication, you’ll later use automatic positioning so you can use the SOURCE_AUTO_POSITION=1 option.

3. Configure the Replica (Slave) Server
	1.	Edit the Replica’s MySQL configuration file
On the replica server, open its configuration file (again usually /etc/my.cnf.d/mysql-server.cnf) and add these settings under [mysqld]:

[mysqld]
# Listen on the replica’s IP address
bind-address = <replica-ip-address>
# Unique server ID – must differ from the master (e.g. 2)
server-id = 2
# It is recommended (though not strictly required) to enable binary logging on the replica as well
log_bin = /var/log/mysql/mysql-bin.log
# Enable GTID mode on the replica too
gtid_mode = ON
enforce-gtid-consistency = ON
# Log updates from replication so that the replica’s changes can be further replicated if needed
log-replica-updates = ON
# Prevent automatic start of replication threads on startup (you’ll start them manually)
skip-replica-start = ON


	2.	Restart MySQL on the Replica

sudo systemctl restart mysqld


	3.	Configure the Replica to Connect to the Master
Log in to MySQL on the replica:

mysql -u root -p

First, you may set the replica to read-only:

SET GLOBAL read_only = ON;

Then, execute the CHANGE REPLICATION SOURCE TO command using GTID auto-positioning. (Replace placeholders accordingly.)

CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = '<master-ip-address>',
    SOURCE_USER = 'replication_user',
    SOURCE_PASSWORD = '<password>',
    SOURCE_AUTO_POSITION = 1;

Finally, start the replication threads:

START REPLICA;


	4.	(Optional) Disable Read-Only on the Replica
Once replication is verified, you can disable the read-only mode if the replica is intended to serve read queries:

SET GLOBAL read_only = OFF;

4. Verify Replication

On the replica server, check the replication status:

SHOW REPLICA STATUS\G

Look for key indicators:
	•	Slave_IO_Running and Slave_SQL_Running should both read Yes.
	•	The Executed_Gtid_Set field should be nonempty (indicating that transactions are being processed).

On the master, you can also check with:

SHOW MASTER STATUS;

Summary

In summary, the process on RHEL 9 for MySQL 8 default replication involves:
	1.	On the master:
– Setting a unique server ID, enabling binary logging and GTID mode, and creating a replication user.
	2.	On the replica:
– Setting its own unique server ID, enabling similar GTID settings, and configuring the replication connection using the CHANGE REPLICATION SOURCE TO command with SOURCE_AUTO_POSITION=1.
	3.	Starting replication and then verifying that the replica is in sync with the master.

This approach leverages MySQL 8’s built-in GTID functionality to simplify replication management and improve consistency.

For detailed, step‐by‐step instructions, you may refer to the Red Hat Enterprise Linux documentation on “Replicating MySQL”  ￼ and related articles on setting up MySQL master–slave replication on RHEL-based systems  ￼.

Following these steps should give you a robust, GTID-based replication setup on RHEL 9 with MySQL 8.