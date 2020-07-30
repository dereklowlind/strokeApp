import json
import re

text_file_right = open("testDataArduino/accel1.txt", "r")
lines_right = text_file_right.readlines()

text_file_left = open("testDataArduino/accel2.txt", "r")
lines_left = text_file_left.readlines()

# for i in range(len(lines_right)):
#     lines_right[i] = lines_right[i].strip()

# for i in range(len(lines_left)):
#     lines_left[i] = lines_left[i].strip()
    
# print(len(lines))
output_format = {}
output_format["data"] = {}


leftPhone = []
rightPhone = []

# first data entry is at line 6
for i in range(5, len(lines_right)):
    # print(i)
    pattern = "^X: (.*?), Y: (.*?), Z: (.*?) "
    re_left = re.search(pattern, lines_left[i])
    re_right = re.search(pattern, lines_right[i])
    if not re_left: break
    leftPhone.append([0, re_left.group(1), re_left.group(2), re_left.group(3)])
    rightPhone.append([0, re_right.group(1), re_right.group(2), re_right.group(3)])

output_format["data"]["leftPhone"] = json.dumps(leftPhone)
output_format["data"]["rightPhone"] = json.dumps(rightPhone)
print(output_format)

out_file = open("testDataArduino/hw1hw2.json", "w")
json.dump(output_format, out_file)