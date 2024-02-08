export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Camera = {
  x: number;
  y: number;
};

export enum LayerType {
  Rectangle,
  Ellipse,
  Path,
  Text,
  Note,
  Triangle,
  Arrow,
}

export type TypeLayers = {
  type: LayerType;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type RectangleLayer = TypeLayers & {
  type: LayerType.Rectangle;
};

export type TriangleLayer = TypeLayers & {
  type: LayerType.Triangle;
  value?: string;
};

export type ArrowLayer = TypeLayers & {
  type: LayerType.Arrow;
  flip?: boolean;
};

export type EllipseLayer = TypeLayers & {
  type: LayerType.Ellipse;
};

export type PathLayer = TypeLayers & {
  type: LayerType.Path;
  points: number[][];
};
export type TextLayer = TypeLayers & {
  type: LayerType.Text;
};
export type NoteLayer = TypeLayers & {
  type: LayerType.Note;
};

export type Point = {
  x: number;
  y: number;
};

export type XYWH = Point & {
  width: number;
  height: number;
};

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export type CanvasState =
  | {
      mode: CanvasMode.None;
    }
  | {
      mode: CanvasMode.SelectionNet;
      origin: Point;
      current?: Point;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
    }
  | {
      mode: CanvasMode.Inserting;
      layerType:
        | LayerType.Ellipse
        | LayerType.Note
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Triangle
        | LayerType.Arrow;
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Pressing;
      origin: Point;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
    };

export enum CanvasMode {
  None,
  Pressing,
  SelectionNet,
  Translating,
  Inserting,
  Resizing,
  Pencil,
}

export type Layer =
  | RectangleLayer
  | EllipseLayer
  | PathLayer
  | TextLayer
  | NoteLayer
  | TriangleLayer
  | ArrowLayer;
