export type Rectangle = {
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number
};

export type RectangleEvent = {
  xmin: number,
  xmax: number,
  side: 'top'|'bottom',
  y: number
};

export interface RectangleServiceInterface {
  /**
  * Assumes rectangles are integers.
  *
  * Assumes an inverted y axis.
  *
  * @param bounds
  * @param rectangles
  * @returns
  */
  getNegativeSpaceRectangles(bounds: Rectangle, rectangles: Rectangle[]): Rectangle[];
}
