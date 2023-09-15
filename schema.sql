CREATE DATABASE notes3d_app;
USE notes3d_app;

CREATE TABLE users (
    id integer PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (username, password)
VALUES
("Anna", "passwort123"),
("Berta", "123qweasdzxc"),
("Charlie", "passwort123"),
("Donald", "123qweasdzxc"),
("Ebert", "passwort123"),
("Frida", "123qweasdzxc");