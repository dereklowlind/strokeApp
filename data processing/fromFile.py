import numpy as np
import matplotlib.pyplot as plt
import json
from scipy import signal

def lag_finder(y1, y2, sr):
    n = len(y1)

    corr = signal.correlate(y2, y1, mode='same') / np.sqrt(signal.correlate(y1, y1, mode='same')[int(n/2)] * signal.correlate(y2, y2, mode='same')[int(n/2)])

    delay_arr = np.linspace(-0.5*n/sr, 0.5*n/sr, n)
    delay = delay_arr[np.argmax(corr)]
    print('y2 is ' + str(delay) + ' behind y1')
    max_corr = np.amax(corr)
    print('max correlation is: ' + str(max_corr))

    plt.figure(figsize=(20, 10))
    plt.subplot(2,1,1)
    plt.plot(y1)
    plt.plot(y2)
    plt.title("Magnitudes")
    plt.ylabel('G')

    plt.subplot(2,1,2)
    plt.plot(delay_arr, corr)
    max_corr_title = 'max correlation is: ' + str(round(max_corr,2)*100) + '%'
    plt.title('Lag: ' + str(np.round(delay, 3)) + ' s ' + max_corr_title)
    plt.xlabel('Lag')
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

    print(leftPhone[0])
    print(rightPhone[0])

    leftPhone_mag = []
    rightPhone_mag = []
    for row in leftPhone:
        leftPhone_mag.append(abs(row[0]) + abs(row[1]) + abs(row[2]))
    for row in rightPhone:
        rightPhone_mag.append(abs(row[0]) + abs(row[1]) + abs(row[2]))

    print(leftPhone_mag)

    # shorten longest recording
    shortest = len(leftPhone_mag)
    if len(rightPhone_mag) < shortest:
        shortest = len(rightPhone_mag)

    leftPhone_mag = leftPhone_mag[:shortest]
    rightPhone_mag = rightPhone_mag[:shortest]


    lag_finder(leftPhone_mag, rightPhone_mag, shortest)


# main
fileContents = {}
fileName = "testDataArduino/armRecording.json"
# fileName = "testDataPhone/CN0SGpAeZK4HprF3SzK7.json"
# fileName = "testDataPhone/accuracyTestIphone6sIphone6s.json"
with open(fileName) as f:
    fileContents = json.load(f)
# print(fileContents)
make_graph(fileContents["data"]["leftPhone"], fileContents["data"]["rightPhone"])
