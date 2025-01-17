# trulioo_web_sdk_integration
Example use-case of Trulioo's web SDK, do implement a document verification workflow from desktop -> mobile -> back to desktop.

The Web SDK provides components for JavaScript applications to facilitate the capture of government-issued identity documents and biometrics to use for identity verification,
where a user can upload picture of their identity verification document and selfie from their phones, and the web application is notified using callbacks to update on the desktop.
The node.js backend implemented in index.js makes calls to retrieve the accessToken, transaction ID and a timed shortcode to initialize the document submission flow. 

