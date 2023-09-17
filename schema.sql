CREATE DATABASE notes3d_app;
USE notes3d_app;

CREATE TABLE users (
    id integer PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE uploads (
    userKey VARCHAR(255) NOT NULL,
    note TEXT,
    fileName VARCHAR(255) PRIMARY KEY NOT NULL,
    originalFileName VARCHAR(255) NOT NULL,
    filePath VARCHAR(255) NOT NULL,
    fileSize VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE counter (
    count integer NOT NULL
);

INSERT INTO counter (count) VALUES (0);