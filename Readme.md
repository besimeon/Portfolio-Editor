# Portfolio Editor
------------------
( current version: 1.0 )
This project was created to serve as a backend for a software developer portfolio. It allows you to input project title, display order, project description, project image url, and project languages. 

Languages & technologies used:
- NodeJS
- ExpressJS
- Oauth2.0
- Google Oauth2.0 API
- MongoDB
- Mongoose
- PUG (formerly known as 'Jade')
- PassportJS
- Helmet


## Table of Contents
--------------------
- [Prerequisites](#prerequisites)
- [Local Install](#localInstall)
- [Release Schedule](#releaseSchedule)


## Prerequisites
----------------
- NodeJS envoirnment with expressJS installed.
- MongoDB free account (minimum) with a configured store.
- Google account with Oauth2 credentials created via Google Developer Console.


## Local Install
----------------
Note: instructions will be fleshed-out further in v1.0.
- create local directory
- install the following node modules: 
	- express application builder
	- mongoose
	- morgan
	- helmet
	- http-errors
	- pug
	- passport
	- passport-google-oauth20
- build new express application via the express application builder
- copy the contents of Portfolio Editor to your local directory
- create config.json with the following contents:
	```
		{
			"mongoDB": "your mongoDB connection string",
			"sessionSecret": "your secret",
			"google": {
				"clientID": "your google client id",
				"clientSecret": "your google client secret"
			}
		}
	```
- run the application via npm in normal or debug mode
- open browser and navigate to localhost:3000


## Release Schedule
-------------------
- Beta: barebones input with MongoDB connectivity
- Version 1.0: 
	- Authentication and protected routes using:
		- Oauth2 utilizing passportJS + Google Strategy
- Version 1.1: 
	- Session persistence using "session-file-store" for express  
- Version 1.2: 
	- Session persistence using mongoDB database as the session store