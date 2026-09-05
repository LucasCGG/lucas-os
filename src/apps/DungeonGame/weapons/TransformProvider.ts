import { Transform } from "../engine";

export interface TransformProvider {
  getTransform(): Transform;
}
