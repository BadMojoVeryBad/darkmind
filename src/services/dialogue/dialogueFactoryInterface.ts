import { Dialogue } from "./dialogue";

export interface DialogueFactoryInterface {
  create(name: string): Dialogue[];
}
