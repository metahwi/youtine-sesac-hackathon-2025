# Description: Test script for lateral raises counter using PoseModule.py

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
    direction = 0  # 0: arms down, 1: arms up
    form = 0       # 0: incorrect form, 1: correct form
    feedback = "Arms at Sides"
    
    print("Starting Lateral Raises Counter. Press 'q' to quit.")
    print("Stand facing camera with arms at sides.")
    
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
            # Get positions
            right_wrist_y = lmList[16][2]
            right_elbow_y = lmList[14][2]
            right_shoulder_y = lmList[12][2]
            right_hip_y = lmList[24][2]
            
            left_wrist_y = lmList[15][2]
            left_elbow_y = lmList[13][2]
            left_shoulder_y = lmList[11][2]
            left_hip_y = lmList[23][2]
            
            # Calculate arm angles
            right_arm_angle = detector.findAngle(img, 12, 14, 16)
            left_arm_angle = detector.findAngle(img, 11, 13, 15)
            
            # Calculate shoulder angles (hip-shoulder-elbow)
            right_shoulder_angle = detector.findAngle(img, 24, 12, 14)
            left_shoulder_angle = detector.findAngle(img, 23, 11, 13)
            
            # Average for stability
            avg_shoulder_angle = (right_shoulder_angle + left_shoulder_angle) / 2
            
            # Check arm straightness
            arms_straight = right_arm_angle > 160 and left_arm_angle > 160
            
            # Calculate percentage (arms down to shoulder height)
            # 0-45 degrees = arms down, 75-90 degrees = shoulder height
            per = np.interp(avg_shoulder_angle, (45, 90), (0, 100))
            per = max(0, min(100, per))
            bar = np.interp(per, (0, 100), (380, 50))
            
            # Check form (arms should be straight)
            if arms_straight:
                form = 1
            
            # Count reps
            if form == 1:
                # Arms at shoulder height
                if per > 90:
                    if avg_shoulder_angle > 85 and direction == 0:
                        count += 0.5
                        direction = 1
                        feedback = "Lower Arms"
                
                # Arms down
                if per < 10:
                    if avg_shoulder_angle < 50 and direction == 1:
                        count += 0.5
                        direction = 0
                        feedback = "Raise to Sides"
                
                if 10 <= per <= 90:
                    if per > 50:
                        feedback = "Control the Movement"
                    else:
                        feedback = "Good Form"
            else:
                feedback = "Keep Arms Straight"
            
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
            
            # Form indicators
            right_color = (0, 255, 0) if right_arm_angle > 160 else (0, 0, 255)
            left_color = (0, 255, 0) if left_arm_angle > 160 else (0, 0, 255)
            cv2.putText(img, "R", (550, 70), cv2.FONT_HERSHEY_PLAIN, 2, right_color, 2)
            cv2.putText(img, "L", (550, 100), cv2.FONT_HERSHEY_PLAIN, 2, left_color, 2)
            
            # Display angle
            cv2.putText(img, f'Angle: {int(avg_shoulder_angle)}', (10, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
        
        # Display the frame
        cv2.imshow('Lateral Raises Counter', img)
        
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print(f"Workout complete. Total reps: {int(count)}")

if __name__ == "__main__":
    main()