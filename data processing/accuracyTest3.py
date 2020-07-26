import numpy as np
import matplotlib.pyplot as plt
import json
from scipy import signal
import statistics

def lag_finder(y1, y2, sr, leftPhone, rightPhone):

    plt.figure(figsize=(20,10))
    plt.subplots_adjust(hspace=0.6)

    plt.subplot(5,1,1)
    plt.plot(leftPhone[:,0], color='orange', label='left')
    plt.plot(rightPhone[:,0], color='blue', label='right')
    plt.title("X")
    plt.ylabel('G')

    plt.subplot(5,1,2)
    plt.plot(leftPhone[:,1], color='green', label='left')
    plt.plot(rightPhone[:,1], color='purple', label='right')
    plt.title("Y")
    plt.ylabel('G')

    plt.subplot(5,1,3)
    plt.plot(leftPhone[:,2], color='orange', label='left')
    plt.plot(rightPhone[:,2], color='blue', label='right')
    plt.title("Z")
    plt.ylabel('G')

    plt.subplot(5,1,4)
    plt.plot(y1, color='green', label='left')
    plt.plot(y2, color='purple', label='right')
    plt.title("Magnitudes")
    plt.ylabel('G')

    corr = signal.correlate(y2, y1, mode='same')
    print(corr)
    plt.subplot(5,1,5)
    plt.plot(corr)
    title = 'avg correlation is: ' + str(statistics.mean(corr)*100) + '%'
    plt.title(title)
    plt.xlabel('time')
    plt.ylabel('Correlation coeff')
    # plt.savefig('Figure_1.png')
    plt.show()

    


def make_graph(leftPhone_str, rightPhone_str):
    leftPhone_json = json.loads(leftPhone_str)
    leftPhone = np.array(leftPhone_json)
    leftPhone = leftPhone[:,1:4].astype(np.float)

    rightPhone_json = json.loads(rightPhone_str)
    rightPhone = np.array(rightPhone_json)
    rightPhone = rightPhone[:,1:4].astype(np.float)


    leftPhone_mag = []
    rightPhone_mag = []
    for row in leftPhone:
        leftPhone_mag.append(abs(row[0]) + abs(row[1]) + abs(row[2]))
    for row in rightPhone:
        rightPhone_mag.append(abs(row[0]) + abs(row[1]) + abs(row[2]))


    # shorten longest recording
    shortest = len(leftPhone_mag)
    if len(rightPhone_mag) < shortest:
        shortest = len(rightPhone_mag)

    leftPhone_mag = leftPhone_mag[:shortest]
    rightPhone_mag = rightPhone_mag[:shortest]


    lag_finder(leftPhone_mag, rightPhone_mag, shortest, leftPhone, rightPhone)


# main
fileContents = {}
# fileName = "testDataArduino/armRecording.json"
fileName = "testDataPhone/derektestmovingbotharms.json"
# fileName = "testDataPhone/accuracyTestIpadIphone.json"
# fileName = "testDataPhone/2NUDvZB3oxzpeQaZP0vO.json"


with open(fileName) as f:
    fileContents = json.load(f)
# print(fileContents)
make_graph(fileContents["data"]["leftPhone"], fileContents["data"]["rightPhone"])
