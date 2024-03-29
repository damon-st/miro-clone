"use client";
import { nanoid } from "nanoid";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Info } from "./info";
import { Participans } from "./participans";
import { Toolbar } from "./toolbar";
import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  Layer,
  LayerType,
  Point,
  Side,
  XYWH,
} from "@/types/canvas";
import {
  useHistory,
  useCanRedo,
  useCanUndo,
  useMutation,
  useStorage,
  useOthersMapped,
  useSelf,
} from "@/liveblocks.config";
import { CursorPresence } from "./cursos-precence";
import {
  colorToCss,
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selectionTools";
import { Path } from "./path";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { toPng } from "html-to-image";
import { DownloadCloud, ImageIcon } from "lucide-react";
import { Hint } from "@/components/hint";
import { Layers } from "./layers";
import MiniMap from "./mini-map";

const MAX_LAYERS = 100;
type Props = {
  boardId: string;
};
export const Canvas = ({ boardId }: Props) => {
  const svgRef = useRef<any | null>(null);
  const contentMainRef = useRef<HTMLElement | null>(null);
  const layerIds = useStorage((root) => root.layerIds);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [whelValue, setDevouceWhel] = useDebounceValue({ x: 0, y: 0 }, 300);
  const [scale, setScale] = useDebounceValue(1, 50);
  const [isDragging, setIsDragging] = useState(false);
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    b: 0,
    g: 0,
  });
  useDisableScrollBounce();
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Note
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Triangle
        | LayerType.Arrow,
      position: Point
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        toast.error("Sorry your exedet limit in your board");
        console.log("EXED");

        return;
      }
      const liveLayersIds = storage.get("layerIds");
      const layerId = nanoid();
      const layer = new LiveObject<Layer>({
        type: layerType,
        x: position.x / scale,
        y: position.y / scale,
        height: 100 / scale,
        width: 100 / scale,
        fill: lastUsedColor,
      });
      liveLayersIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
    },
    [lastUsedColor]
  );

  const transalteSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }
      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");

      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState]
  );

  const unSelectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const layers = storage.get("layers").toImmutable();
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin: origin,
        current,
      });
      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        origin,
        current
      );
      setMyPresence({ selection: ids });
    },
    [layerIds]
  );

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;
      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      ) {
        return;
      }
      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft.length === 1 &&
          pencilDraft[0][0] == point.x &&
          pencilDraft[0][1] == point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode]
  );

  const inserPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const { pencilDraft } = self.presence;
      if (
        pencilDraft == null ||
        pencilDraft.length < 2 ||
        liveLayers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null });
        toast.error("Sorry your exedet limit in your board");

        return;
      }
      const id = nanoid();
      liveLayers.set(
        id,
        new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
      );
      const liveLayerIds = storage.get("layerIds");
      liveLayerIds.push(id);
      setMyPresence({ pencilDraft: null });
      setCanvasState({ mode: CanvasMode.Pencil });
    },
    [lastUsedColor]
  );

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor]
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }
      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(self.presence.selection[0]);
      if (layer) {
        layer.update(bounds);
      }
    },
    [canvasState]
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isDragging) return;
      setDevouceWhel({ x: e.deltaX, y: e.deltaY });
      setCamera((camera) => ({
        x: camera.x - e.deltaX,
        y: camera.y - e.deltaY,
      }));
    },
    [isDragging, setDevouceWhel]
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history]
  );

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      if (isDragging) return;
      e.preventDefault();
      const current = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode == CanvasMode.Translating) {
        transalteSelectedLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      }

      setMyPresence({
        cursor: {
          x: current.x,
          y: current.y,
        },
      });
    },
    [
      isDragging,
      canvasState,
      resizeSelectedLayer,
      camera,
      continueDrawing,
      transalteSelectedLayers,
      startMultiSelection,
      updateSelectionNet,
    ]
  );

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    // setMyPresence({ cursor: null });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.Inserting) {
        return;
      }
      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setCanvasState, startDrawing]
  );

  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera);
      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unSelectLayers();
        setCanvasState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        inserPath();
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
      history.resume();
    },
    [
      camera,
      canvasState,
      history,
      insertLayer,
      inserPath,
      setCanvasState,
      insertLayer,
      unSelectLayers,
    ]
  );

  const selections = useOthersMapped((other) => other.presence.selection);

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }
      history.pause();
      e.stopPropagation();
      const point = pointerEventToCanvasPoint(e, camera);
      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode]
  );
  const onSelectLayer = useMutation(
    ({ self, setMyPresence }, point: Point, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }
      history.pause();
      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }
      onUserCamera({ ...point });
      // setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode]
  );

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsTocolorSelection: Record<string, string> = {};
    for (const user of selections) {
      const [connectionId, selection] = user;
      for (const layerId of selection) {
        layerIdsTocolorSelection[layerId] = connectionIdToColor(connectionId);
      }
    }
    return layerIdsTocolorSelection;
  }, [selections]);

  const deleteLayers = useDeleteLayers();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Delete":
          deleteLayers();
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              history.redo();
            } else {
              history.undo();
            }
          }
          break;
        case "Escape":
          unSelectLayers();
          setCanvasState({ mode: CanvasMode.None });

          break;

        default:
          break;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteLayers, history]);

  const onUserCamera = (value: Camera) => {
    const bounds = contentMainRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setCamera({
      x: (bounds.x - value.x) / 2,
      y: (bounds.y - value.y) / 2,
    });
  };
  const [startMouseX, setStartMouseX] = useState(0);
  const [startMouseY, setStartMouseY] = useState(0);
  const [startTranslateX, setStartTranslateX] = useState(0);
  const [startTranslateY, setStartTranslateY] = useState(0);

  useEffect(() => {
    // Obtén referencias a los elementos relevantes
    const svgContainer = document.getElementById("svg-container");
    if (svgContainer == null) return;
    const svgElement = document.getElementById("my-svg");
    if (svgElement == null) return;
    const svgGroup = svgElement.querySelector("g");
    if (svgGroup == null) return;
    // Configuración inicial de la escala
    let scale = 1;

    // Función para manejar el evento de rueda del mouse (zoom)
    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey) {
        return;
      }
      // Evitar el comportamiento predeterminado del zoom del navegador
      event.preventDefault();

      // Ajusta la escala basada en la dirección de la rueda
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      scale *= delta;
      if (scale >= 1.1) {
        scale = 1.1;
      } else if (scale <= 0.9) {
        scale = 0.9;
      }
      // Aplica la transformación de escala al grupo dentro del SVG
      // svgGroup?.setAttribute("transform", `scale(${scale})`);
      setScale(scale);
    }
    // Agrega un event listener para el evento de rueda del mouse
    svgContainer.addEventListener("wheel", handleWheel);

    const handleResize = () => {
      // const vw = window.innerWidth * 1.1; // 110% del ancho de la ventana
      // const vh = window.innerHeight * 1.1; // 110% del alto de la ventana
      // const viewBoxValue = `0 0 ${vw} ${vh}`;
      // svgElement.setAttribute("viewBox", viewBoxValue);
    };

    // Agregar un escucha de eventos de cambio de tamaño de ventana
    window.addEventListener("resize", handleResize);

    // Establecer el viewBox inicial
    handleResize();

    // Limpiar el escucha de eventos cuando el componente se desmonta
    return () => {
      svgContainer.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
    };
  }, [setScale]);

  const handleMouseMove = (event: React.MouseEvent) => {
    // Verifica si el botón del ratón está presionado (arrastrando)
    if (isDragging) {
      // Calcula la diferencia en la posición del ratón desde el inicio del arrastre
      const deltaX = event.clientX - startMouseX;
      const deltaY = event.clientY - startMouseY;
      // Calcula las nuevas coordenadas de la transformación
      const newTranslateX = startTranslateX + deltaX;
      const newTranslateY = startTranslateY + deltaY;
      setCamera({
        x: newTranslateX,
        y: newTranslateY,
      });
      setStartMouseX(event.clientX);
      setStartMouseY(event.clientY);
      setStartTranslateX(newTranslateX);
      setStartTranslateY(newTranslateY);
    }
    onRestringCamera(event);
  };

  const onRestringCamera = (event: React.MouseEvent) => {
    // // Actualiza la posición de la cámara al arrastrar
    // setCamera((prevPosition) => ({
    //   x: prevPosition.x - event.movementX,
    //   y: prevPosition.y - event.movementY,
    // }));
    // Asegúrate de que la posición de la cámara se mantenga dentro de los límites del viewBox
    // const vw = window.innerWidth * 1.2;
    // const vh = window.innerHeight * 1.2;
    // setCamera((prevPosition) => ({
    //   x: Math.min(Math.max(prevPosition.x, 0), vw - window.innerWidth),
    //   y: Math.min(Math.max(prevPosition.y, 0), vh - window.innerHeight),
    // }));
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    // Verifica si el clic fue con el botón de la rueda del ratón (botón central)
    if (event.button !== 1) {
      return;
    }
    setIsDragging(true);
    setStartMouseX(event.clientX);
    setStartMouseY(event.clientY);
    setStartTranslateX(camera.x);
    setStartTranslateY(camera.y);
  };

  const hadleMouseLeave = () => {
    setIsDragging(false);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);
    onRestringCamera(e);
  };

  const handleExportClick = () => {
    if (svgRef.current) {
      toPng(svgRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "exported-image.png";
          link.click();
        })
        .catch((error) => {
          console.error("Error exporting image:", error);
        });
    }
  };
  return (
    <main
      ref={contentMainRef}
      id="svg-container"
      className="size-full relative bg-neutral-100 touch-none"
    >
      <div className="absolute bottom-2 flex flex-col space-y-4 right-2 items-end">
        <Layers onUserCamera={onUserCamera} onSelectLayer={onSelectLayer} />
        <Hint label="Save to image ">
          <div
            onClick={handleExportClick}
            className=" cursor-pointer w-fit  bg-white p-2 shadow-sm flex  flex-col items-center"
          >
            <DownloadCloud size={30} className="text-blue-500" />
            <ImageIcon size={30} className="text-blue-500" />
          </div>
        </Hint>
        <div
          onClick={() => setScale(1.0)}
          className=" cursor-pointer  bg-white p-2 shadow-sm"
        >
          <p>Zoom | {scale.toFixed(2)}</p>
        </div>
        <MiniMap camera={camera} svgRef={svgRef.current} />
      </div>

      <Info boardId={boardId} />
      <Participans onUserCamera={onUserCamera} />
      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo}
        redo={history.redo}
      />
      <SelectionTools
        scale={scale}
        camera={camera}
        setLastUsedColor={setLastUsedColor}
      />
      <svg
        ref={svgRef}
        id="my-svg"
        onWheel={onWheel}
        className="h-[100vh] w-[100vw]"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerUp={onPointerUp}
        onPointerDown={onPointerDown}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={hadleMouseLeave}
      >
        <g
          id="canvasBounds"
          style={{
            transform: `translate(${camera.x}px,${camera.y}px) scale(${scale})`,
          }}
        >
          {layerIds.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}
          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current != null && (
              <rect
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                x={
                  Math.min(canvasState.origin.x, canvasState.current?.x) / scale
                }
                y={
                  Math.min(canvasState.origin.y, canvasState.current?.y) / scale
                }
                width={
                  Math.abs(canvasState.origin.x - canvasState.current.x) / scale
                }
                height={
                  Math.abs(canvasState.origin.y - canvasState.current.y) / scale
                }
              />
            )}
          <CursorPresence />
          {pencilDraft != null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCss(lastUsedColor)}
              x={0}
              y={0}
            />
          )}
        </g>
      </svg>
    </main>
  );
};
