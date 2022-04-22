import { range } from "lodash";

interface FaceForRating {
  img: string;
  prerating: number;
  postrating: number;
  gender: string;
  correct_key: string;
}

function get_indexes(min: number, max: number): string[] {
  return range(min, max + 1).map((x: number) => x.toString().padStart(2, "0"));
}

const FACES_NAMES = ["HM", "HW"];
const FACES_INDEXES = get_indexes(1, 47);

const FACES_IMAGES: string[] = FACES_NAMES.reduce((arr, name) => {
  arr.push(...FACES_INDEXES.map((index) => `faces/${name + index}.bmp`));

  return arr;
}, []);

const GROUP = Math.round(Math.random());

export const KEYS = [
  ["d", "l"],
  ["l", "d"],
][GROUP];

const FACES: FaceForRating[] = FACES_IMAGES.map((image) => {
  const gender = image.indexOf("HM") === -1 ? "female" : "male";
  return {
    img: image,
    prerating: null,
    postrating: null,
    gender: gender,
    correct_key: gender === "male" ? KEYS[0] : KEYS[1],
  };
});

export { FACES, FACES_IMAGES, FaceForRating };
