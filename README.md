PiLights Smart Lights
===================


Smart Lights created using a Raspberry Pi, NeoPixel LEDs, NodeJS and Python.



Responsive Web Interface
------

Once setup on a Pi connected to your local network, locate the Pi's IP and connect to it from a mobile browser on port 8080 by default. Passcode required to prevent others on the same network from controlling the lights, default is *1234*. This can be changed in *server.js*

The entire web interface is stored within one html file, and navigation is done using JS to hide and reveal sections as appropriate. Even though the passcode screen can be bypassed using DevTools, all POST requests require authentication details stored in a session cookie. These authentication details are obtained by correctly entering the passcode. A server session ID is also stored, requiring users to re-authenticate on server restart. 

Errors are handled by blocking the user from further interaction, and prompting them with potential solutions. Authentication errors, non responding server, and bad data errors are handled.

Home Page UI, Server Down Error, and Expired Authentication Error

<img src="https://github.com/IwanCole/PiLights/blob/master/readme_images/home.png" width="250"> <img src="https://github.com/IwanCole/PiLights/blob/master/readme_images/error1.png" width="250"><img src="https://github.com/IwanCole/PiLights/blob/master/readme_images/error2.png" width="250">



Solid Colours, Effects and Sunrise Alarms
------

The NeoPixel LEDs have 3 8-bit colour channels, so can display a full RBG spectrum. The web interface includes a section for preset basic colours, with the ability to long press on a colour to reveal a more granular choice of related colours. Effects are simple animations displayed on the LEDs, and include a fire, forest canopy, and rainbow effects. Alarms allow the user to set a sunrise effect that will start at a set time on a set day, gradually increasing in brightness to wake the user up in the morning. Alarms are currently a work in progress.

<img src="https://github.com/IwanCole/PiLights/blob/master/readme_images/colours.png" width="200"><img src="https://github.com/IwanCole/PiLights/blob/master/readme_images/detailed.png" width="200"><img src="https://github.com/IwanCole/PiLights/blob/master/readme_images/effects.png" width="200"><img src="https://github.com/IwanCole/PiLights/blob/master/readme_images/alarm.png" width="200">

NodeJS and Python backend
------
Provided correct authentication information is present, all user intents are sent from the client to the server using a POST request. This contains client details, request type and auth details. Node validates all data received in the request before handling it. Requests that directly control the LEDs such as colours, effects and brightness spawn a Python child process that uses ZeroMQ to communicate with the main Python LED controller. These child processes terminate after a short period of time if the main Python controller doesn't respond. This is to ensure the system doesn't fill with idling processes waiting to send a request to the LEDs.

The Python LED controller uses multiprocessing to continually listen for requests and process them simultaneously. It listens on a socket for incoming requests from the child processes, and uses request IDs to handle the order in which they are processed. Multiprocessing locks are used when writing to external logs to prevent jumbled messages from being written. The Python module Unicornhat has built in functions for accessing the LEDs, and this is used extensively for controlling the NeoPixel.


Setup and Requirements
------
Assuming a NeoPixel LED Ring (24 LEDs) is used, connect the power and ground to the 5V and GND pins on the Pi, and the Data-In to pin 18 (GPIO PWM) on the Pi. 
Start the python controller with elevated privileges, and then in a separate terminal start the node server.

 ``` $ sudo python pixel_controller.py ```
 
 ``` $ node server.js ```


Requirements:

 - Python 2.7.x
	 - zmq
	 - json
	 - multiprocessing
	 - time
	 - unicornhat
	 - random
 - NodeJS 6.9.4+
 - NPM 3.10.10+
	- body-parser
	- child_process
	- js-cookie
	- express
	- connect
	- ip

Unicornhat may require installation of further dependencies. 

------
