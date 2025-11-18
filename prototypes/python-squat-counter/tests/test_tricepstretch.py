# Description: Test script for overhead tricep stretch timer using PoseModule.py

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
    right_start_time = None
    left_start_time = None
    right_elapsed = 0
    left_elapsed = 0
    right_in_position = False
    left_in_position = False
    
    # Target hold time
    target_time = 30  # seconds
    
    feedback = "Raise Arm Overhead"
    
    print("Starting Overhead Tricep Stretch Timer. Press 'q' to quit.")
    print("Face camera and bend elbow behind head.")
    
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
            # Check right arm position
            right_elbow_angle = detector.findAngle(img, 12, 14, 16)  # Shoulder, elbow, wrist
            right_shoulder_angle = detector.findAngle(img, 24, 12, 14)  # Hip, shoulder, elbow
            
            # Check left arm position
            left_elbow_angle = detector.findAngle(img, 11, 13, 15)  # Shoulder, elbow, wrist
            left_shoulder_angle = detector.findAngle(img, 23, 11, 13)  # Hip, shoulder, elbow
            
            # Get elbow and wrist positions
            right_elbow_y = lmList[14][2]
            right_wrist_y = lmList[16][2]
            right_shoulder_y = lmList[12][2]
            
            left_elbow_y = lmList[13][2]
            left_wrist_y = lmList[15][2]
            left_shoulder_y = lmList[11][2]
            
            # Right arm stretch detection
            right_overhead = right_elbow_y < right_shoulder_y  # Elbow above shoulder
            right_bent = right_elbow_angle < 90  # Elbow bent
            right_correct = right_overhead and right_bent and right_shoulder_angle > 150
            
            # Left arm stretch detection
            left_overhead = left_elbow_y < left_shoulder_y  # Elbow above shoulder
            left_bent = left_elbow_angle < 90  # Elbow bent
            left_correct = left_overhead and left_bent and left_shoulder_angle > 150
            
            # Timer logic for right arm
            if right_correct:
                if not right_in_position:
                    right_start_time = time.time()
                    right_in_position = True
                else:
                    right_elapsed = time.time() - right_start_time
            else:
                right_in_position = False
                if right_elapsed < target_time:
                    right_elapsed = 0
            
            # Timer logic for left arm
            if left_correct:
                if not left_in_position:
                    left_start_time = time.time()
                    left_in_position = True
                else:
                    left_elapsed = time.time() - left_start_time
            else:
                left_in_position = False
                if left_elapsed < target_time:
                    left_elapsed = 0
            
            # Feedback
            if right_correct and left_correct:
                feedback = "Both Arms - Hold!"
            elif right_correct:
                feedback = "Right Good - Do Left"
            elif left_correct:
                feedback = "Left Good - Do Right"
            else:
                if not (right_overhead or left_overhead):
                    feedback = "Raise Arm Overhead"
                elif not (right_bent or left_bent):
                    feedback = "Bend Elbow Behind Head"
                else:
                    feedback = "Adjust Position"
            
            # Draw UI elements
            # Timer displays
            cv2.rectangle(img, (10, 10), (300, 120), (255, 255, 255), cv2.FILLED)
            cv2.rectangle(img, (10, 10), (300, 120), (0, 0, 0), 3)
            
            # Right arm timer
            right_color = (0, 255, 0) if right_correct else (0, 0, 255)
            cv2.putText(img, "Right Arm:", (20, 40), cv2.FONT_HERSHEY_PLAIN, 1.5, (0, 0, 0), 2)
            cv2.putText(img, f"{int(right_elapsed)}s / {target_time}s", (140, 40), cv2.FONT_HERSHEY_PLAIN, 1.5, right_color, 2)
            
            # Right progress bar
            right_progress = min(right_elapsed / target_time, 1.0)
            cv2.rectangle(img, (20, 50), (280, 60), (200, 200, 200), cv2.FILLED)
            cv2.rectangle(img, (20, 50), (int(20 + 260 * right_progress), 60), right_color, cv2.FILLED)
            
            # Left arm timer
            left_color = (0, 255, 0) if left_correct else (0, 0, 255)
            cv2.putText(img, "Left Arm:", (20, 90), cv2.FONT_HERSHEY_PLAIN, 1.5, (0, 0, 0), 2)
            cv2.putText(img, f"{int(left_elapsed)}s / {target_time}s", (140, 90), cv2.FONT_HERSHEY_PLAIN, 1.5, left_color, 2)
            
            # Left progress bar
            left_progress = min(left_elapsed / target_time, 1.0)
            cv2.rectangle(img, (20, 100), (280, 110), (200, 200, 200), cv2.FILLED)
            cv2.rectangle(img, (20, 100), (int(20 + 260 * left_progress), 110), left_color, cv2.FILLED)
            
            # Feedback
            cv2.rectangle(img, (440, 0), (640, 40), (255, 255, 255), cv2.FILLED)
            cv2.putText(img, feedback, (445, 30), cv2.FONT_HERSHEY_PLAIN, 1.5, (0, 255, 0), 2)
            
            # Completion indicators
            if right_elapsed >= target_time:
                cv2.putText(img, "RIGHT COMPLETE!", (320, 200), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 3)
            if left_elapsed >= target_time:
                cv2.putText(img, "LEFT COMPLETE!", (320, 250), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 3)
        
        # Display the frame
        cv2.imshow('Overhead Tricep Stretch', img)
        
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print(f"Stretch complete. Right: {int(right_elapsed)}s, Left: {int(left_elapsed)}s")

if __name__ == "__main__":
    main()