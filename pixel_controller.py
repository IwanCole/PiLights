from multiprocessing import Process, Queue, Lock
import unicornhat as uh
import sys, time, zmq, json, effects

# Convert co-ords to work with a 1*24 ring instead of a 8*8 matrix of LEDs
def conv_coords( i ):
    if i < 0:
        return conv_coords(24 + i)
    elif i >= 24:
        return conv_coords(i - 24)
    elif i in range(8):
        return [0, i]
    elif i >= 16:
        return [2, (i%8)]
    else:
        return [1, 7-(i%8)]


# Print without overlap
def multi_print(string, lock):
    lock.acquire()
    print(string)
    lock.release()

# Test NeoPixel ring
def start_pixel():
    vals = [[255,0,0] ,[0,255,0], [0,0,255], [255,255,255]]
    for val in vals:
        for i in range(24):
            xy = conv_coords(i)
            uh.set_pixel(xy[0], xy[1], val[0], val[1], val[2])
            uh.show()
            time.sleep(0.02)
    uh.off()

# Convert HEX -> rbg e.g FFFFFF -> 255,255,255
def hex_rgb(hexColour):
    r = int(hexColour[0:2], 16)
    g = int(hexColour[2:4], 16)
    b = int(hexColour[4:6], 16)
    return (r, g, b)


# Send new colour to NeoPixel and display
def set_pixels(hexColour):
    # Error handling: if for some reason UH fails, it doesn't crash everything
    # try:
    (r, g, b) = hex_rgb(hexColour)
    for i in range(24):
        xy = conv_coords(i)
        uh.set_pixel(xy[0], xy[1], r, g, b)
    uh.show()
        # return True
    # except Exception as e: return e


def pixel_effect(value):
    if value == 000001:
        effects.fire()
    elif value == 000002:
        effects.water()

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
        # if (reqObj['iid'] != 0):
        queue.put(reqObj)
        socket.send("Success")
        # else:
            # (r, g, b) = uh.get_pixel(0,0)
            # currentHex = (str(hex(r)) + str(hex(g)) + str(hex(b))).replace("0x","")
            # socket.send(currentHex)
            # TODO



def pixel_lights(queue, lock):
    multi_print("Starting neopixel LEDs...", lock)
    start_pixel()
    uh.brightness(1)
    effectInProgress = False
    while True:
        request = queue.get(True)
        if effectInProgress:
            p3.terminate()
            # uh.off()

        value = request['value']
        multi_print(str(request['iid']) + " has requested " + request['value'] + " of type " + str(request['type']), lock)
        print(type(request['type']))
        print request['type']
        if int(request['type']) == 0:
            multi_print("WooHoo!", lock)
            set_pixels(request['value'])
            multi_print("Woo222!", lock)

        else:
            p3 = Process(target=pixel_effect, args=(int(request['value']),))
            effectInProgress = True
            p3.start()





# Start the listener and manager, use a queue to communicate
def main():
    print("\n\n--- Pixel Controller ---")
    q = Queue()
    l = Lock()
    p1 = Process(target=pixel_listener, args=(q, l))
    p2 = Process(target=pixel_lights, args=(q, l))
    p1.daemon = True
    # p2.daemon = True
    p1.start()
    p2.start()
    p1.join()
    p2.join()

if __name__ == "__main__":
    main()
