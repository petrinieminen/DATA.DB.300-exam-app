This answer will use Python, psycopg, and a simple CLI to demonstrate data retrieval and inserts using the title_basics table created for earlier exercises. This can serve as a boilerplate for new additions or modifications like vector or fuzzy search, or for new functionality.

Program
import psycopg

DB_CONFIG = {
    "host": "localhost",
    "dbname": "labdb",
    "user": "student",
    "password": "student",
}

def connect():
    return psycopg.connect(**DB_CONFIG)

def search_movies(conn):
    keyword = input("Enter keyword to search for: ").strip()

    sql = """
        SELECT id, primarytitle, startyear, runtimeminutes
        FROM title_basics
        WHERE titletype = 'movie'
          AND primarytitle ILIKE %s # case-insensitive LIKE & a bind parameter
        ORDER BY startyear NULLS LAST
        LIMIT 20;
    """

    with conn.cursor() as cur:
        cur.execute(sql, (f"%{keyword}%",))
        rows = cur.fetchall()

    if not rows:
        print("No movies found.")
        return

    print("\nResults:")
    for row in rows:
        print(
            f"ID: {row[0]} | "
            f"Title: {row[1]} | "
            f"Year: {row[2]} | "
            f"Runtime: {row[3]}"
        )

def add_movie(conn):
    print("\nAdd a new movie")
    title = input("Title: ").strip()
    year = input("Start year (or leave empty): ").strip()
    runtime = input("Runtime minutes (or leave empty): ").strip()

    year = year if year else None
    runtime = runtime if runtime else None

    sql = """
        INSERT INTO title_basics (titletype, primarytitle, startyear, runtimeminutes)
        VALUES ('movie', %s, %s, %s);
    """

    with conn.cursor() as cur:
        cur.execute(sql, (title, year, runtime))
        conn.commit()

    print("Movie added successfully.")

def main():
    print("Movie CLI (PostgreSQL)")
    print("======================")

    try:
        conn = connect()
    except Exception as e:
        print("Failed to connect to database:", e)
        return

    with conn:
        while True: # conn is a context manager: connection closes when user chooses "quit"
            print("\nMenu")
            print("1. Search for movies")
            print("2. Add a new movie")
            print("3. Quit")

            choice = input("Choose an option: ").strip()

            if choice == "1":
                search_movies(conn)
            elif choice == "2":
                add_movie(conn)
            elif choice == "3":
                print("Goodbye!")
                break
            else:
                print("Invalid choice.")

if __name__ == "__main__":
    main()
Setup
Connect to the container's shell:

$ docker exec -it postgres_lab bash

Install required software. Note that these commands will install the software system-wide. If you're not using Docker, consider using a virtual environment or similar.

$ apt update
$ apt install python3
$ apt install python3-psycopg
$ apt install nano

Open the nano text editor:

$ nano movies_cli.py

Copy-paste the program (above) into the nano editor:

CTRL+O saves, CTRL+X quits

Test the application:

$ python3 movies_cli.py

Does it work? Can you read movie details (e.g., release year) from the database? Can you add movies? Do the changes persist?