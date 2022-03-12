import cv2
from matplotlib import pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm
from matplotlib import colors
import sys
import os
# Read image file as BGR
img = cv2.imread(sys.argv[1], 1)


# Convert image from BGR to RGB and split channels
rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
r, g, b = cv2.split(rgb_img)

# Set up plot to place each pixel in its location (3D RGB space) and color it by its original color
fig = plt.figure()
axis = fig.add_subplot(1, 1, 1, projection="3d")

# Set up the pixel colors. In order to color each pixel according to its true color, there’s a bit of reshaping and
# normalization required. Normalizing just means condensing the range of colors from 0-255 to 0-1 as required for the
# facecolors parameter. Lastly, facecolors wants a list, not an NumPy array
pixel_colors = rgb_img.reshape((np.shape(rgb_img)[0]*np.shape(rgb_img)[1], 3))
norm = colors.Normalize(vmin=-1.0, vmax=1.0)
norm.autoscale(pixel_colors)
pixel_colors = norm(pixel_colors).tolist()

# Build the scatter plot and view it
axis.scatter(r.flatten(), g.flatten(), b.flatten(), facecolors=pixel_colors, marker=".")
axis.set_xlabel("Red")
axis.set_ylabel("Green")
axis.set_zlabel("Blue") 
rgbFileName = "colorSRGB_" + os.path.basename(sys.argv[1])
plt.savefig("uploads/" + rgbFileName)




def getAverageRGBN(rgb_img):
    im = np.array(rgb_img) # get image as numpy array
    w,h,d = im.shape # get shape
    im.shape = (w*h, d) # change shape
    return tuple(im.mean(axis=0)) # get average
print('Average RGB values are',getAverageRGBN(rgb_img)) #Average RGB value


Avg_RGB=getAverageRGBN(rgb_img)



# Visualization image in HSV space
# convert image from RGB to HSV
hsv_img = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2HSV)
h, s, v = cv2.split(hsv_img)

pixel_colors = hsv_img.reshape((np.shape(hsv_img)[0]*np.shape(hsv_img)[1], 3))
norm = colors.Normalize(vmin=-1.0, vmax=1.0)
norm.autoscale(pixel_colors)
pixel_colors = norm(pixel_colors).tolist()

fig = plt.figure()
axis = fig.add_subplot(1, 1, 1, projection="3d")
axis.scatter(h.flatten(), s.flatten(), v.flatten(), facecolors=pixel_colors, marker=".")
axis.set_xlabel("Hue")
axis.set_ylabel("Saturation")
axis.set_zlabel("Value")
hsvFileName = "colorSHSV_" + os.path.basename(sys.argv[1])
plt.savefig("uploads/" + hsvFileName)
def getAverageHSVN(hsv_img):
    im = np.array(hsv_img) # get image as numpy array
    w,h,d = im.shape # get shape
    im.shape = (w*h, d) # change shape
    return tuple(im.mean(axis=0)) # get average
print('Average HSV values are',getAverageHSVN(hsv_img)) #Average HSV value


# Visualization image in CIELab space
# convert image from RGB to Lab
lab_img = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2Lab)
l, a, b = cv2.split(lab_img)

pixel_colors = lab_img.reshape((np.shape(lab_img)[0]*np.shape(lab_img)[1], 3))
norm = colors.Normalize(vmin=-1.0, vmax=1.0)
norm.autoscale(pixel_colors)
pixel_colors = norm(pixel_colors).tolist()

fig = plt.figure()
axis = fig.add_subplot(1, 1, 1, projection="3d")
axis.scatter(h.flatten(), s.flatten(), v.flatten(), facecolors=pixel_colors, marker=".")
axis.set_xlabel("Light*")
axis.set_ylabel("a* value")
axis.set_zlabel("b* Value")
labFileName = "colorSLAB_" + os.path.basename(sys.argv[1])
plt.savefig("uploads/" + labFileName)
def getAverageLabN(lab_img):
    im = np.array(lab_img) # get image as numpy array
    w,h,d = im.shape # get shape
    im.shape = (w*h, d) # change shape
    return tuple(im.mean(axis=0)) # get average
print('Average Lab values are',getAverageLabN(lab_img)) #Average Lab value


# Visualization image in CIEXYZ space
# convert image from RGB to XYZ
XYZ_img = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2XYZ)
X, Y, Z = cv2.split(XYZ_img)

pixel_colors = XYZ_img.reshape((np.shape(XYZ_img)[0]*np.shape(XYZ_img)[1], 3))
norm = colors.Normalize(vmin=-1.0, vmax=1.0)
norm.autoscale(pixel_colors)
pixel_colors = norm(pixel_colors).tolist()

fig = plt.figure()
axis = fig.add_subplot(1, 1, 1, projection="3d")
axis.scatter(h.flatten(), s.flatten(), v.flatten(), facecolors=pixel_colors, marker=".")
axis.set_xlabel("X")
axis.set_ylabel("Y")
axis.set_zlabel("Z")
xyzFileName = "colorSXYZ_" + os.path.basename(sys.argv[1])
plt.savefig("uploads/" + xyzFileName)
def getAverageXYZN(XYZ_img):
    im = np.array(XYZ_img) # get image as numpy array
    w,h,d = im.shape # get shape
    im.shape = (w*h, d) # change shape
    return tuple(im.mean(axis=0)) # get average
print('Average XYZ values are',getAverageXYZN(XYZ_img)) #Average XYZ value