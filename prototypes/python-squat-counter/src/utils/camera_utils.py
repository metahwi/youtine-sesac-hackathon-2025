import cv2

def setup_camera():
    """Initialize and return video capture object with error handling."""
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        raise RuntimeError("Could not open camera. Please check your camera connection.")
    
    # Test frame reading
    ret, test_frame = cap.read()
    if not ret:
        cap.release()
        raise RuntimeError("Could not read frame from camera. Please check your camera permissions.")
    
    return cap

def get_video_dimensions(cap):
    """Return the dimensions of the video frame."""
    width = cap.get(3)
    height = cap.get(4)
    return width, height