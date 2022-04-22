import { JsPsych } from "jspsych";

import ImageSliderResponsePlugin from "@jspsych/plugin-image-slider-response";
import InstructionsPlugin from "@jspsych/plugin-instructions";

import { FaceForRating } from "./faces";

function instructions() {
  const continue_hint = "Please press [L] key to continue &#x27A1";
  const backtrack_hint = "&#x2B05 [D] key to go back";

  function hint(backtrack = true) {
    let text = continue_hint;
    if (backtrack) {
      text = continue_hint + "</p><p>" + backtrack_hint;
    }

    return `<div class="hint"><p>${text}</p></div>`;
  }

  function page(backtrack = true, ...args) {
    return `<div class="instruction_container"><p>${Array.from(args).join(
      "</p><p>"
    )}</p>${hint(backtrack)}</div>`;
  }

  const instructions_pages = [
    page(false, "Welcome!"),
    page(
      true,
      "Before we start, please make sure your browser's zoom level is set to 100% by pressing <b>Ctrl-0</b>"
    ),
    page(true, "This is the first part out of four in this experiment"),
    page(
      true,
      "In this part, we will present to you several faces",
      "Your task is to rate these faces on a sliding scale in terms of pleasantness"
    ),
    page(
      true,
      "You may now begin",
      "When you are ready to <b>start</b> press the [L] key"
    ),
  ];

  return {
    type: InstructionsPlugin,
    pages: instructions_pages,
    key_backward: "d",
    key_forward: "l",
    post_trial_gap: 1000,
  };
}

export function prerating(
  jsPsych: JsPsych,
  faces: FaceForRating[],
  on_finish: () => void
) {
  const get = jsPsych.timelineVariable;
  return {
    timeline: [
      instructions(),
      {
        timeline: [
          {
            type: ImageSliderResponsePlugin,
            stimulus: get("img"),
            prompt: "<p>How pleasant or unpleasant do judge this face?</p>",
            min: -100,
            slider_start: 0,
            labels: ["Very unpleasant", "Neutral", "Very pleasant"],
            data() {
              return {
                block_type: "prerating",
              };
            },
            on_finish(data) {
              faces.find(
                (face: FaceForRating) => face.img === get("img")
              ).prerating = data.response;
            },
          },
        ],
        timeline_variables: faces,
        randomize_order: true,
        on_timeline_finish: on_finish,
      },
    ],
  };
}
