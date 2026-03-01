Follow these instructions for setting up your environment with Docker. The environment contains the DBMSs required in the course. This is the recommended approach for practical work. The shell prompt (e.g., $) at the beginning of each command indicates in which environment the command should be executed. For example, $ indicates OS shell, and => PostgreSQL's psql shell (normal user).

1. Install Docker (or Docker Desktop).

2. After installing, verify the installation, e.g. with:

$ docker --version 
$ docker compose version

3. Download the file nosql-lab (under this Moodle section) compressed file and uncompress it.

Preferably, use a local path for the uncompressed folder, and without special characters. Using a cloud service path or special characters can cause problems with Docker.

4. Navigate to the folder nosql-lab and start all containers in the background:

$ docker compose up -d

5. In your nosql-lab folder, test that PostgreSQL works:

$ docker exec -it postgres_lab psql -U student -d labdb

This will connect to your local PostgreSQL's psql shell with the pre-created student account, and to the pre-created labdb database.

After successful connection, you should see psql's prompt starting with labdb=#, where # indicates that you are logged in as PostgreSQL superuser.

Quit psql with

=# \q

6. In your nosql-lab folder, test that Cassandra works:

$ docker exec -it cassandra_lab cqlsh

This will connect to your local Cassandra's cqlsh shell.

After successful connection, you should see cqlsh's prompt starting with cqlsh>.

Quit cqlsh with

cqlsh> quit

7. In your nosql-lab folder, test that MongoDB works:

$ docker exec -it mongo_lab mongosh

This will connect to your local MongoDB's mongosh shell.

After a successful connection, you should see log information and mongosh's prompt starting with test>, indicating that you are connected to a database named test.

Quit mongosh with

test> quit

8. See which containers are running and stop them:

$ docker ps

$ docker stop <container name>

In case you made changes to the databases, the data persists with the commands above. Nevertheless, if you make "worthwhile" modifications to your databases, you should keep a backup somewhere outside the container in case something happens.