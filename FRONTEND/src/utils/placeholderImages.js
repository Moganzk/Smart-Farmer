// This file exports placeholder images for web development
// It helps prevent "Module not found" errors when running in web mode

const placeholderImage = { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAZdJREFUeF7t1MEJADAMw8B2/6Fd4UtCMcYCI+9193P0eGzB3MZ5wVgg8A0UiAJsQQO2bkAUYAsasHUDosBb0ABSNyAKsAUN2LoBUYAtaMDWDYgCb0EDSNGAKMAWNGDrBkQBtqABWzcgCrwFDSBFA6IAW9CArRsQBdiCBmzdgCjwFjSAFA2IAmxBA7ZuQBRgCxqwdQOiwFvQAFI0IAqwBQ3YugFRgC1owNYNiAJvQQNI0YAowBY0YOsGRAG2oAFbNyAKvAUNIEUDogBb0ICtGxAF2IIGbN2AKPAWNIAUDYgCbEEDtm5AFGALGrB1A6LAW9AAUjQgCrAFDdi6AVGALWjA1g2IAm9BA0jRgCjAFjRg6wZEAbagAVs3IAq8BQ0gRQOiAFvQgK0bEAXYggZs3YAo8BY0gBQNiAJsQQO2bkAUYAsasHUDosBb0ABSNCAKsAUN2LoBUYAtaMDWDYgCb0EDSNGAKMAWNGDrBkQBtqABWzcgCrwFDSBFA6IAW9CArRsQBdiCBmzdgCjwFjSAFA2IAmxBA7ZuQBRgCxqwdQOiwFvQAFI0IAr8AJQVBBXSmjgVAAAAAElFTkSuQmCC' };

// Export placeholders for all required images
export const images = {
  // Logo images
  logo: placeholderImage,
  
  // Onboarding images
  'onboarding-disease': placeholderImage,
  'onboarding-advisory': placeholderImage,
  'onboarding-community': placeholderImage,
  'onboarding-offline': placeholderImage,
  
  // Featured images
  'featured-disease-prevention': placeholderImage,
  'featured-irrigation': placeholderImage,
  
  // You can add more as needed
};

// Function to get a placeholder image
export const getImage = (name) => {
  return images[name] || placeholderImage;
};

export default images;