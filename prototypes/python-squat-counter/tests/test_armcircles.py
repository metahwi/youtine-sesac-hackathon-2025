# Description: Test script for arm circles warmup/stretch using PoseModule.py

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
    
    # Circle tracking variables
    right_count = 0
    left_count = 0
    right_prev_angle = 0
    left_prev_angle = 0
    right_direction = None
    left_direction = None
    
    # Timing for speed
    start_time = time.time()
    feedback = "Extend Arms to Sides"
    
    print("Starting Arm Circles Warmup. Press 'q' to quit.")
    print("Stand facing camera with arms extended to sides.")
    
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
            # Get coordinates for circle tracking
            # Right arm
            right_shoulder_x = lmList[12][1]
            right_shoulder_y = lmList[12][2]
            right_wrist_x = lmList[16][1]
            right_wrist_y = lmList[16][2]
            
            # Left arm
            left_shoulder_x = lmList[11][1]
            left_shoulder_y = lmList[11][2]
            left_wrist_x = lmList[15][1]
            left_wrist_y = lmList[15][2]
            
            # Calculate angles relative to shoulder (0-360 degrees)
            right_angle = np.degrees(np.arctan2(right_wrist_y - right_shoulder_y, 
                                               right_wrist_x - right_shoulder_x))
            left_angle = np.degrees(np.arctan2(left_wrist_y - left_shoulder_y, 
                                              left_wrist_x - left_shoulder_x))
            
            # Normalize angles to 0-360
            right_angle = (right_angle + 360) % 360
            left_angle = (left_angle + 360) % 360
            
            # Calculate arm extension (distance from shoulder)
            right_extension = np.sqrt((right_wrist_x - right_shoulder_x)**2 + 
                                    (right_wrist_y - right_shoulder_y)**2)
            left_extension = np.sqrt((left_wrist_x - left_shoulder_x)**2 + 
                                   (left_wrist_y - left_shoulder_y)**2)
            
            # Check if arms are extended (adjust threshold based on body size)
            min_extension = 100  # pixels
            right_extended = right_extension > min_extension
            left_extended = left_extension > min_extension
            
            # Detect circle completion (right arm)
            if right_extended:
                angle_diff = right_angle - right_prev_angle
                if angle_diff > 180:
                    angle_diff -= 360
                elif angle_diff < -180:
                    angle_diff += 360
                
                if abs(angle_diff) > 5:  # Minimum movement threshold
                    if angle_diff > 0:
                        if right_direction == "backward":
                            right_count += 0.5
                        right_direction = "forward"
                    else:
                        if right_direction == "forward":
                            right_count += 0.5
                        right_direction = "backward"
            
            # Detect circle completion (left arm)
            if left_extended:
                angle_diff = left_angle - left_prev_angle
                if angle_diff > 180:
                    angle_diff -= 360
                elif angle_diff < -180:
                    angle_diff += 360
                
                if abs(angle_diff) > 5:  # Minimum movement threshold
                    if angle_diff > 0:
                        if left_direction == "backward":
                            left_count += 0.5
                        left_direction = "forward"
                    else:
                        if left_direction == "forward":
                            left_count += 0.5
                        left_direction = "backward"
            
            # Update previous angles
            right_prev_angle = right_angle
            left_prev_angle = left_angle
            
            # Feedback
            if right_extended and left_extended:
                feedback = "Good! Keep Circling"
            elif not right_extended and not left_extended:
                feedback = "Extend Both Arms"
            elif not right_extended:
                feedback = "Extend Right Arm"
            elif not left_extended:
                feedback = "Extend Left Arm"
            
            # Draw UI elements
            # Circle counters
            cv2.rectangle(img, (10, 10), (200, 80), (255, 255, 255), cv2.FILLED)
            cv2.putText(img, f'Right: {int(right_count)}', (20, 40), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 2)
            cv2.putText(img, f'Left: {int(left_count)}', (20, 70), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 2)
            
            # Direction indicators
            if right_direction:
                cv2.putText(img, f'R: {right_direction}', (220, 40), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 0), 2)
            if left_direction:
                cv2.putText(img, f'L: {left_direction}', (220, 70), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 0), 2)
            
            # Extension indicators
            right_color = (0, 255, 0) if right_extended else (0, 0, 255)
            left_color = (0, 255, 0) if left_extended else (0, 0, 255)
            cv2.circle(img, (right_wrist_x, right_wrist_y), 10, right_color, cv2.FILLED)
            cv2.circle(img, (left_wrist_x, left_wrist_y), 10, left_color, cv2.FILLED)
            
            # Feedback
            cv2.rectangle(img, (440, 0), (640, 40), (255, 255, 255), cv2.FILLED)
            cv2.putText(img, feedback, (445, 30), cv2.FONT_HERSHEY_PLAIN, 1.5, (0, 255, 0), 2)
            
            # Timer
            elapsed = int(time.time() - start_time)
            cv2.putText(img, f'Time: {elapsed}s', (10, 460), cv2.FONT_HERSHEY_PLAIN, 2, (255, 255, 255), 2)
        
        # Display the frame
        cv2.imshow('Arm Circles Warmup', img)
        
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print(f"Warmup complete. Right arm: {int(right_count)} circles, Left arm: {int(left_count)} circles")

if __name__ == "__main__":
    main()