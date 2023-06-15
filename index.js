// More documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// The link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/TC3G3aWSK/";

async function createModel() {
  const checkpointURL = URL + "model.json"; // model topology
  const metadataURL = URL + "metadata.json"; // model metadata

  const recognizer = speechCommands.create(
    "BROWSER_FFT", // Fourier transform type, not useful to change
    undefined, // Speech commands vocabulary feature, not useful for your models
    checkpointURL,
    metadataURL
  );

  // Check that model and metadata are loaded via HTTPS requests.
  await recognizer.ensureModelLoaded();

  return recognizer;
}

async function init() {
  const recognizer = await createModel();
  const classLabels = recognizer.wordLabels(); // Get class labels
  const labelContainer = document.getElementById("label-container");
  const progressBarContainer = document.getElementById("progress-bar-container");
  
  // Create label elements and progress bars
  for (let i = 0; i < classLabels.length; i++) {
    const labelElement = document.createElement("div");
    labelElement.innerHTML = `<strong>${classLabels[i]}</strong>`;
    
    const progressBarElement = document.createElement("div");
    progressBarElement.classList.add("bg-gray-200", "h-2", "rounded-full");
    progressBarElement.innerHTML = `<div class="bg-green-500 h-full rounded-full" style="width: 0;"></div>`;
    
    labelElement.appendChild(progressBarElement);
    labelContainer.appendChild(labelElement);
  }

  // Listen() takes two arguments:
  // 1. A callback function that is invoked anytime a word is recognized.
  // 2. A configuration object with adjustable fields
  recognizer.listen(
    (result) => {
      const scores = result.scores; // Probability of prediction for each class
      
      // Render the probability scores and update progress bars
      for (let i = 0; i < classLabels.length; i++) {
        const classPrediction = classLabels[i] + ": " + (scores[i] * 100).toFixed(2) + "%";
        const labelElement = labelContainer.childNodes[i];
        labelElement.querySelector("strong").innerText = classPrediction;
        
        const progressBar = labelElement.querySelector(".bg-green-500");
        progressBar.style.width = `${(scores[i] * 100).toFixed(2)}%`;
      }
    },
    {
      includeSpectrogram: true, // In case listen should return result.spectrogram
      probabilityThreshold: 0.75,
      invokeCallbackOnNoiseAndUnknown: true,
      overlapFactor: 0.5, // Probably want between 0.5 and 0.75. More info in README
    }
  );

  // Stop the recognition in 5 seconds.
  // setTimeout(() => recognizer.stopListening(), 5000);
}
