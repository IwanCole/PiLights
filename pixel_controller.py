from multiprocessing import Process, Queue, Lock
import unicornhat as uh
import sys, time, zmq, json, effects


# Convert co-ords to work with a 1*24 ring instead of a 8*8 matrix of LEDs
def conv_coords( i ):
    if i < 0 or i >= 24:
        return conv_coords(i % 24)
    elif i in range(8):
        return (0, i)
    elif i >= 16:
        return (2, (i%8))
    else:
        return (1, 7-(i%8))


# Print without overlap
def multi_print(string, lock):
    lock.acquire()
    print(string)
    lock.release()

# Test NeoPixel ring
def start_pixel():
    vals = [[255,0,0] ,[0,255,0], [0,0,255], [255,255,255], [0,0,0]]
    for val in vals:
        for i in range(24):
            (x, y) = conv_coords(i)
            uh.set_pixel(x, y, val[0], val[1], val[2])
            uh.show()
            time.sleep(0.02)


# Set the brightness of the LEDs
def update_brightness(value):
    newLevel = float(value.replace("b",""))
    increment = (uh.get_brightness() - newLevel) / 6
    for i in range(6):
        uh.brightness(uh.get_brightness() - increment)
        uh.show()
        time.sleep(0.02)
    uh.brightness(newLevel)
    uh.show()


# Send new colour to NeoPixel and display
def set_pixels(hexColour):
    # Error handling: if for some reason UH fails, it doesn't crash everything
    # try:
    (r, g, b) = effects.hex_rgb(hexColour)
    for i in range(24):
        (x, y) = conv_coords(i)
        uh.set_pixel(x, y, r, g, b)
        uh.show()
        time.sleep(0.02)
        # return True
    # except Exception as e: return e


def pixel_effect(value):
    if value == "x1":
        effects.fire()
    elif value == "x2":
        effects.water()
    elif value == "x3":
        effects.tree()
    elif value == "x4":
        effects.rainbow_swirl()
    elif value == "x5":
        effects.rainbow_hue()
    elif value == "START":
        effects.server_connected()


# Listen for requests coming from the pixel_handler (from node)
def pixel_listener(queue, lock):
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind("tcp://*:5555")
    multi_print("Listening on port 5555...", lock)
    while True:
        message = socket.recv()
        multi_print("Received request: \n" + message, lock)
        message = message.replace("u'","\"").replace("'","\"")
        reqObj = json.loads(message)
        requestType = int(reqObj['type'])

        queue.put(reqObj)
        socket.send(str('{"success":"true","type":"'+ reqObj['type'] +'","data":"'+ reqObj['value'] +'"}'))


def start_effect(effect):
    procEffect = Process(target=pixel_effect, args=(effect,))
    procEffect.start()
    return procEffect, True


# Wait for a new request to appear on the queue. If it is a static colour (type 0)
# then set the colour and wait for a new request. Effects have animations, which
# require a while True loop to animate, so spawn a new process to handle the
# animation, and terminate this process when a new request appears on the queue.
def pixel_lights(queue, lock):
    multi_print("Starting neopixel LEDs...", lock)
    start_pixel()
    uh.brightness(1)
    effectInProgress = False
    currentVal = "000000"
    while True:
        request = queue.get(True)
        value = request['value'] # type String
        reqType = int(request['type'])
        multi_print(str(request['iid']) + " has requested " + value + " of type " + str(reqType), lock)

        if effectInProgress:
            procEffect.terminate()
            effectInProgress = False

        if reqType == 0:
            currentVal = value
            set_pixels(value)
        elif reqType == 2:
            if currentVal[0] == "x": uh.clear()
            update_brightness(value)
            if currentVal[0] == "x":
                procEffect, effectInProgress = start_effect(currentVal)
            else: set_pixels(currentVal)

        elif reqType == 3:
            pixel_effect(value)
        else:
            currentVal = value
            procEffect, effectInProgress = start_effect(currentVal)


# Start the listener and manager, use a queue to communicate
def main():
    print("\n\n--- Pixel Controller ---")
    q = Queue()
    l = Lock()
    procListen = Process(target=pixel_listener, args=(q, l))
    procLight = Process(target=pixel_lights, args=(q, l))
    procListen.daemon = True
    procListen.start()
    procLight.start()
    procListen.join()

if __name__ == "__main__":
    main()
