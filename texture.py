import matplotlib.pyplot as plt
import cv2
import numpy as np
import pandas as pd
from scipy import fftpack, ndimage
import os
import math
import sys

#Spectral Density
imgName = sys.argv[1]
img = cv2.imread(imgName,0) #import image
img = cv2.resize(img, (400, 400))
print(img.shape)
ft2 = np.fft.fft2(img)
ftshift = np.fft.fftshift(ft2)
w=img.shape[1] #width of image
h=img.shape[0] #height of image 

magnitude_spectrum = 20*np.log(np.abs(ftshift))

plt.axis('off')
plt.imshow(magnitude_spectrum, cmap = 'jet')
# plt.savefig('uploads/colorTD_' + imgName)



#RAPSD

# Round up the size along this axis to an even number
n = int( math.ceil(img.shape[0] / 2.) * 2 )

# We use rfft since we are processing real values
a = np.fft.rfft(img,n, axis=0)

a = a.real*a.real + a.imag*a.imag
ax = a.sum(axis=1)/a.shape[1]         #Amplitudes on x axis


fx = np.fft.rfftfreq(n)   #frequencies on x axis     

n = int( math.ceil(img.shape[1] / 2.) * 2 )

a = np.fft.rfft(img,n,axis=1)

a = a.real*a.real + a.imag*a.imag
ay = a.sum(axis=0)/a.shape[0]      #Amplitudes on y axis

fy = np.fft.rfftfreq(n)         #frequencies on y axis 


r=(np.sqrt(ax**2 + ay**2))     #Amplitudes in radial direction


plt.scatter(np.log(fx[1:]),np.log(r[1:]), s=5)
m, c = np.polyfit(np.log(fx[1:]), np.log(r[1:]), 1)

plt.plot(np.log(fx[1:]), m*np.log(fx[1:]) + c, 'r', label='y={:.2f}x+{:.2f}'.format(m,c))

plt.legend()
plt.savefig('uploads/colorT_' + imgName)
#plt.show()
print('slope of line', m)
h=(-m-1)/2
print('surface roughness', h)