import cv2
import time

def test_camera():
    print("Testing camera access...")
    
    # Try to open the camera
    cap = cv2.VideoCapture(0)
    
    # Check if camera opened successfully
    if not cap.isOpened():
        print("ERROR: Could not open camera!")
        return False
    
    print("Camera opened successfully.")
    print("Attempting to read frames (this will show your webcam feed)...")
    
    # Try to read frames for 10 seconds
    start_time = time.time()
    frame_count = 0
    
    while time.time() - start_time < 10:
        ret, frame = cap.read()
        
        if not ret:
            print("ERROR: Could not read frame!")
            cap.release()
            return False
        
        # Display the frame
        cv2.imshow('Camera Test', frame)
        frame_count += 1
        
        # Exit early on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Print results
    print(f"Successfully read {frame_count} frames in 10 seconds.")
    print("Camera test completed successfully!")
    # Save the last frame
    cv2.imwrite("test_frame.jpg", frame)
    print("Test image saved as 'test_frame.jpg'")
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    return True

if __name__ == "__main__":
    test_camera()