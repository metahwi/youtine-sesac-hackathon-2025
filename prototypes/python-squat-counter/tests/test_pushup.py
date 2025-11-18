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
    feedback = "Get Ready"
    
    print("Starting Push-Up Rep Counter. Press 'q' to quit.")
    
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
            # Calculate key angles for push-ups
            # Elbow angle (shoulder-elbow-wrist)
            elbow = detector.findAngle(img, 11, 13, 15)
            
            # Shoulder angle (elbow-shoulder-hip)
            shoulder = detector.findAngle(img, 13, 11, 23)
            
            # Hip angle (shoulder-hip-knee)
            hip = detector.findAngle(img, 11, 23, 25)
            
            # Calculate percentage of push-up progress
            per = np.interp(elbow, (90, 160), (0, 100))
            bar = np.interp(elbow, (90, 160), (380, 50))
            
            # Check for correct form
            if elbow > 160 and shoulder > 40 and hip > 160:
                form = 1
            
            # Count reps
            if form == 1:
                if per == 0:  # Bottom position
                    if elbow <= 90 and hip > 160:
                        feedback = "Push Up"
                        if direction == 0:
                            count += 0.5
                            direction = 1
                    else:
                        feedback = "Fix Form"
                
                if per == 100:  # Top position
                    if elbow > 160 and shoulder > 40 and hip > 160:
                        feedback = "Lower Down"
                        if direction == 1:
                            count += 0.5
                            direction = 0
                    else:
                        feedback = "Fix Form"
            else:
                feedback = "Straighten Arms & Back"
            
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
            cv2.putText(img, f'Elbow: {int(elbow)}', (10, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
            cv2.putText(img, f'Hip: {int(hip)}', (10, 60), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
        
        # Display the frame
        cv2.imshow('Push-Up Rep Counter', img)
        
        # Exit on 'q' key press
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    print(f"Workout complete. Total reps: {int(count)}")

if __name__ == "__main__":
    main()