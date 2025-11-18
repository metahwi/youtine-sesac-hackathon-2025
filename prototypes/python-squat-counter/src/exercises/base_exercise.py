import cv2
import numpy as np
from abc import ABC, abstractmethod

class BaseExercise(ABC):
    """Base class for all exercise counters."""
    
    def __init__(self):
        self.count = 0
        self.direction = 0
        self.form = 0
        self.feedback = "Fix Form"
    
    @abstractmethod
    def update_feedback_and_count(self, angles, **kwargs):
        """Update feedback and count based on exercise-specific logic."""
        pass
    
    @abstractmethod
    def get_required_angles(self, detector, img):
        """Get the angles required for this specific exercise."""
        pass
    
    def draw_ui(self, img, per=None, bar=None):
        """Draw common UI elements on the image."""
        # Progress bar (if percentage provided)
        if per is not None and bar is not None and self.form == 1:
            cv2.rectangle(img, (580, 50), (600, 380), (0, 255, 0), 3)
            cv2.rectangle(img, (580, int(bar)), (600, 380), (0, 255, 0), cv2.FILLED)
            cv2.putText(img, f'{int(per)}%', (565, 430), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 0), 2)

        # Counter
        cv2.rectangle(img, (0, 380), (100, 480), (0, 255, 0), cv2.FILLED)
        cv2.putText(img, str(int(self.count)), (25, 455), cv2.FONT_HERSHEY_PLAIN, 5, (255, 0, 0), 5)
        
        # Feedback
        cv2.rectangle(img, (500, 0), (640, 40), (255, 255, 255), cv2.FILLED)
        cv2.putText(img, self.feedback, (500, 40), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 2)
    
    def reset_counter(self):
        """Reset all counter variables."""
        self.count = 0
        self.direction = 0
        self.form = 0
        self.feedback = "Fix Form"