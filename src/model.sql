CREATE TABLE users
(
	id serial PRIMARY KEY,
	banished boolean DEFAULT FALSE,
	password varchar(88) NOT NULL,
	name varchar(32),
	surname varchar(32),
	alias varchar(16) UNIQUE NOT NULL,
	email varchar(255) UNIQUE NOT NULL,
	rank int,
	date_join date,
	session_keys varchar(8)[] DEFAULT ARRAY[]::VARCHAR(8)[]
);

CREATE TABLE posts
(
	id text PRIMARY KEY,
	author_id int references users(id),
	title varchar(128) NOT NULL,
	content text[] NOT NULL,
	cover text NOT NULL,
	gallery text[] DEFAULT ARRAY[]::TEXT[],
	gallery_position int[] DEFAULT ARRAY[]::INT[],
	tags varchar(32)[] DEFAULT ARRAY[]::VARCHAR(32)[],
	comment_count int DEFAULT 0,
	like_count int DEFAULT 0,
	date_created timestamp
);

CREATE TABLE comments
(
	id serial PRIMARY KEY,
	author_id int references users(id),
	post_id text references posts(id),
	content text[] NOT NULL,
	date_created timestamp
);

CREATE TABLE likes
(
	id serial PRIMARY KEY,
	author_id int references users(id),
	post_id text references posts(id)
);

CREATE TABLE banishments
(
	email varchar(255) PRIMARY KEY,
	reason text,
	date timestamp NOT NULL,
	judge int references users(id)
);

CREATE TABLE tags
(
	id serial PRIMARY KEY,
	tag text UNIQUE NOT NULL,
	count int NOT NULL,
	updated_date timestamp NOT NULL
);