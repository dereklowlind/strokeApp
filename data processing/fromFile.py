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
    plt.savefig('Figure_1.png')
    plt.show()


def make_graph(phone1_str, phone2_str):
    phone1_json = json.loads(phone1_str)
    phone1 = np.array(phone1_json)
    phone1 = phone1[:,1:4].astype(np.float)

    phone2_json = json.loads(phone2_str)
    phone2 = np.array(phone2_json)
    phone2 = phone2[:,1:4].astype(np.float)

    units = ['G', 'mdps', 'mgauss', 'mbar', 'C', '', '', '']

    print(phone1[0])
    print(phone2[0])

    phone1_mag = []
    phone2_mag = []
    for row in phone1:
        phone1_mag.append(abs(row[0]) + abs(row[1]) + abs(row[2]))
    for row in phone2:
        phone2_mag.append(abs(row[0]) + abs(row[2]) + abs(row[2]))

    print(phone1_mag)

    # shorten longest recording
    shortest = len(phone1_mag)
    if len(phone2_mag) < shortest:
        shortest = len(phone2_mag)

    phone1_mag = phone1_mag[:shortest]
    phone2_mag = phone2_mag[:shortest]

    # cAxAy = np.corrcoef(phone1[:,0], phone2[:,1])
    # cAxAx = np.corrcoef(phone1[:,0], phone2[:,0])
    # mag_corr = np.corrcoef(phone1_mag, phone2_mag)
    # mag_corr = [crosscorr(phone1_mag, phone2_mag, lag=i) for i in range(12)]

    lag_finder(phone1_mag, phone2_mag, shortest)


# main
fileContents = {}
with open("testData/CN0SGpAeZK4HprF3SzK7.json") as f:
    fileContents = json.load(f)
# print(fileContents)
make_graph(fileContents["data"]["phone1"], fileContents["data"]["phone2"])
