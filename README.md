PiLights Smart Lights
===================


Smart Lights created using a Raspberry Pi, NeoPixel LEDs, NodeJS and Python.

----------

Responsive Web Interface
------

Once setup on a Pi connected to your local network, locate the Pi's IP and connect to it from a mobile browser on port 8080 by default. Passcode required to prevent others on the same network from controlling the lights, default is *1234*. This can be changed in *server.js*

The entire web interface is stored within one html file, and navigation is done using JS to hide and reveal sections as appropriate. Even though the passcode screen can be bypassed using DevTools, all POST requests require authentication details stored in a session cookie. These authentication details are obtained by correctly entering the passcode. A server session ID is also stored, requiring users to re-authenticate on server restart. 

Errors are handled by blocking the user from further interaction, and prompting them with potential solutions. Authentication errors, non responding server, and bad data errors are handled.

![Home page UI](https://github.com/IwanCole/PiLights/blob/master/readme_images/home.png)

![Server Down Error](https://github.com/IwanCole/PiLights/blob/master/readme_images/error1.png)

![Expired Auth Error](https://github.com/IwanCole/PiLights/blob/master/readme_images/error2.png)


Solid Colours, Effects and Sunrise Alarms
------

