Create a container in the background. This is needed only for the first run:

$ docker compose up -d postgres (or mongodb or cassandra)

Create all containers in the background:

$ docker compose up -d

Stop a container (data persists):

$ docker stop <container name>

Start a stopped container that has been previously created:

$ docker start <container name>

Connect to a running container (choose which DBMS shell you need):

$ docker exec -it postgres_lab psql -U student -d labdb
$ docker exec -it mongo_lab mongosh
$ docker exec -it cassandra_lab cqlsh

Show what is running:

$ docker ps

Show what is running and not running:

$ docker ps -a

Create container (postgres) with logs (for debugging):

$ docker compose up postgres