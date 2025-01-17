// Trulioo SDK Initialization
import truliooDocV from "https://cdn.jsdelivr.net/npm/@trulioo/docv/+esm";
const { Trulioo, event } = truliooDocV;

document
  .getElementById("verification-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const host = "https://fdthvh-8080.csb.app/mobile"; // Desktop URL for redirection after completion

    const elementID = "trulioo-sdk";

    // Fetch the shortCode from the backend
    const response = await fetch("https://fdthvh-8080.csb.app/get-shortCode");
    const data = await response.json();
    const code = data.shortCode;

    // Set up the workflow options
    const workflowOption = Trulioo.workflow()
      .setShortCode(code)
      .setRedirectUrl(host);

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
        console.info("Initialize complete:", complete);
        // Launch the UI with the provided HTML element ID
        Trulioo.launch(elementID, callbackOption).then((success) => {
          console.info("Launch success:", success);
        });
      })
      .catch((error) =>
        console.error("Error initializing mobile workflow:", error)
      );
  });
