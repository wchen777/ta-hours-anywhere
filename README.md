# TA Hours Anywhere

Here is the demo of the prototype: [video link](https://vimeo.com/496558423)

## Prerequisites

### Node 
 
you definitely have this already

### MySQL

[MySQL installation](https://dev.mysql.com/downloads/mysql/) 

also installing the MySQL workbench or the cli helps a lot

you will also want to setup a connection in the MySQL workbench matching the username and password found in the backend package.json

[The first minutes of this tutorial will help you](https://www.youtube.com/watch?v=7S_tz1z_5bA&t=1075s)

### Sequelize 

we want this cli globally (-g tag), so run 

```
npm install -g sequelize-cli
```

### Any code editor of your choice

personally i used VSCode, but it is up to you
## Installation


after git cloning, in both client and backend directories, run
```
npm install
```
to install all dependencies from the package.json

## Getting DB setup 

i'm not sure if this will work as I haven't tested it:

create a new database by going into MySQL Workbench or the cli and running the following command:

```
create database ta_hours_anywhere_dev;
```

you can verify that it is created with: 

```
show databases;
```

must be the specified name as this is what is specified as the dev db in the config.json in config directory 

next, in order to setup up our db with the right schema, we need to use sequelize-cli to migrate it.
cd into the backend directory and run the following command:

```
sequelize db:migrate
```

if this or any of the above steps don't work (i'm most likely missing something), please message me (Will) and I can try and troubleshoot

## Running the app

in one terminal window, cd into backend and run 
```
npm run dev
```
to start an instance of the server running on port 4000
this will also open up an instance of Apollo Playground if you go to the localhost on this port

in another terminal window, cd into client and run 

```
npm start
```
to start the React app
make sure the server is running at all times when using the client, or the client will crash!

happy coding!
