import sys, json, zmq, time

def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def main(args):
    lines = read_in()
    context = zmq.Context()
    socket = context.socket(zmq.REQ)
    socket.connect("tcp://localhost:5555")
    socket.send(str(lines))

    #  Get the reply.
    message = socket.recv()
    print(message)

if __name__ == "__main__":
    main(sys.argv)
