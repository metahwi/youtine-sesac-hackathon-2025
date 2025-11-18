import cv2
import numpy as np
from .base_exercise import BaseExercise

class PushupCounter(BaseExercise):
    """Push-up counter implementation."""
    
    def get_required_angles(self, detector, img):
        """Get angles required for push-up analysis."""
        elbow = detector.findAngle(img, 11, 13, 15)
        shoulder = detector.findAngle(img, 13, 11, 23)
        hip = detector.findAngle(img, 11, 23, 25)
        return {"elbow": elbow, "shoulder": shoulder, "hip": hip}
    
    def update_feedback_and_count(self, angles, **kwargs):
        """Update feedback and count based on push-up form."""
        elbow = angles["elbow"]
        shoulder = angles["shoulder"]
        hip = angles["hip"]
        
        self.feedback = "Fix Form"
        
        # Check for proper starting form
        if elbow > 160 and shoulder > 40 and hip > 160:
            self.form = 1
        
        # Count push-ups if form is correct
        if self.form == 1:
            if elbow <= 90 and hip > 160:
                self.feedback = "Up"
                if self.direction == 0:
                    self.count += 0.5
                    self.direction = 1
            elif elbow > 160 and shoulder > 40 and hip > 160:
                self.feedback = "Down"
                if self.direction == 1:
                    self.count += 0.5
                    self.direction = 0
            else:
                self.feedback = "Fix Form"
        
        return self.feedback, self.count, self.direction, self.form
    
    def get_progress_bar_values(self, angles):
        """Calculate progress bar values for push-up."""
        elbow = angles["elbow"]
        per = np.interp(elbow, (90, 160), (0, 100))
        bar = np.interp(elbow, (90, 160), (380, 50))
        return per, bar