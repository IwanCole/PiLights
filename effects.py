import unicornhat as uh
import random, time

def conv_coords( i ):
    if i < 0 or i >= 24:
        return conv_coords(i % 24)
    elif i in range(8):
        return (0, i)
    elif i >= 16:
        return (2, (i%8))
    else:
        return (1, 7-(i%8))


# Convert HEX -> rbg e.g FFFFFF -> 255,255,255
def hex_rgb(hexColour):
    r = int(hexColour[0:2], 16)
    g = int(hexColour[2:4], 16)
    b = int(hexColour[4:6], 16)
    return (r, g, b)

# Convert rgb -> HEX
def rgb_hex(r, g, b):
    preHex = [hex(r).replace("0x",""), hex(g).replace("0x",""), hex(b).replace("0x","")]
    outHex = ""
    for i in range(3):
        if len(preHex[i]) == 1: outHex += ("0" + preHex[i])
        else: outHex += preHex[i]
    return outHex


def server_connected():
    v = 255
    for n in range(2):
        for i in range(24):
            for j in range(i+1):
                (x, y) = conv_coords(j)
                uh.set_pixel(x, y, v, v, v)
            (x, y) = conv_coords(i)
            uh.set_pixel(x, y, 0, 255, 0)
            uh.show()
            time.sleep(0.02)
        v = 0
    uh.off()


def rainbow_hue():
    col = [255, 0, 0]
    target, change = 1, 1
    while True:
        for i in range(24):
            (x, y) = conv_coords(i)
            uh.set_pixel(x, y, col[0], col[1], col[2])
        col[target] += change * 4
        if col[target] == -1 or col[target] == 256: col[target] -= change
        if col[target] in [0, 255]:
            target = (target - 1) % 3
            change *= -1
        uh.show()
        time.sleep(0.03)


def rainbow_swirl():
    r, g, b = 255, 0, 0
    inc, offset = 0, 0
    while True:
        for i in range(24):
            (x, y) = conv_coords(i + offset)
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
            uh.set_pixel(x, y, r, g, b)
        uh.show()
        offset += 1
        if offset == 24: offset = 0
        time.sleep(0.07)


def fire():
    while True:
        r, g, b = 255, 125, 20
        (x, y) = conv_coords(random.randint(0,23))
        rnd = random.randint(0, 150)
        r1, g1, b1 = int(r-(0.7*rnd)), int(g-(0.9*rnd)), b-rnd
        if b1 < 0: b1 = 0
        if g1 < 0: g1 = 0
        uh.set_pixel(x, y, r1, g1, b1)
        uh.show()
        time.sleep(random.uniform(0.01, 0.02))


def water():
    while True:
        for i in range(24):
            for j in range(24):
                (x, y) = conv_coords(j)
                uh.set_pixel(x, y, 0, 0, 140)
            (x, y) = conv_coords(i+3)
            uh.set_pixel(x, y, 0, 165, 132)
            (x, y) = conv_coords(i+15)
            uh.set_pixel(x, y, 0, 165, 132)
            for k in range(3):
                xy1 = conv_coords(0 + k + i)
                xy2 = conv_coords(12 + k + i)
                uh.set_pixel(xy1[0], xy1[1], 30, 120-(k*15), 255-(k*20))
                uh.set_pixel(xy2[0], xy2[1], 30, 120-(k*15), 255-(k*20))
            uh.show()
            time.sleep(random.uniform(0.06, 0.11))


def tree():
    vals = ['00ff33', '00ff22', '00ff16', '00ff11', '00ff06', '06ff06', '00ff00', '06ff00', '11ff00', '16ff00', '22ff00', '33ff00', '44ff00', '55ff00', '66ff00', '99ff00', 'ddff00']
    for j in range(24):
        (x, y) = conv_coords(j)
        (r, g, b) = hex_rgb(vals[random.randint(0,len(vals)-1)])
        uh.set_pixel(x, y, r, g, b)
        uh.show()
        time.sleep(0.01)
    while True:
        for i in range(24):
            (x, y) = conv_coords(i)
            (r, g, b) = uh.get_pixel(x, y)
            oldHex = rgb_hex(r, g, b)
            newHex = vals[(vals.index(oldHex) + 1) % len(vals)]
            (r, g, b) = hex_rgb(newHex)
            uh.set_pixel(x, y, r, g, b)
        uh.show()
        time.sleep(0.07)


def sunrise(speed):
    if speed == 0: tick = 1.31
    else: tick = 0.02
    uh.brightness(1)
    bright = 0.1
    def sunrise_helper(steps, bri, r, g, b, extra):
        for i in range(steps):
            for j in range(12):
                (x1, y1) = conv_coords(j)
                (x2, y2) = conv_coords(23-j)
                uh.set_pixel(x1, y1, int(r*bri), int(g*bri), int(b*bri))
                uh.set_pixel(x2, y2, int(r*bri), int(g*bri), int(b*bri))
                uh.show()
                time.sleep(tick)
            if extra:
                g += 8
                if g == 256: g = 255
                if g >= 176: b += 6
                if i in set(range(32)) - set(range(20)): bri += 0.05
            else: bri += 0.05

    sunrise_helper(3,  0.1,  50,  50, 255, False)
    sunrise_helper(3,  0.25, 10,  10, 255, False)
    sunrise_helper(32, 0.4,  255, 0,  0,   True)
    time.sleep(600)
    uh.off()


def main():
    print("Wrong function!")


if __name__ == "__main__":
    main()
