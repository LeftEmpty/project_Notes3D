# Notes3D
App to upload, document, share and comment 3D meshes. University project made by Tom schmaeling for IU.

## Table of contents
[General info](#general-info)
[Technologies](#technologies)
[Setup](#setup)


## General Info
The target group is 3D studioes, Game Studios, etc.

The application is supposed to eliviate stress when communicating feedback on 3D meshes in a Team setting. The project is still missing proper UX design and user feedback. For now please look at the console logs for feedback.

### System Features
The system supports the creation of accounts, contact lists, uploading meshes, and adding notes to 3D models.
These are labeled as 'Uploads' and will be shared to the public by default, the system does not support visibility as of yet. A user can access another user's profile and view their uploads, including model and notes. They are not able to edit or delete them however.

As the project is a lot of features i might have to reduce the scope during phase 2 depending on how well development progresses.

### Cut Features
I have replaced the feature of placing 'note nodes' on the model itself for now with a simpler note taking system. This might change depending on whether the scope of the project as of now is deemed sufficient or not.

I also decided to forego the use of firebase in favor of writing a simpler custom mysql database setup.


## Technologies
Project is created with:
* Node.js
* MySQL
* Basic HTML(EJS) / CSS / JS
* API - model-viewer

All node modules used in this project:
* express
* express layout
* express session
* multer
* bcrypt
* passport


## Setup
### Download and install project requirements
To run this project, follow the setup guide below. The project requires that you have node.js and MySQL installed on your system.
* [download node.js](https://nodejs.org/en/download)
* [download mysql](https://www.mysql.com/downloads/)
* install node.js on your system
* install MySQL version 8.1 or above

### Setup MySQL Database
* run the following code in your MySQL command line client (can also be found in the 'schema.sql' file)

```
CREATE DATABASE notes3d_app;
USE notes3d_app;

CREATE TABLE users (
    id integer PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    company VARCHAR(255),
    contacts TEXT,
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE uploads (
    id integer PRIMARY KEY AUTO_INCREMENT,
    user VARCHAR(255) NOT NULL,
    FOREIGN KEY(user) REFERENCES users(username),
    note TEXT,
    fileName VARCHAR(255) NOT NULL,
    originalFileName VARCHAR(255) NOT NULL,
    filePath VARCHAR(255) NOT NULL,
    fileSize VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE counter (
    count integer NOT NULL
);

INSERT INTO counter (count) VALUES (0);
```

### Clone Repository
Clone the repository into an empty folder on your system, either via the github page or by using git bash:
```
git clone https://github.com/leftempty/project_notes3d.git
```

### Open the project
While you can most likely use any IDE, i strongly recommend VS Code to prevent any unforseen issues when testing this project.

### Setup your .env file
* create a '.env' file in the root directory
* copy the following template into the file
* fill in your mysql information following the template, leaving already set information as is
```
NODE_ENV= 'dev'

SESSION_SECRET= randomsecret        ;this is obviously just temporary (wouldnt be production ready)

PORT = '3333'

MYSQL_HOST='localhost'
MYSQL_ROOT=''
MYSQL_PASSWORD=''
MYSQL_DATABASE='notes3d_app'
```

### install node.js modules
Run the following code to install all the necessary modules that are used in this project
```
npm i express express-layout express-session ejs passport bcrypt multer
```

### Run the Project
We can now finally run the project using the following command:
```
npm run devStart
```
The terminal should now be labeled node and show the display the following:
```
> project_notes3d@1.0.0 devStart
> nodemon app.js

[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node app.js`
server is running on port 3333
```

You can now use the system by accessing http://localhost:3333/ in your browser.
I recommend google chrome or mozilla firefox.