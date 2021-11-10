import { injectable } from "inversify";
import { Rectangle, RectangleEvent, RectangleServiceInterface } from "./rectangleServiceInterface";

@injectable()
export class RectangleService implements RectangleServiceInterface {
  public getNegativeSpaceRectangles(bounds: Rectangle, rectangles: Rectangle[]): Rectangle[] {
    // Scan down the bounding rectangle and find events where we
    // hit the top or bottom of a rectangle.
    const events: RectangleEvent[] = [];
    for (let i = bounds.ymin; i <= bounds.ymax; i++) {
      for (const rectangle of rectangles) {
        if (rectangle.ymax === i) {
          // Bottom of rectangle.
          events.push({
            xmin: rectangle.xmin,
            xmax: rectangle.xmax,
            side: 'bottom',
            y: i
          });
        }

        if (rectangle.ymin === i) {
          // Top of rectangle.
          events.push({
            xmin: rectangle.xmin,
            xmax: rectangle.xmax,
            side: 'top',
            y: i
          });
        }
      }
    }

    const logs = [];

    // For each event, create or complete rectangles that
    // fill the space between the existing rectangles.
    let completeRectangles: Rectangle[] = [];
    const incompleteRectangles: Rectangle[] = [{
      xmin: bounds.xmin,
      xmax: bounds.xmax,
      ymin: bounds.ymin,
      ymax: -1
    }];
    for (const event of events) {
      // If event is a bottom, complete the rectangle. We
      // only complete it if it has an area greater than zero.
      // We also start a new rectangle to cover the gap left
      // by the two ended rectangles.
      if (event.side === 'bottom') {
        let newXMin = 0;
        let newXMax = 0;

        // Complete rectangles next to this event.
        for (let i = incompleteRectangles.length - 1; i >= 0; i--) {
          const incompleteRectangle = incompleteRectangles[i];

          if (incompleteRectangle.xmax === event.xmin || incompleteRectangle.xmin === event.xmax) {
            const complete = {
              xmin: incompleteRectangle.xmin,
              xmax: incompleteRectangle.xmax,
              ymin: incompleteRectangle.ymin,
              ymax: event.y
            };

            if (this.getArea(complete) > 0) {
              // Add to complete rectangle.
              completeRectangles.push(complete);
            }

            // Remove this incomplete rectangle, as it has now been completed.
            incompleteRectangles.splice(i, 1);

            // Set new rectangle bounds.
            if (incompleteRectangle.xmax === event.xmin) {
              newXMin = incompleteRectangle.xmin;
            } else if (incompleteRectangle.xmin === event.xmax) {
              newXMax = incompleteRectangle.xmax;
            }
          }
        }

        // Start a new rectangle covering the area left by the
        // previous rectangles.
        // if (newXMax - newXMin > 0) {
          incompleteRectangles.push({
            xmin: newXMin,
            xmax: newXMax,
            ymin: event.y,
            ymax: -1
          // });
        }
      }

      // If the event is a top, start two new incomplete rectangles
      // for every rectangle inside it's x bounds.
      // Also end the current rectangle.
      if (event.side === 'top') {
        for (let i = incompleteRectangles.length - 1; i >= 0; i--) {
          const incompleteRectangle = incompleteRectangles[i];

          // If event is within this rectangle.
          if ((event.xmin <= incompleteRectangle.xmax && event.xmin >= incompleteRectangle.xmin) ||
          (event.xmax <= incompleteRectangle.xmax && event.xmin >= incompleteRectangle.xmin)) {
            // End the rectangle.
            const complete = {
              xmin: incompleteRectangle.xmin,
              xmax: incompleteRectangle.xmax,
              ymin: incompleteRectangle.ymin,
              ymax: event.y
            };

            if (this.getArea(complete) > 0) {
              completeRectangles.push(complete);
            }

            incompleteRectangles.splice(i, 1);

            // Create two new rectangles on either
            // side of the event.
            // if (incompleteRectangle.xmax - event.xmax > 0) {
              incompleteRectangles.push({
                xmin: event.xmax,
                xmax: incompleteRectangle.xmax,
                ymin: event.y,
                ymax: -1
              });
            // }
            // if (event.xmin - incompleteRectangle.xmin > 0) {
              incompleteRectangles.push({
                xmin: incompleteRectangle.xmin,
                xmax: event.xmin,
                ymin: event.y,
                ymax: -1
              });
            // }
          }
        }
      }
    }

    // Complete all incomplete rectangles.
    for (const incompleteRectangle of incompleteRectangles) {
      const complete = {
        xmin: incompleteRectangle.xmin,
        xmax: incompleteRectangle.xmax,
        ymin: incompleteRectangle.ymin,
        ymax: bounds.ymax
      };

      if (this.getArea(complete) > 0) {
        completeRectangles.push(complete);
      }
    }

    // Remove rectangles with a zero area.
    completeRectangles = completeRectangles.filter((rectangle) => {
      return this.getArea(rectangle) > 0
    });

    // Scan sideways over the bounds, and every time we reach a left or right event...
    for (let i = bounds.xmin; i <= bounds.xmax; i++) {
      const deleteIndexes = [];

      for (let j = completeRectangles.length - 1; j >= 0; j--) {
        let hasSplit = false;
        let rectangle = completeRectangles[j];

        // Side of the rectangle?
        if (rectangle.xmax === i || rectangle.xmin === i) {
          hasSplit = true;

          for (let k = completeRectangles.length - 1; k >= 0; k--) {
            let otherRectangle = completeRectangles[k];

            // Is on line.
            if (otherRectangle.xmin < i && otherRectangle.xmax > i) {
              deleteIndexes.push(k);

              const complete = {
                xmin: otherRectangle.xmin,
                xmax: i,
                ymin: otherRectangle.ymin,
                ymax: otherRectangle.ymax
              };

              if (this.getArea(complete) > 0) {
                completeRectangles.push(complete);
              }

              const complete2 = {
                xmin: i,
                xmax: otherRectangle.xmax,
                ymin: otherRectangle.ymin,
                ymax: otherRectangle.ymax
              };

              if (this.getArea(complete2) > 0) {
                completeRectangles.push(complete2);
              }
            }
          }
        }

        if (hasSplit) break;
      }

      for (const index of deleteIndexes) {
        completeRectangles.splice(index, 1);
      }
    }

    // Remove rectangles with a zero area.
    completeRectangles = completeRectangles.filter((rectangle) => {
      return this.getArea(rectangle) > 0
    });

    if (completeRectangles.length < 10) {
      // console.log(bounds);
      // console.log(logs);
      // console.log(rectangles);
      // console.log(events);
    }

    return completeRectangles;
  }

  private getArea(rectangle: Rectangle): number {
    return (rectangle.xmax - rectangle.xmin) * (rectangle.ymax - rectangle.ymin);
  }
}
