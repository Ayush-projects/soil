import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from imageio import imread
from skimage.transform import resize
from sklearn.cluster import KMeans
from matplotlib.colors import to_hex
from kneed import KneeLocator
from collections import Counter
import seaborn as sns
import sys
import os
sns.set()



# Read image file as 2-D array of RGB values
imgName = sys.argv[1] 
img = imread(imgName)
# Resize image
img = resize(img, (400, 400))

# Get each pixel as an array of RGB values
data = pd.DataFrame(img.reshape(-1, 3),
                    columns=['R', 'G', 'B'])

# Replace NaN with zero and infinity with large finite numbers
df = pd.DataFrame(data)
df[:] = np.nan_to_num(df)
df.replace([np.inf, -np.inf], np.nan, inplace=True)

# Define within cluster sum square error (wcsse) and vary the number of clusters
wcsse = []
for i in range(1, 11):
    kmeans = KMeans(n_clusters=i, init='k-means++', random_state=23)
    kmeans.fit(df)
    wcsse.append(kmeans.inertia_)


# Plot and generate Elbow curve
plt.figure(figsize=(10, 8))
plt.plot(range(1, 11), wcsse, marker='o', linestyle='--')
plt.xlabel('Number of clusters')
plt.ylabel('WCSSE')
plt.title('Elbow Curve')
#plt.show()


# Finding Elbow-point
kl = KneeLocator(range(1, 11), wcsse, curve="convex", direction="decreasing")

k = kl.elbow
print(kl.elbow)

###################################### K-mean clustering based on the Elbow value ######################################

# Fix random seed
np.random.seed(0)

# Cluster the pixels based on the predicted Elbow value
kmeans = KMeans(n_clusters=k, init='k-means++',
                random_state=0)
# Fit and assign clusters
data['Cluster'] = kmeans.fit_predict(data)

# Find counter to plot pie chart
counts = Counter(data['Cluster'])
counts = Counter(data['Cluster'])
center_colors = kmeans.cluster_centers_
# We get ordered colors by iterating through the keys
ordered_colors = [center_colors[i] for i in counts.keys()]
rgb_colors = [ordered_colors[i] for i in counts.keys()]
plt.figure(figsize=(8, 6))
plt.pie(counts.values(), colors=rgb_colors)
#plt.show()

# Get the color palette from the cluster centers
palette = kmeans.cluster_centers_

# Convert data to format accepted by imshow
palette_list = list()
for color in palette:
    palette_list.append([[tuple(color)]])


# Show color palette
for color in palette_list:
    print(to_hex(color[0][0]))
    plt.figure(figsize=(1, 1))
    plt.axis('off')
    plt.imshow(color)
    #plt.show()

# Recreate the image using only colors from color palette.
# Replace every pixel's color with the color of its cluster centroid
data['R_cluster'] = data['Cluster'].apply(lambda x: palette_list[x][0][0][0])
data['G_cluster'] = data['Cluster'].apply(lambda x: palette_list[x][0][0][1])
data['B_cluster'] = data['Cluster'].apply(lambda x: palette_list[x][0][0][2])

# Convert the dataframe back to a numpy array
img_c = data[['R_cluster', 'G_cluster', 'B_cluster']].values

# Reshape the data back to a 200x200 image
img_c = img_c.reshape(400, 400, 3)



# Display the image

plt.axis('off')
plt.imshow(img_c)
pre_process = "colorP_" + os.path.basename(sys.argv[1])
plt.imsave("uploads/"+pre_process, img_c)

