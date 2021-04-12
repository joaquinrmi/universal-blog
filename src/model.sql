CREATE TABLE users
(
	id serial PRIMARY KEY,
	password varchar(88) NOT NULL,
	name varchar(32),
	surname varchar(32),
	alias varchar(16) UNIQUE NOT NULL,
	email varchar(255) UNIQUE NOT NULL,
	class int,
	date_join date,
	session_keys varchar(8)[] DEFAULT ARRAY[]::VARCHAR(8)[]
);

CREATE TABLE posts
(
	id serial PRIMARY KEY,
	author_id int references users(id),
	title varchar(128) NOT NULL,
	content text[] NOT NULL,
	tags varchar(32)[] DEFAULT ARRAY[]::VARCHAR(32)[],
	comment_count int DEFAULT 0,
	like_count int DEFAULT 0,
	date_created timestamp
);

CREATE TABLE comments
(
	id serial PRIMARY KEY,
	author_id int references users(id),
	post_id int references posts(id),
	content text[] NOT NULL,
	date_created timestamp
);