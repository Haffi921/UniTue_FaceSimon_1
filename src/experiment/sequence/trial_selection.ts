import { sortBy, shuffle, cloneDeep, flatten } from "lodash";

import { FaceForRating, KEYS } from "./faces";

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
  Left = "left",
  Right = "right",
}

interface FaceForStroop extends FaceForRating {
  proportion_congruency: ProportionCongruency;
}

export interface FaceForTrial extends FaceForStroop {
  congruency: Congruency;
  position: Position;
  block_type: string;
  block_nr?: number;
  trial_nr: number;
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

export function select_faces(faces: FaceForRating[]): FaceForStroop[][] {
  const gender_equalizer = {
    male: 20,
    female: 20,
  };

  const selected_faces = [],
    practice_faces = [];

  const sortedFaces = sortBy(shuffle(faces), (face) =>
    Math.abs(face.prerating)
  );

  for (const face of sortedFaces) {
    if (gender_equalizer[face.gender] > 0) {
      selected_faces.push(face);
      --gender_equalizer[face.gender];
    } else {
      practice_faces.push(face);
    }
  }

  return [prepare_PC(practice_faces), prepare_PC(selected_faces)];
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

      if (face.gender === "male") {
        if (KEYS[0] === "d")
          face.position =
            rotating_index.indexArray[index] === 0
              ? Position.Left
              : Position.Right;
        else if (KEYS[0] === "l")
          face.position =
            rotating_index.indexArray[index] === 0
              ? Position.Right
              : Position.Left;
      } else {
        if (KEYS[1] === "d")
          face.position =
            rotating_index.indexArray[index] === 0
              ? Position.Left
              : Position.Right;
        else if (KEYS[1] === "l")
          face.position =
            rotating_index.indexArray[index] === 0
              ? Position.Right
              : Position.Left;
      }

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

          if (face.gender === "male") {
            if (KEYS[0] === "d")
              face.position =
                rotating_index.indexArray[index] === 0
                  ? Position.Left
                  : Position.Right;
            else if (KEYS[0] === "l")
              face.position =
                rotating_index.indexArray[index] === 0
                  ? Position.Right
                  : Position.Left;
          } else {
            if (KEYS[1] === "d")
              face.position =
                rotating_index.indexArray[index] === 0
                  ? Position.Left
                  : Position.Right;
            else if (KEYS[1] === "l")
              face.position =
                rotating_index.indexArray[index] === 0
                  ? Position.Right
                  : Position.Left;
          }

          face.block_type = "trial";

          return face;
        }
      );

      sequence[i].push(...shuffle(trial_faces));

      rotating_index.forward(4);
    }
  }

  for (const index in sequence) {
    sequence[index] = shuffle(sequence[index]);
  }

  return flatten(shuffle(sequence));
}

export function get_block(
  faces: FaceForStroop[],
  block: number = 0,
  practice: boolean = false
): FaceForTrial[] {
  if (practice) {
    return create_practice_block(faces).map((face, index) => {
      face.trial_nr = index + 1;
      face.block_nr = 0;
      return face;
    });
  }
  return create_trial_block(faces).map((face, index) => {
    face.trial_nr = index + 1;
    face.block_nr = block;
    return face;
  });
}
