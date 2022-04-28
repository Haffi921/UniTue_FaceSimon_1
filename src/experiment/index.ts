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

  jsPsych.data.addProperties({
    subject: jatos.studyResultId,
    workerID: jatos.workerId,
    prolificPID: jatos.urlQueryParameters.PROLIFIC_PID,
    prolificSID: jatos.urlQueryParameters.STUDY_ID,
    prolificSEID: jatos.urlQueryParameters.SESSION_ID,

    male_key: KEYS[0],
    female_key: KEYS[1],
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
      minimum_width: 886,
    },
    prerating(jsPsych, FACES, () => {
      const [PRACTICE_FACES, TRIAL_FACES] = select_faces(FACES);

      const PRACTICE_SEQUENCE = get_block(PRACTICE_FACES, 0, true);

      const TRIAL_SEQUENCE = [];

      for (let i = 0; i < 4; ++i) {
        TRIAL_SEQUENCE.push(get_block(TRIAL_FACES, i + 1));
      }

      jsPsych.addNodeToEndOfTimeline(
        practice_trial(jsPsych, PRACTICE_SEQUENCE, KEYS)
      );
      jsPsych.addNodeToEndOfTimeline(trial(jsPsych, TRIAL_SEQUENCE, KEYS));
      jsPsych.addNodeToEndOfTimeline(
        postrating(jsPsych, TRIAL_FACES, () => {
          for (const face of FACES) jsPsych.data.get().push(face);
        })
      );
    }),
  ];

  await jsPsych.run(timeline);
}

if (typeof jatos !== "undefined") {
  jatos.onLoad(run);
} else {
  run();
}
