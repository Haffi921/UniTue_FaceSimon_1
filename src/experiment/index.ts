import { initJsPsych } from "jspsych";

import BrowserCheckPlugin from "@jspsych/plugin-browser-check";
import PreloadPlugin from "@jspsych/plugin-preload";

import { FACES, FACES_IMAGES, KEYS } from "./sequence/faces";
import { get_block, select_faces } from "./sequence/trial_selection";

import { prerating } from "./sequence/prerating";
import { trial } from "./sequence/trial";
import { practice_trial } from "./sequence/practice";
import { postrating } from "./sequence/postrating";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";

async function run() {
  const jsPsych = initJsPsych({
    on_finish() {
      jatos
        .submitResultData(jsPsych.data.get().csv())
        .then(() => jatos.endStudy());
    },
  });

  const timeline = [
    {
      type: PreloadPlugin,
      images: FACES_IMAGES,
      message: "Loading...",
    },
    { type: FullscreenPlugin, fullscreen_mode: true },
    {
      type: BrowserCheckPlugin,
      minimum_height: 625,
      minimum_width: 625,
    },
    prerating(jsPsych, FACES, () => {
      const [PRACTICE_FACES, TRIAL_FACES] = select_faces(FACES);

      const PRACTICE_SEQUENCE = get_block(PRACTICE_FACES, true);

      const TRIAL_SEQUENCE = [];

      for (let i = 0; i < 5; ++i) {
        TRIAL_SEQUENCE.push(get_block(TRIAL_FACES));
      }

      jsPsych.addNodeToEndOfTimeline(
        practice_trial(jsPsych, PRACTICE_SEQUENCE, KEYS)
      );
      jsPsych.addNodeToEndOfTimeline(trial(jsPsych, TRIAL_SEQUENCE, KEYS));
      jsPsych.addNodeToEndOfTimeline(postrating(jsPsych, TRIAL_FACES));
    }),
  ];

  await jsPsych.run(timeline);
}

if (typeof jatos !== "undefined") {
  jatos.onLoad(run);
} else {
  run();
}
