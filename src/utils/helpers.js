// utils/helpers.js
export const createSlug = (string) => {
    return string
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-'); // Replace multiple - with single -
  };

 export const formatKebabToTitle = (str) => {
    return str
      .split('-')                          // Split at hyphens
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter
      .join(' ');                          // Join with spaces
  }