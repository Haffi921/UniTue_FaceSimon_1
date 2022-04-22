import { sortBy, shuffle, cloneDeep, flatten } from "lodash";

import { FaceForRating } from "./faces";

enum ProportionCongruency {
  mostly_congruent = "Mostly Congruent",
  mostly_incongruent = "Mostly Incongruent",
}

const ProportionCongruencySeed = {
  mostly_congruent: [4, 1],
  mostly_incongruent: [1, 4],
};

enum Congruency {
  congruent = "Congruent",
  incongruent = "Incongruent",
}

enum Position {
  Up = "upper",
  Down = "lower",
}

interface FaceForStroop extends FaceForRating {
  proportion_congruency: ProportionCongruency;
}

export interface FaceForTrial extends FaceForStroop {
  congruency: Congruency;
  position: Position;
  distractor: string;
  block_type: string;
  block_nr?: number;
  trial_nr: number;
}

export function select_faces(faces: FaceForRating[]): FaceForRating[][] {
  const gender_equalizer = {
    male: 15,
    female: 15,
  };

  const selected_faces = [],
    practice_faces = [];

  for (const face of sortBy(shuffle(faces), ["prerating"])) {
    if (gender_equalizer[face.gender] > 0) {
      selected_faces.push(face);
      --gender_equalizer[face.gender];
    } else {
      practice_faces.push(face);
    }
  }

  return [practice_faces, selected_faces];
}

function prepare_PC(faces: FaceForRating[]): FaceForStroop[] {
  const pc_faces = {
    male: shuffle(faces.filter((face: FaceForTrial) => face.gender === "male")),
    female: shuffle(
      faces.filter((face: FaceForTrial) => face.gender === "female")
    ),
  };

  for (let gender of Object.keys(pc_faces)) {
    pc_faces[gender] = pc_faces[gender].map(
      (face: FaceForStroop, index: number): FaceForStroop => {
        if (index < pc_faces[gender].length / 2) {
          face.proportion_congruency = ProportionCongruency.mostly_congruent;
        } else {
          face.proportion_congruency = ProportionCongruency.mostly_incongruent;
        }
        return face;
      }
    );
    pc_faces[gender] = shuffle(pc_faces[gender]);
  }

  return shuffle([
    ...(<FaceForStroop[]>pc_faces.male),
    ...(<FaceForStroop[]>pc_faces.female),
  ]);
}

class RotatingIndexArray {
  indexArray: number[];

  constructor(seed: number[], length: number) {
    const arrsum = (arr: number[]) =>
      arr.reduce((sum: number, value: number) => sum + value, 0);
    const multiplier = length / arrsum(seed);

    this.indexArray = Array(Math.round(seed[0] * multiplier)).fill(0);
    this.indexArray.push(...Array(Math.round(seed[1] * multiplier)).fill(1));
  }

  forward(i: number = 1) {
    for (let rounds = 0; rounds < i; ++rounds) {
      this.indexArray.push(this.indexArray.shift());
    }
  }
}

function create_practice_block(faces: FaceForStroop[]): FaceForTrial[] {
  const pc_faces = {
    mostly_congruent: faces.filter(
      (face: FaceForStroop) =>
        face.proportion_congruency === ProportionCongruency.mostly_congruent
    ),
    mostly_incongruent: faces.filter(
      (face: FaceForStroop) =>
        face.proportion_congruency === ProportionCongruency.mostly_incongruent
    ),
  };

  for (const PC of Object.keys(pc_faces)) {
    const rotating_index = new RotatingIndexArray(
      ProportionCongruencySeed[PC],
      pc_faces[PC].length
    );
    pc_faces[PC] = shuffle(cloneDeep(<FaceForStroop[]>pc_faces[PC]));

    for (const index in pc_faces[PC]) {
      const face: FaceForTrial = pc_faces[PC][index];
      face.congruency =
        rotating_index.indexArray[index] === 0
          ? Congruency.congruent
          : Congruency.incongruent;
      face.position =
        Math.round(Math.random()) === 0 ? Position.Up : Position.Down;

      if (face.gender === "male") {
        face.distractor =
          rotating_index.indexArray[index] === 0 ? "MAN" : "WOMAN";
      } else {
        face.distractor =
          rotating_index.indexArray[index] === 0 ? "WOMAN" : "MAN";
      }

      face.trial_nr = parseInt(index);

      face.block_type = "practice";
    }
  }

  return shuffle([
    ...(<FaceForTrial[]>pc_faces.mostly_congruent),
    ...(<FaceForTrial[]>pc_faces.mostly_incongruent),
  ]);
}

function create_trial_block(faces: FaceForStroop[]): FaceForTrial[] {
  const pc_faces = {
    mostly_congruent: faces.filter(
      (face: FaceForStroop) =>
        face.proportion_congruency === ProportionCongruency.mostly_congruent
    ),
    mostly_incongruent: faces.filter(
      (face: FaceForStroop) =>
        face.proportion_congruency === ProportionCongruency.mostly_incongruent
    ),
  };

  let sequence: FaceForTrial[][] = Array(5)
    .fill(null)
    .map(() => []);

  for (const PC of Object.keys(pc_faces)) {
    const rotating_index = new RotatingIndexArray(
      ProportionCongruencySeed[PC],
      pc_faces[PC].length
    );
    pc_faces[PC] = shuffle(pc_faces[PC]);

    for (let i = 0; i < 5; ++i) {
      const trial_faces = (<FaceForTrial[]>cloneDeep(pc_faces[PC])).map(
        (face: FaceForTrial, index: number) => {
          face.congruency =
            rotating_index.indexArray[index] === 0
              ? Congruency.congruent
              : Congruency.incongruent;
          face.position =
            Math.round(Math.random()) === 0 ? Position.Up : Position.Down;

          if (face.gender === "male") {
            face.distractor =
              rotating_index.indexArray[index] === 0 ? "MAN" : "WOMAN";
          } else {
            face.distractor =
              rotating_index.indexArray[index] === 0 ? "WOMAN" : "MAN";
          }

          face.block_type = "trial";
          face.block_nr = i + 1;
          face.trial_nr = index;

          return face;
        }
      );

      sequence[i].push(...shuffle(trial_faces));

      rotating_index.forward(3);
    }
  }

  for (const index in sequence) {
    sequence[index] = shuffle(sequence[index]);
  }

  return flatten(shuffle(sequence));
}

export function get_block(
  faces: FaceForRating[],
  practice: boolean = false
): FaceForTrial[] {
  if (practice) {
    return create_practice_block(prepare_PC(faces));
  }
  return create_trial_block(prepare_PC(faces));
}
