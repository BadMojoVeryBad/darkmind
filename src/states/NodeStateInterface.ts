/**
 * Defines an interface for adding a state to a node.
 */
export interface NodeStateInterface<T> {
  /**
   * The name of the state.
   */
  getName(): string;

  /**
   *
   * @param time To be run every update step of the game.
   *
   * @param delta
   * @param context
   */
  update(time: number, delta: number, context: T): NodeStateInterface<T>;
}
