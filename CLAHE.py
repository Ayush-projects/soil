# Contrast Limiting Adaptive Histogram Enhancement of an image 3
import sys
import cv2
import os
# Read an image #


img = cv2.imread(sys.argv[1])

# Apply median filter to an image #
corrected_img = cv2.medianBlur(img, 3)

# Convert Color space #
lab_img = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)

# Split color channels #
l, a, b = cv2.split(lab_img)

# Apply CLAHE to the L-channel only #
clahe = cv2.createCLAHE(clipLimit=1.0, tileGridSize=(8, 8))
clahe_lab_img = clahe.apply(l)

# Combine the CLAHE enhanced l-channel back to a and b channels #
updated_clahe_lab_img = cv2.merge((clahe_lab_img, a, b))

# Convert color space #
final_img = cv2.cvtColor(updated_clahe_lab_img, cv2.COLOR_LAB2BGR)

img_scaled = cv2.resize(final_img, (400, 400), interpolation=cv2.INTER_AREA)
pre_process = "pre_" + os.path.basename(sys.argv[1])

cv2.imwrite("uploads/"+pre_process, img_scaled)

cv2.waitKey(0)
cv2.destroyAllWindows()
