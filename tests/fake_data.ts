import { writeFile } from "fs";
import { parse } from "json2csv";
import { FACES } from "../src/experiment/sequence/faces";
import {
  select_faces,
  get_block,
} from "../src/experiment/sequence/trial_selection";

for (const face of FACES) {
  face.prerating = Math.floor(Math.random() * 201) - 100;
}

const [PRACTICE_FACES, TRIAL_FACES] = select_faces(FACES);

const SEQUENCE = get_block(PRACTICE_FACES, 0, true);

for (let i = 0; i < 4; ++i) {
  SEQUENCE.push(...get_block(TRIAL_FACES, i + 1));
}

writeFile("tests/fake_data.csv", parse(SEQUENCE), (err) => {
  if (err) console.log(err);
});
