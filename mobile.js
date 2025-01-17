import truliooDocV from "https://cdn.jsdelivr.net/npm/@trulioo/docv/+esm";
const { Trulioo, event } = truliooDocV;

async function initializeSDK() {
  // Extract the shortCode and locale from the URL
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const shortCodeParam = urlParams.get("code");
  const localeParam = urlParams.get("locale");

  const host = "https://fdthvh-8080.csb.app/"; // Desktop URL for redirection after completion

  // Fetch the shortCode from the backend
  const response = await fetch(
    "https://fdthvh-8080.csb.app/get-stored-shortCode"
  );
  const data = await response.json();
  const shortCode = data.shortCode;

  let selectedShortCode = shortCodeParam; // Use the obtained short code from the url param

  if (shortCodeParam === null) {
    selectedShortCode = shortCode; // Use the obtained short code from the Trulioo Customer API
  }

  // Set up the workflow options
  const workflowOption = Trulioo.workflow()
    .setShortCode(selectedShortCode)
    .setRedirectUrl(host);

  if (localeParam !== null) {
    workflowOption.setLanguage(localeParam);
  }

  // Set up callbacks to get results and debugging errors
  const callbacks = new event.adapters.ListenerCallback({
    onComplete: (success) => {
      console.info(`Verification Successful: ${success.transactionId}`);
    },
    onError: (error) => {
      console.error(
        `Verification Failed with Error Code: ${error.code}, TransactionID: ${error.transactionId}, Reason: ${error.message}`
      );
    },
    onException: (exception) => {
      console.error("Verification Failed with Exception:", exception);
    },
  });

  const callbackOption = Trulioo.event().setCallbacks(callbacks);

  // Initialize the Trulioo SDK
  Trulioo.initialize(workflowOption)
    .then((complete) => {
      console.info("Mobile Initialize complete:", complete);
      Trulioo.launch("trulioo-sdk", callbackOption).then((success) => {
        console.info("Mobile Launch success:", success);
      });
    })
    .catch((error) =>
      console.error("Error initializing mobile workflow:", error)
    );
}

// Call the function to initialize the SDK
initializeSDK();
