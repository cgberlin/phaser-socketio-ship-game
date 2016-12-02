# 2 Player Asteroid Ships
## A multiplayer web game using PhaserJS and Nodejs.

Landing Screen        			     |  Waiting Lobby
:-----------------------------------:|:-----------------------------------:
![](http://i.imgur.com/ZYKy7DC.png)  |  ![](http://i.imgur.com/SN6VfZu.png)

## Introduction
I built this game as a proof of concept and demonstration for multiplayer gaming
using only socket.io, PhaserJS, nodeJS, and a little bit of jQuery. Right now
it will work for 2 players. For testing with yourself you can just open two tabs
in your browser to trick the server. 

Instructions Panel        			 |  Ingame Screenshot
:-----------------------------------:|:-----------------------------------:
![](http://i.imgur.com/JP26Hge.png)  |  ![](http://i.imgur.com/AvbP9nk.png)

## UX
Right now it will only work in non-mobile or tablet browsers because of the current
control scheme. I have plans to eventually add a virtual joystick when mobile browsers 
are detected. 

Firing Bullet Screenshot       		 |	   
:-----------------------------------:|
![](http://i.imgur.com/L7GWzUv.png)  |

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