# Description: Test script for tricep dips counter using PoseModule.py

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
    
    if not cap.isOpened():
        print("ERROR: Could not open camera. Please check your camera connection.")
        return
    
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
    feedback = "Position Arms Behind"
    
    print("Starting Tricep Dips Counter. Press 'q' to quit.")
    print("Sit facing camera with hands behind you on chair/bench.")
    
    while cap.isOpened():
        ret, img = cap.read()
        
        if not ret:
            print("Error reading frame. Retrying...")
            time.sleep(0.1)
            continue
        
        # Find pose landmarks
        img = detector.findPose(img, False)
        lmList = detector.findPosition(img, False)
        
        if len(lmList) != 0:
            # For tricep dips, track elbow bend with arms behind body
            # Both arms should move together
            right_elbow = detector.findAngle(img, 12, 14, 16)  # Shoulder, elbow, wrist
            left_elbow = detector.findAngle(img, 11, 13, 15)   # Shoulder, elbow, wrist
            avg_elbow = (right_elbow + left_elbow) / 2
            
            # Check shoulder position (arms should be back)
            # Compare wrist position to shoulder position
            right_wrist_x = lmList[16][1]
            right_shoulder_x = lmList[12][1]
            left_wrist_x = lmList[15][1]
            left_shoulder_x = lmList[11][1]
            
            # Arms behind check (wrists behind shoulders)
            arms_behind = (right_wrist_x < right_shoulder_x) and (left_wrist_x > left_shoulder_x)
            
            # Calculate percentage (similar to push-ups but inverted)
            # Up position: arms straight (160-180 degrees)
            # Down position: arms bent (70-90 degrees)
            per = np.interp(avg_elbow, (70, 170), (100, 0))
            bar = np.interp(avg_elbow, (70, 170), (50, 380))
            
            # Check form
            if arms_behind and abs(right_elbow - left_elbow) < 20:  # Arms evenly bent
                form = 1
            
            # Count reps
            if form == 1:
                if per > 90:  # Down position
                    if avg_elbow < 90 and direction == 0:
                        count += 0.5
                        direction = 1
                        feedback = "Push Up"
                        
                if per < 10:  # Up position
                    if avg_elbow > 160 and direction == 1:
                        count += 0.5
                        direction = 0
                        feedback = "Lower Down"
                
                if 10 <= per <= 90:
                    feedback = "Good Form"
            else:
                if not arms_behind:
                    feedback = "Hands Behind Body"
                else:
                    feedback = "Keep Arms Even"
            
            # Draw UI elements
            # Progress bar
            if form == 1:
                cv2.rectangle(img, (580, 50), (600, 380), (0, 255, 0), 3)
                cv2.rectangle(img, (580, int(bar)), (600, 380), (0, 255, 0), cv2.FILLED)
                cv2.putText(img, f'{int(per)}%', (565, 430), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 0), 2)
            
            # Rep counter
            cv2.rectangle(img, (0, 380), (100, 480), (0, 255, 0), cv2.FILLED)
            cv2.putText(img, str(int(count)), (25, 455), cv2.FONT_HERSHEY_PLAIN, 5, (255, 0, 0), 5)
            
            # Feedback
            cv2.rectangle(img, (500, 0), (640, 40), (255, 255, 255), cv2.FILLED)
            cv2.putText(img, feedback, (500, 40), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 2)
            
            # Display angles
            cv2.putText(img, f'Elbow: {int(avg_elbow)}', (10, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
        
        # Display the frame
        cv2.imshow('Tricep Dips Counter', img)
        
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print(f"Workout complete. Total reps: {int(count)}")

if __name__ == "__main__":
    main()