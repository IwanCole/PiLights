import sys, json, unicornhat as uh, time
# pixels 0  -> 7  accessed with 0,0 -> 0,7
# pixels 8  -> 15 accessed with 1,7 -> 1,0
# pixels 16 -> 23 accessed with 2,0 -> 2,2

# Take in the number of the LED
# Output corrected X and Y values
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

def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])    
    

def main(args):
    lines = read_in()
    print(lines)
    uh.brightness(1)
    for j in range(24):
        xy = conv_coords(j)
        uh.set_pixel(xy[0], xy[1], 150, 150, 150)
    uh.show()
    time.sleep(4)
    print("1")

if __name__ == "__main__":
    main(sys.argv)
