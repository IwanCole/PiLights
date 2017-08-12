# Can't figure out how to stop ZMQ from blocking if no server socket is open
# to accept the message, so forcfully terminate the process after a timeout

from multiprocessing import Process, Queue, Lock
import sys, json, zmq, time

def timer(queue, lock):
    time.sleep(2)
    lock.acquire()
    queue.put(1)

def send_message(lines, queue, lock):
    context = zmq.Context()
    socket = context.socket(zmq.REQ)
    # socket.setsockopt(zmq.LINGER, 1500)
    socket.connect("tcp://localhost:5555")
    socket.send(str(lines)) #, zmq.DONOTWAIT
    message = socket.recv()
    lock.acquire()
    print(message)
    queue.put(0)
    lock.release()

def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def main(args):
    q, l = Queue(), Lock()
    lines = read_in()
    sender = Process(target=send_message, args=(lines, q, l))
    countdown = Process(target=timer, args=(q, l))
    sender.start()
    countdown.start()
    countdown.join()

    statuses = []
    while q.empty() == False:
        statuses.append(q.get(False))
    if 0 not in statuses:
        sender.terminate()
        print("Failure, timeout")
    else: pass

if __name__ == "__main__":
    main(sys.argv)
