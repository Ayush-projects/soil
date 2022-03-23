import pandas as pd 
import numpy as np
import cv2
from skimage import data
from skimage.color import rgb2xyz, xyz2rgb
import PIL
from scipy import ndimage
from skimage import measure, color, io

#Obtaining pH and g_fraction data from csv file
#g_fraction = g/(r+g+b)

df=pd.read_csv('pH_reference.csv')    #import csv file
g_frac=np.array(df.g_fraction)        #g_fraction values
pH=np.array(df.pH)                    #pH values
soil_data=[]                          #Array for g_fraction and pH values

for i in range(len(pH)):
    sd=[g_frac[i], pH[i]]
    soil_data.append(sd)


#Average RGB Calculation

image = PIL.Image.open("soil_silt1.jpg")   #import image
image = image.resize((400,400))
image_rgb = image.convert("RGB")


i=0
j=0
c=[]
for i in range(400):
    for j in range(400):
        c.append([i,j])
        j+=1
    i+=1


RGB=[]
for i in c:
    rgb_value = image_rgb.getpixel((i[0],i[1]))
    RGB.append(rgb_value)
    
R=[]
G=[]
B=[]
for i in RGB:
    R.append(i[0])
    G.append(i[1])
    B.append(i[2])
R_mean=np.mean(R)
G_mean=np.mean(G)
B_mean=np.mean(B)
g_frac_img=G_mean/(R_mean + G_mean + B_mean)  #g_fraction of image

Data=[]             #Array for difference in g_fraction with corresponding pH
Dif=[]              #Array for difference in g_fraction
for i in soil_data:
    g_frac_dif = np.abs(i[0]-g_frac_img)
    Data.append([g_frac_dif, i[1]])
    Dif.append(g_frac_dif)

for j in Data:
    if j[0]==min(Dif):
        if 5 < j[1] <= 5.9:               
            print('pH of soil is 5.0-5.9')
            print('high acidic')
        if 6 < j[1] <= 6.9:               
            print('pH of soil is 6.0-6.9')
            print('moderate acidic')
        if 7 < j[1] <= 7.9:               
            print('pH of soil is 7.0-7.9')
            print('moderate alkaline')
        if 8 <= j[1] :               
            print('pH of soil is greater than 8')
            print('high alkaline')
    