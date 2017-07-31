import sys, json, zmq, time

def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def main(args):
    lines = read_in()
    context = zmq.Context()
    socket = context.socket(zmq.REQ)
    # socket.setsockopt(zmq.LINGER, 1500)
    # try:
    socket.connect("tcp://localhost:5555")
    socket.send(str(lines)) #, zmq.DONOTWAIT
    # try:
    message = socket.recv()
    print(message)

    # except:
    #     #  Get the reply.
    # # except:
    #     print("OOOLLALALALaLALAA")
    #
    # socket.close()
    # context.term()


if __name__ == "__main__":
    main(sys.argv)
