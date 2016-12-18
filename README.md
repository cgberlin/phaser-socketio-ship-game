# 2 Player Asteroid Ships
## A multiplayer web game using PhaserJS and Nodejs.

Landing Screen        			     |  Instructions Panel
:-----------------------------------:|:-----------------------------------:
![](http://i.imgur.com/qCQuxg6.jpg)  |  ![](http://i.imgur.com/5GxGiAa.jpg)

## Introduction
I built this game as a proof of concept and demonstration for multiplayer gaming
using only socket.io, PhaserJS, nodeJS, and a little bit of jQuery. For testing with yourself you can just open two tabs
in your browser to trick the server. 

Ingame Screenshot        			 |  Ingame Screenshot
:-----------------------------------:|:-----------------------------------:
![](http://i.imgur.com/SGpKPsN.jpg)  |  ![](http://i.imgur.com/1C28h7p.jpg)

## UX
Mobile support now up and running. Still a little rough around the edges, but controls are updated and working.

## Live Site
You can test and access the game at https://afternoon-caverns-49318.herokuapp.com/

## Technical
* The front-end is built using HTML5, CSS3, PhaserJS, and some jQuery; the back-end is built using NodeJS with ExpressJS as the web server, MongoDB as the database, and socket.io for the connections. 
* The app will keep track of user names and high scores, storing them in the MongoDB and retrieving them when needed. 
* All communication between the front and back end is done using socket.io. There are no end points other than the root, 
and no ajax calls whatsoever.
* Some jQuery was used to listen for click events and to hide, show, insert, and move parts of the DOM. 
* PhaserJS was used for the game/physics engine. 
* The app is deployed using Heroku.