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

def server_connected():
    x = 255
    for n in range(2):
        for i in range(24):
            for j in range(i+1):
                xy = conv_coords(j)
                uh.set_pixel(xy[0], xy[1], x, x, x)
            xy = conv_coords(i)
            uh.set_pixel(xy[0], xy[1], 0, 255, 0)
            uh.show()
            time.sleep(0.02)
        x = 0
    uh.off()


def rainbow():
    r, g, b = 255, 0, 0
    inc = 0
    x = 0
    while True:
        for i in range(24):
            xy = conv_coords(i + x)
            if (i % 8) in range(1,4): inc = 1
            elif (i % 8) in range(5, 8): inc = 2
            else: inc = 0
            if i/8 == 0:
                if inc == 1: g += 85
                elif inc == 2: r -= 85
            elif i/8 == 1:
                if inc == 1: b += 85
                elif inc == 2: g -= 85
            elif i/8 == 2:
                if inc == 1: r += 85
                elif inc == 2: b -= 85
            uh.set_pixel(xy[0], xy[1], r, g, b)
        uh.show()
        x += 1
        time.sleep(0.07)
    # uh.off()

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
