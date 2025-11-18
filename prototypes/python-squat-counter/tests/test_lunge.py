# Description: Test script for lunge rep counter using PoseModule.py

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
    feedback = "Stand Upright"
    
    print("Starting Lunge Rep Counter. Press 'q' to quit.")
    print("Face sideways to the camera for best results.")
    
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
            # For lunges, we track the front knee angle
            # Right leg forward
            right_knee = detector.findAngle(img, 24, 26, 28)  # Hip, knee, ankle
            # Left leg forward
            left_knee = detector.findAngle(img, 23, 25, 27)   # Hip, knee, ankle
            
            # Track hip angles for balance
            right_hip = detector.findAngle(img, 12, 24, 26)   # Shoulder, hip, knee
            left_hip = detector.findAngle(img, 11, 23, 25)    # Shoulder, hip, knee
            
            # Determine which leg is forward based on knee position
            if len(lmList) > 26:
                right_knee_y = lmList[26][2]
                left_knee_y = lmList[25][2]
                
                # The leg with lower knee Y-coordinate is forward
                if right_knee_y > left_knee_y:  # Right leg forward
                    front_knee = right_knee
                    back_knee = left_knee
                    stance_hip = right_hip
                else:  # Left leg forward
                    front_knee = left_knee
                    back_knee = right_knee
                    stance_hip = left_hip
                
                # Calculate percentage of lunge depth
                # Standing: front knee straight (170-180 degrees)
                # Lunging: front knee bent (80-100 degrees)
                per = np.interp(front_knee, (80, 170), (100, 0))
                bar = np.interp(front_knee, (80, 170), (50, 380))
                
                # Check for correct starting form (standing straight)
                if front_knee > 160 and stance_hip > 160:
                    form = 1
                
                # Count reps
                if form == 1:
                    if per > 90:  # Deep lunge position
                        if front_knee < 100 and direction == 0:
                            count += 0.5
                            direction = 1
                            feedback = "Push Up"
                            
                    if per < 10:  # Standing position
                        if front_knee > 160 and direction == 1:
                            count += 0.5
                            direction = 0
                            feedback = "Lunge Down"
                    
                    if 10 <= per <= 90:
                        if back_knee < 100:
                            feedback = "Lower Back Knee"
                        else:
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
                
                # Display angles (optional, for debugging)
                cv2.putText(img, f'Front Knee: {int(front_knee)}', (10, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
                cv2.putText(img, f'Back Knee: {int(back_knee)}', (10, 60), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
        
        # Display the frame
        cv2.imshow('Lunge Rep Counter', img)
        
        # Exit on 'q' key press
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    print(f"Workout complete. Total reps: {int(count)}")

if __name__ == "__main__":
    main()