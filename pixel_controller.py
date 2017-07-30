from multiprocessing import Process, Queue, Lock
# import unicornhat as uh
import sys, time, zmq, json

def multi_print(string, lock):
    lock.acquire()
    print(string)
    lock.release()

def pixel_listener(queue, lock):
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind("tcp://*:5555")
    multi_print("Listening on port 5555...", lock)
    while True:
        #  Wait for next request from client
        message = socket.recv()
        print("Received request: \n" + message)
        message = message.replace("u'","\"").replace("'","\"")
        reqObj = json.loads(message)
        queue.put(reqObj)

        socket.send(b"World")



def pixel_lights(queue, lock):
    multi_print("Starting neopixel LEDs...", lock)
    while True:
        request = queue.get(True)
        print(str(request['iid']) + " has requested " + request['value'])
        print("WooHoo!")


def main():
    print("\n\n--- Pixel Controller ---")
    q = Queue()
    l = Lock()
    p1 = Process(target=pixel_listener, args=(q, l))
    p2 = Process(target=pixel_lights, args=(q, l))
    p1.daemon = True
    p2.daemon = True
    p1.start()
    p2.start()
    p1.join()


if __name__ == "__main__":
    main()
