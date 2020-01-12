
# ----------------------------------- color -----------------------------------
colors = [
    'BLACK',
    'GRAY',
    'WHITE',
    'RED',
    'ORANGE',
    'YELLOW',
    'GREEN',
    'BLUE',
    'PURPLE',
    'PINK',
    'LIGHT_BLUE',
    'YELLOW_GREEN',
    'SILVER',
    'GOLD',
]


for color in colors:
    # print(f"{color.upper()} = '{color.capitalize()}', ")
    print(f"{color.upper()} = '{color.lower()}', ")

# ----------------------------------- width cm -----------------------------------
wid_start = 50 # 5cm
wid_end = 200 # 20cm
 
for wid in range(wid_start, wid_end, 5):
    print(f'W_{str(wid).zfill(3)} = "{str(wid/10).zfill(4)}",')
print()

# ----------------------------------- width m -----------------------------------
wid_start = 10 # 1m
wid_end = 200 # 20m
 
for wid in range(wid_start, wid_end, 10):
    print(f'W_{str(wid).zfill(3)} = "{str(wid/10).zfill(4)}",')
print()
