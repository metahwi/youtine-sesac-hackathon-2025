# Description: Test script for plank timer with form checking using PoseModule.py

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
    
    # Plank timing variables
    start_time = None
    elapsed_time = 0
    is_in_plank = False
    form = 0  # 0: incorrect form, 1: correct form
    feedback = "Get Ready"
    
    # Form tracking variables
    form_break_count = 0
    max_form_breaks = 3  # Number of form breaks before stopping timer
    
    print("Starting Plank Timer. Press 'q' to quit.")
    print("Position yourself sideways to the camera for best results.")
    
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
            # For plank, we need to check:
            # 1. Body alignment (shoulder-hip-ankle should be nearly straight)
            # 2. Elbow angle (for proper arm position)
            # 3. Hip height (not too high or too low)
            
            # Calculate key angles
            # Body alignment angle
            body_alignment = detector.findAngle(img, 11, 23, 27)  # Shoulder, hip, ankle
            
            # Elbow angles (for forearm plank detection)
            right_elbow = detector.findAngle(img, 12, 14, 16)
            left_elbow = detector.findAngle(img, 11, 13, 15)
            avg_elbow = (right_elbow + left_elbow) / 2
            
            # Hip angle (to detect sagging or piking)
            hip_angle = detector.findAngle(img, 11, 23, 25)  # Shoulder, hip, knee
            
            # Determine plank type and check form
            if avg_elbow < 120:  # Forearm plank
                plank_type = "Forearm Plank"
                # Good form: body alignment 160-180 degrees
                if 160 <= body_alignment <= 180 and 160 <= hip_angle <= 180:
                    form = 1
                    feedback = "Good Form - Hold!"
                else:
                    form = 0
                    if body_alignment < 160:
                        feedback = "Hips Too Low"
                    elif hip_angle < 160:
                        feedback = "Hips Too High"
            else:  # High plank (push-up position)
                plank_type = "High Plank"
                # Good form: body alignment 160-180 degrees, arms straight
                if 160 <= body_alignment <= 180 and 160 <= hip_angle <= 180 and avg_elbow > 160:
                    form = 1
                    feedback = "Good Form - Hold!"
                else:
                    form = 0
                    if body_alignment < 160:
                        feedback = "Hips Too Low"
                    elif hip_angle < 160:
                        feedback = "Hips Too High"
                    elif avg_elbow < 160:
                        feedback = "Straighten Arms"
            
            # Timer logic
            if form == 1:
                if not is_in_plank:
                    # Start timer
                    start_time = time.time()
                    is_in_plank = True
                    form_break_count = 0
                else:
                    # Update elapsed time
                    elapsed_time = time.time() - start_time
            else:
                if is_in_plank:
                    form_break_count += 1
                    if form_break_count >= max_form_breaks:
                        # Stop timer after too many form breaks
                        is_in_plank = False
                        feedback = "Form Break - Timer Stopped"
            
            # Draw UI elements
            # Timer display
            cv2.rectangle(img, (220, 30), (420, 90), (255, 255, 255), cv2.FILLED)
            cv2.rectangle(img, (220, 30), (420, 90), (0, 255, 0), 3)
            minutes = int(elapsed_time // 60)
            seconds = int(elapsed_time % 60)
            cv2.putText(img, f'{minutes:02d}:{seconds:02d}', (240, 75), cv2.FONT_HERSHEY_PLAIN, 3, (0, 255, 0), 3)
            
            # Plank type
            cv2.putText(img, plank_type, (10, 30), cv2.FONT_HERSHEY_PLAIN, 2, (255, 255, 255), 2)
            
            # Form indicator
            if form == 1:
                cv2.circle(img, (50, 100), 30, (0, 255, 0), cv2.FILLED)
            else:
                cv2.circle(img, (50, 100), 30, (0, 0, 255), cv2.FILLED)
            
            # Feedback
            cv2.rectangle(img, (440, 0), (640, 40), (255, 255, 255), cv2.FILLED)
            cv2.putText(img, feedback, (445, 35), cv2.FONT_HERSHEY_PLAIN, 1.5, (0, 255, 0) if form == 1 else (0, 0, 255), 2)
            
            # Progress milestones
            if elapsed_time > 0:
                milestone_text = ""
                if elapsed_time >= 120:
                    milestone_text = "Elite! 2+ min"
                elif elapsed_time >= 60:
                    milestone_text = "Great! 1+ min"
                elif elapsed_time >= 30:
                    milestone_text = "Good! 30+ sec"
                
                if milestone_text:
                    cv2.putText(img, milestone_text, (250, 120), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 215, 0), 2)
            
            # Display angles (optional, for debugging)
            cv2.putText(img, f'Body: {int(body_alignment)}', (10, 450), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
            cv2.putText(img, f'Hip: {int(hip_angle)}', (10, 470), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)
        
        # Display the frame
        cv2.imshow('Plank Timer', img)
        
        # Exit on 'q' key press
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    
    # Final stats
    minutes = int(elapsed_time // 60)
    seconds = int(elapsed_time % 60)
    print(f"Workout complete. Total plank time: {minutes:02d}:{seconds:02d}")

if __name__ == "__main__":
    main()