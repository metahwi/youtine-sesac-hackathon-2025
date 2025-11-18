# This script is a test for the bicep curl rep counter.

import cv2
import numpy as np
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/core')))
import pose_detector as pm
import time

def main():
    # Initialize camera with error handling
    print("Initializing camera...")
    cap = cv2.VideoCapture(0)
    
    # Check if camera opened successfully
    if not cap.isOpened():
        print("ERROR: Could not open camera. Please check your camera connection.")
        return
    
    # Try to read a test frame
    ret, test_frame = cap.read()
    if not ret:
        print("ERROR: Could not read frame from camera. Please check your camera permissions.")
        cap.release()
        return
    
    print("Camera initialized successfully.")
    
    # Initialize pose detector
    detector = pm.PoseDetector()
    count = 0
    direction = 0  # 0: going down, 1: going up
    form = 0       # 0: incorrect form, 1: correct form
    feedback = "Extend Arms"
    
    print("Starting Bicep Curl Rep Counter. Press 'q' to quit.")
    print("Position yourself sideways to the camera for best results.")
    
    while cap.isOpened():
        ret, img = cap.read()
        
        # Check if frame was successfully read
        if not ret:
            print("Error reading frame. Retrying...")
            time.sleep(0.1)  # Small delay before retry
            continue
        
        # Find pose landmarks
        img = detector.findPose(img, False)
        lmList = detector.findPosition(img, False)
        
        if len(lmList) != 0:
            # For bicep curls, we focus on elbow angle
            # Preferably track the arm facing the camera
            # Right arm (if facing right side to camera)
            right_elbow = detector.findAngle(img, 12, 14, 16)
            
            # Left arm (if facing left side to camera)
            left_elbow = detector.findAngle(img, 11, 13, 15)
            
            # Use the arm with more visibility (lower angle value during curl)
            if min(right_elbow, left_elbow) < 120:
                elbow_angle = min(right_elbow, left_elbow)
                form = 1
            else:
                elbow_angle = min(right_elbow, left_elbow)
            
            # Calculate percentage of curl
            # Extended: ~170-180 degrees
            # Curled: ~40-60 degrees
            per = np.interp(elbow_angle, (50, 170), (100, 0))
            bar = np.interp(elbow_angle, (50, 170), (50, 380))
            
            # Count reps
            if form == 1:
                if per > 90:  # Curled position
                    if elbow_angle < 60 and direction == 0:
                        count += 0.5
                        direction = 1
                        feedback = "Lower Weight"
                        
                if per < 10:  # Extended position
                    if elbow_angle > 160 and direction == 1:
                        count += 0.5
                        direction = 0
                        feedback = "Curl Up"
                
                if 10 <= per <= 90:
                    feedback = "Good Form"
            else:
                feedback = "Start with Arms Extended"
            
            # Draw UI elements
            # Progress bar
            cv2.rectangle(img, (580, 50), (600, 380), (0, 255, 0), 3)
            cv2.rectangle(img, (580, int(bar)), (600, 380), (0, 255, 0), cv2.FILLED)
            cv2.putText(img, f'{int(per)}%', (565, 430), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 0), 2)
            
            # Rep counter
            cv2.rectangle(img, (0, 380), (100, 480), (0, 255, 0), cv2.FILLED)
            cv2.putText(img, str(int(count)), (25, 455), cv2.FONT_HERSHEY_PLAIN, 5, (255, 0, 0), 5)
            
            # Feedback
            cv2.rectangle(img, (500, 0), (640, 40), (255, 255, 255), cv2.FILLED)
            cv2.putText(img, feedback, (500, 40), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 2)
            
            # Display angles (optional, for debugging)
            cv2.putText(img, f'Angle: {int(elbow_angle)}', (10, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
        
        # Display the frame
        cv2.imshow('Bicep Curl Rep Counter', img)
        
        # Exit on 'q' key press
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    print(f"Workout complete. Total reps: {int(count)}")

if __name__ == "__main__":
    main()