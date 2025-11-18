# Description: Test script for jumping jacks counter using PoseModule.py
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
    direction = 0  # 0: arms down/feet together, 1: arms up/feet apart
    form = 0       # 0: waiting to start, 1: actively counting
    feedback = "Stand with Arms Down"
    
    print("Starting Jumping Jacks Counter. Press 'q' to quit.")
    print("Face the camera directly for best results.")
    
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
            # For jumping jacks, we track:
            # 1. Arms position (shoulder to wrist angle)
            # 2. Feet position (hip width vs ankle distance)
            
            # Calculate arm angles
            right_arm = detector.findAngle(img, 12, 14, 16)  # Shoulder, elbow, wrist
            left_arm = detector.findAngle(img, 11, 13, 15)   # Shoulder, elbow, wrist
            
            # Get coordinates for position tracking
            # Wrists
            right_wrist_x = lmList[16][1]
            right_wrist_y = lmList[16][2]
            left_wrist_x = lmList[15][1]
            left_wrist_y = lmList[15][2]
            
            # Shoulders
            right_shoulder_y = lmList[12][2]
            left_shoulder_y = lmList[11][2]
            avg_shoulder_y = (right_shoulder_y + left_shoulder_y) / 2
            
            # Hips and ankles for feet position
            right_hip_x = lmList[24][1]
            left_hip_x = lmList[23][1]
            hip_width = abs(right_hip_x - left_hip_x)
            
            right_ankle_x = lmList[28][1]
            left_ankle_x = lmList[27][1]
            ankle_distance = abs(right_ankle_x - left_ankle_x)
            
            # Determine position state
            # Arms up: wrists above shoulders
            arms_up = (right_wrist_y < avg_shoulder_y) and (left_wrist_y < avg_shoulder_y)
            
            # Feet apart: ankle distance > 1.5x hip width
            feet_apart = ankle_distance > (hip_width * 1.5)
            
            # Arms straight check
            arms_straight = right_arm > 160 and left_arm > 160
            
            # Calculate position percentage (for visual feedback)
            arm_height_diff = avg_shoulder_y - ((right_wrist_y + left_wrist_y) / 2)
            per = np.interp(arm_height_diff, (-50, 150), (0, 100))
            per = max(0, min(100, per))  # Clamp between 0 and 100
            bar = np.interp(per, (0, 100), (380, 50))
            
            # State detection and counting
            if arms_up and feet_apart and arms_straight:
                # Full jumping jack position
                form = 1
                if direction == 0:
                    count += 0.5
                    direction = 1
                    feedback = "Good! Arms Down"
            elif not arms_up and not feet_apart:
                # Starting position
                form = 1
                if direction == 1:
                    count += 0.5
                    direction = 0
                    feedback = "Jump! Arms Up"
            else:
                # Intermediate position
                if arms_up and not feet_apart:
                    feedback = "Spread Feet"
                elif feet_apart and not arms_up:
                    feedback = "Raise Arms"
                elif not arms_straight:
                    feedback = "Straighten Arms"
            
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
            
            # Position indicators
            # Arms indicator
            arm_color = (0, 255, 0) if arms_up else (0, 0, 255)
            cv2.circle(img, (30, 30), 20, arm_color, cv2.FILLED)
            cv2.putText(img, "Arms", (60, 35), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
            
            # Feet indicator
            feet_color = (0, 255, 0) if feet_apart else (0, 0, 255)
            cv2.circle(img, (30, 70), 20, feet_color, cv2.FILLED)
            cv2.putText(img, "Feet", (60, 75), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
            
            # Speed indicator (reps per minute)
            if count > 5:  # Start showing after 5 reps
                current_time = time.time()
                if not hasattr(main, 'start_time'):
                    main.start_time = current_time
                elapsed = current_time - main.start_time
                rpm = (count / elapsed) * 60 if elapsed > 0 else 0
                cv2.putText(img, f'Speed: {int(rpm)} rpm', (10, 350), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 0), 2)
        
        # Display the frame
        cv2.imshow('Jumping Jacks Counter', img)
        
        # Exit on 'q' key press
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    print(f"Workout complete. Total reps: {int(count)}")

if __name__ == "__main__":
    main()