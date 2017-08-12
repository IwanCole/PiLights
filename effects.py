import unicornhat as uh
import random
import time

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


def fire():
    while True:
        r, g, b = 255, 165, 40
        xy = conv_coords(random.randint(0,23))
        rnd = random.randint(0, 150)
        r1, g1, b1 = r-rnd, g-rnd, b-rnd
        if b1 < 0: b1 = 0
        uh.set_pixel(xy[0], xy[1], r1, g1, b1)
        uh.show()
        time.sleep(random.uniform(0.01, 0.02))

def water():
    while True:
        for i in range(24):
            for j in range(24):
                xy = conv_coords(j)
                uh.set_pixel(xy[0], xy[1], 0, 0, 140)
            xy = conv_coords(i+3)
            uh.set_pixel(xy[0], xy[1], 0, 165, 132)
            xy = conv_coords(i+15)
            uh.set_pixel(xy[0], xy[1], 0, 165, 132)
            for k in range(3):
                xy1 = conv_coords(0 + k + i)
                xy2 = conv_coords(12 + k + i)
                uh.set_pixel(xy1[0], xy1[1], 30, 120-(k*15), 255-(k*20))
                uh.set_pixel(xy2[0], xy2[1], 30, 120-(k*15), 255-(k*20))
            uh.show()
            time.sleep(random.uniform(0.06, 0.11))


def main():
    print("Wrong function!")


if __name__ == "__main__":
    main()
