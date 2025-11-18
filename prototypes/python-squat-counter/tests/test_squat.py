# Description: Test script for squat rep counter using PoseModule.py

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
    feedback = "Stand Straight"
    
    # Create directory for saving frames (optional)
    if not os.path.exists('data'):
        os.makedirs('data')
    
    print("Starting Squat Rep Counter. Press 'q' to quit.")
    
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
            # For squats, we need to track knee angle and hip angle
            # Hip angle (hip-knee-ankle)
            right_hip = detector.findAngle(img, 24, 26, 28)  # Right hip, knee, ankle
            left_hip = detector.findAngle(img, 23, 25, 27)   # Left hip, knee, ankle
            
            # Knee angle (hip-knee-ankle)
            right_knee = detector.findAngle(img, 12, 24, 26)  # Shoulder, hip, knee
            left_knee = detector.findAngle(img, 11, 23, 25)   # Shoulder, hip, knee
            
            # Average angles for more stable detection
            avg_hip = (right_hip + left_hip) / 2
            avg_knee = (right_knee + left_knee) / 2
            
            # Calculate percentage of squat depth
            # Standing: knees straight (170-180 degrees)
            # Squatting: knees bent (90-110 degrees)
            per = np.interp(avg_hip, (90, 170), (100, 0))
            bar = np.interp(avg_hip, (90, 170), (50, 380))
            
            # Check for correct starting form (standing straight)
            if avg_hip > 160:
                form = 1
            
            # Count reps
            if form == 1:
                if per > 90:  # Deep squat position
                    if avg_hip < 100 and direction == 0:
                        count += 0.5
                        direction = 1
                        feedback = "Stand Up"
                        
                if per < 10:  # Standing position
                    if avg_hip > 160 and direction == 1:
                        count += 0.5
                        direction = 0
                        feedback = "Squat Down"
                        
                if 10 <= per <= 90:
                    feedback = "Good Form"
            else:
                feedback = "Stand Straight"
            
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
            
            # Display angles (for debugging)
            cv2.putText(img, f'Hip: {int(avg_hip)}', (10, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
            cv2.putText(img, f'Knee: {int(avg_knee)}', (10, 60), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
        
        # Display the frame
        cv2.imshow('Squat Rep Counter', img)
        
        # Exit on 'q' key press
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    print(f"Workout complete. Total reps: {int(count)}")

if __name__ == "__main__":
    main()