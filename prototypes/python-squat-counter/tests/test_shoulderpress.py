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
    feedback = "Lower Arms to Shoulders"
    
    print("Starting Shoulder Press Rep Counter. Press 'q' to quit.")
    print("Position yourself facing the camera for best results.")
    
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
            # For shoulder press, we track the angle between shoulder, elbow, and wrist
            # as well as the vertical position of the wrists relative to the head
            
            # Calculate angles for both arms
            right_arm = detector.findAngle(img, 12, 14, 16)  # Right shoulder, elbow, wrist
            left_arm = detector.findAngle(img, 11, 13, 15)   # Left shoulder, elbow, wrist
            
            # Average angle for more stable tracking
            avg_angle = (right_arm + left_arm) / 2
            
            # Get vertical positions of key points for position tracking
            if len(lmList) > 16:  # Make sure we have enough landmarks
                right_wrist_y = lmList[16][2]  # Y-coordinate of right wrist
                left_wrist_y = lmList[15][2]   # Y-coordinate of left wrist
                right_shoulder_y = lmList[12][2]  # Y-coordinate of right shoulder
                left_shoulder_y = lmList[11][2]   # Y-coordinate of left shoulder
                head_y = lmList[0][2]  # Y-coordinate of nose/head
                
                # Calculate average positions
                avg_wrist_y = (right_wrist_y + left_wrist_y) / 2
                avg_shoulder_y = (right_shoulder_y + left_shoulder_y) / 2
                
                # Check position: wrists should be below shoulders in starting position
                # and above head in full extension
                wrists_above_head = avg_wrist_y < head_y
                wrists_below_shoulders = avg_wrist_y > avg_shoulder_y
                
                # Calculate percentage of press (based on angle)
                # Starting: arms bent (~90-110 degrees)
                # Extended: arms straight (~160-180 degrees)
                per = np.interp(avg_angle, (90, 170), (0, 100))
                bar = np.interp(avg_angle, (90, 170), (380, 50))
                
                # Determine form and count reps
                if wrists_below_shoulders and avg_angle < 120:
                    form = 1  # Good starting position
                
                if form == 1:
                    if per > 90 and wrists_above_head:  # Full extension position
                        if avg_angle > 160 and direction == 0:
                            count += 0.5
                            direction = 1
                            feedback = "Lower Arms"
                            
                    if per < 10 and wrists_below_shoulders:  # Starting position
                        if avg_angle < 110 and direction == 1:
                            count += 0.5
                            direction = 0
                            feedback = "Press Up"
                    
                    if 10 <= per <= 90:
                        feedback = "Good Form"
                else:
                    feedback = "Start with Arms at Shoulders"
                
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
                cv2.putText(img, f'Angle: {int(avg_angle)}', (10, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
        
        # Display the frame
        cv2.imshow('Shoulder Press Rep Counter', img)
        
        # Exit on 'q' key press
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    print(f"Workout complete. Total reps: {int(count)}")

if __name__ == "__main__":
    main()