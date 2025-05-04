/**
 * API Configuration
 *
 * This file contains the configuration for the API.
 * Update these values when you have your actual API endpoints.
 */
export const config = {
  /**
   * API URL
   *
   * Set this to your API base URL when ready.
   * Example: "https://api.yourservice.com"
   *
   * When empty, the app will use mock data for development.
   */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "",

  /**
   * API Key
   *
   * Set this to your API key if required by your API.
   */
  /**
   * Debug Mode
   *
   * Enable this to see detailed logs in the console.
   */
  debug: process.env.NODE_ENV === "development",

  /**
   * Cookie Handling
   *
   * The application is configured to include credentials in all API requests.
   * This ensures that cookies set by the backend are included in subsequent requests.
   *
   * Note: Your backend must be configured to:
   * 1. Set the Access-Control-Allow-Credentials header to true
   * 2. Set a specific Access-Control-Allow-Origin (not wildcard *)
   * 3. Set Access-Control-Allow-Headers to include your custom headers
   */
  useCookies: true,
}
