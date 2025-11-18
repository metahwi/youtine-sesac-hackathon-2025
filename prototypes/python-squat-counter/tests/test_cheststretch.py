# Description: Test script for chest and shoulder doorway stretch using PoseModule.py

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
    
    # Stretch timing variables
    start_time = None
    elapsed_time = 0
    in_position = False
    target_time = 30  # seconds
    
    feedback = "Arms Out to Sides"
    stretch_type = ""
    
    print("Starting Chest & Shoulder Stretch Timer. Press 'q' to quit.")
    print("Stand facing camera with arms extended.")
    
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
            # Get key positions
            right_wrist_x = lmList[16][1]
            right_wrist_y = lmList[16][2]
            right_elbow_x = lmList[14][1]
            right_shoulder_x = lmList[12][1]
            right_shoulder_y = lmList[12][2]
            
            left_wrist_x = lmList[15][1]
            left_wrist_y = lmList[15][2]
            left_elbow_x = lmList[13][1]
            left_shoulder_x = lmList[11][1]
            left_shoulder_y = lmList[11][2]
            
            # Calculate arm angles
            right_arm_angle = detector.findAngle(img, 12, 14, 16)
            left_arm_angle = detector.findAngle(img, 11, 13, 15)
            
            # Check arm positions for different stretch types
            # 1. Doorway stretch (arms at 90 degrees, elbows bent)
            doorway_position = (
                abs(right_wrist_y - right_shoulder_y) < 50 and
                abs(left_wrist_y - left_shoulder_y) < 50 and
                right_arm_angle < 120 and left_arm_angle < 120 and
                right_elbow_x > right_shoulder_x and
                left_elbow_x < left_shoulder_x
            )
            
            # 2. Behind-back clasp (hands clasped behind back)
            behind_back = (
                right_wrist_x < right_shoulder_x and
                left_wrist_x > left_shoulder_x and
                abs(right_wrist_x - left_wrist_x) < 100
            )
            
            # 3. Wide arm stretch (arms fully extended to sides)
            wide_stretch = (
                right_arm_angle > 160 and left_arm_angle > 160 and
                right_wrist_x > right_shoulder_x + 50 and
                left_wrist_x < left_shoulder_x - 50 and
                abs(right_wrist_y - right_shoulder_y) < 100 and
                abs(left_wrist_y - left_shoulder_y) < 100
            )
            
            # Determine stretch type and position
            correct_position = False
            if doorway_position:
                correct_position = True
                stretch_type = "Doorway Stretch"
                feedback = "Hold Position!"
            elif behind_back:
                correct_position = True
                stretch_type = "Behind-Back Clasp"
                feedback = "Pull Shoulders Back!"
            elif wide_stretch:
                correct_position = True
                stretch_type = "Wide Arm Stretch"
                feedback = "Feel the Stretch!"
            else:
                stretch_type = ""
                if right_arm_angle < 160 or left_arm_angle < 160:
                    feedback = "Straighten Arms"
                else:
                    feedback = "Extend Arms Back"
            
            # Timer logic
            if correct_position:
                if not in_position:
                    start_time = time.time()
                    in_position = True
                else:
                    elapsed_time = time.time() - start_time
            else:
                in_position = False
                if elapsed_time < target_time:
                    elapsed_time = 0
            
            # Draw UI elements
            # Timer display
            cv2.rectangle(img, (200, 30), (440, 120), (255, 255, 255), cv2.FILLED)
            cv2.rectangle(img, (200, 30), (440, 120), (0, 0, 0), 3)
            
            # Stretch type
            if stretch_type:
                cv2.putText(img, stretch_type, (210, 55), cv2.FONT_HERSHEY_PLAIN, 1.5, (0, 0, 255), 2)
            
            # Timer
            color = (0, 255, 0) if correct_position else (0, 0, 255)
            cv2.putText(img, f"{int(elapsed_time)}s / {target_time}s", (260, 85), cv2.FONT_HERSHEY_PLAIN, 2, color, 2)
            
            # Progress bar
            progress = min(elapsed_time / target_time, 1.0)
            cv2.rectangle(img, (210, 95), (430, 110), (200, 200, 200), cv2.FILLED)
            cv2.rectangle(img, (210, 95), (int(210 + 220 * progress), 110), color, cv2.FILLED)
            
            # Position indicators
            if correct_position:
                cv2.circle(img, (50, 50), 30, (0, 255, 0), cv2.FILLED)
                cv2.putText(img, "GOOD", (75, 55), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
            else:
                cv2.circle(img, (50, 50), 30, (0, 0, 255), cv2.FILLED)
                cv2.putText(img, "ADJUST", (75, 55), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
            
            # Feedback
            cv2.rectangle(img, (440, 0), (640, 40), (255, 255, 255), cv2.FILLED)
            cv2.putText(img, feedback, (445, 30), cv2.FONT_HERSHEY_PLAIN, 1.5, (0, 255, 0), 2)
            
            # Completion indicator
            if elapsed_time >= target_time:
                cv2.putText(img, "STRETCH COMPLETE!", (180, 200), cv2.FONT_HERSHEY_PLAIN, 2.5, (0, 255, 0), 3)
                cv2.putText(img, "Try another position", (200, 240), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 0), 2)
        
        # Display the frame
        cv2.imshow('Chest & Shoulder Stretch', img)
        
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print(f"Stretch complete. Total time: {int(elapsed_time)}s")

if __name__ == "__main__":
    main()