import json

text_file = open("testDataArduino/armRecording.txt", "r")
lines = text_file.readlines()

for i in range(len(lines)):
    lines[i] = lines[i].strip()

# print(len(lines))
output_format = {}
output_format["data"] = {}


leftPhone = []
rightPhone = []

for i in range(0, len(lines), 3):
    # print(i)
    leftPhone.append([0, lines[i], lines[i+1], lines[i+2]])
    rightPhone.append([0, lines[i], lines[i+1], lines[i+2]])

output_format["data"]["leftPhone"] = json.dumps(leftPhone)
output_format["data"]["rightPhone"] = json.dumps(rightPhone)
print(output_format)

out_file = open("testDataArduino/armRecording.json", "w")
json.dump(output_format, out_file)