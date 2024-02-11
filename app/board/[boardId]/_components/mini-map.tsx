import { Camera } from "@/types/canvas";
import React, {
  useRef,
  useEffect,
  useState,
  MutableRefObject,
  ElementRef,
} from "react";

type Props = {
  svgRef: SVGElement | null;
  camera: Camera;
};

const MiniMap = ({ svgRef, camera }: Props) => {
  const [firstPaint, setFirstPaint] = useState(false);
  const miniMapRef = useRef<ElementRef<"svg">>(null);

  const [viewBox, setViewBox] = useState("0 0 200 100");
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef) return;
    const handleSVGChange = () => {
      // Obtiene todos los elementos dentro del SVG
      const svgElements = svgRef.getElementsByTagName("*");

      // Calcula la caja delimitadora que rodea todos los elementos
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (let i = 0; i < svgElements.length; i++) {
        const rect = svgElements[i].getBoundingClientRect();
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.right);
        maxY = Math.max(maxY, rect.bottom);
      }

      // Ajusta la vista del mini mapa para incluir la caja delimitadora con una pequeña margen
      const margin = 10;
      const viewBoxValue = `${minX - margin} ${minY - margin} ${
        maxX - minX + margin * 2
      } ${maxY - minY + margin * 2}`;

      // Recupera el contenido del SVG principal
      // if (!firstPaint) {
      setViewBox(viewBoxValue);
      // setFirstPaint(true);
      const svgContent = svgRef.outerHTML;
      if (miniMapRef.current) {
        miniMapRef.current.innerHTML = svgContent;
      }
      // }

      // Calcula y actualiza la posición de la cámara en coordenadas de mini mapa
      const svgRect = svgRef.getBoundingClientRect();
      const miniMapRect = miniMapRef.current?.getBoundingClientRect();
      if (!miniMapRect) return;
      setCameraPosition({
        x:
          (svgRect.x - minX + margin) *
          (miniMapRect.width / (maxX - minX + margin * 2)),
        y:
          (svgRect.y - minY + margin) *
          (miniMapRect.height / (maxY - minY + margin * 2)),
      });
    };
    // handleSVGChange();
    // Agrega un escucha de eventos al SVG principal (por ejemplo, eventos de desplazamiento o zoom)
    svgRef.addEventListener("scroll", handleSVGChange);
    svgRef.addEventListener("wheel", handleSVGChange);
    if (!firstPaint) {
      handleSVGChange();
    }
    // Limpia el escucha de eventos cuando el componente se desmonta
    return () => {
      svgRef.removeEventListener("scroll", handleSVGChange);
      svgRef.removeEventListener("wheel", handleSVGChange);
    };
  }, [firstPaint, svgRef]);

  return (
    <div
      style={{ position: "relative" }}
      className=" relative  size-40 overflow-hidden"
    >
      <svg
        viewBox={viewBox}
        ref={miniMapRef}
        style={{
          position: "absolute",
          bottom: "0",
          width: "100%",
          height: "100%",
          overflow: "hidden", // Evita que el contenido sobresalga
          border: "1px solid red",
        }}
      >
        {/* Resalta la posición de la cámara */}
      </svg>
      <div
        className="bg-white/50 backdrop-blur-sm"
        style={{
          position: "absolute",
          left: `${cameraPosition.x}%`,
          top: `${cameraPosition.y}%`,
          transform: "translate(-50%, -50%)",
          width: "50px",
          height: "50px",
        }}
      />
    </div>
  );
};

export default MiniMap;
